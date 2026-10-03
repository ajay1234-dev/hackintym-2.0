"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { Team } from "@/types";
import { soundManager } from "@/lib/utils";

interface VintageGameBoardCeremonyProps {
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const VintageGameBoardCeremony: React.FC<VintageGameBoardCeremonyProps> = ({
  teams,
  isOpen,
  onClose,
  title = "VINTAGE ARCADE SCORE REVEAL",
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [activeRollingScore, setActiveRollingScore] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Sort teams from LEAST score up to RANK 1 (highest score last)
  const orderedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreA !== scoreB) {
        return scoreA - scoreB; // Ascending: lowest first, highest last
      }
      return (b.rank || 999) - (a.rank || 999);
    });
  }, [teams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset ceremony state when opened
  useEffect(() => {
    if (isOpen && orderedTeams.length > 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
      setIsFinished(false);
      setRevealedIds(new Set());
      setActiveRollingScore(0);
    }
  }, [isOpen, orderedTeams]);

  // Handle active team rolling numbers animation
  const currentTeam = orderedTeams[currentIndex] || null;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !currentTeam) return;

    const targetScore = currentTeam.score || 0;
    setIsRolling(true);
    const startScore = Math.max(0, targetScore - Math.min(250, targetScore));
    setActiveRollingScore(startScore);

    const duration = 1200; // ms
    const startTime = performance.now();
    let lastTickTime = 0;

    const animateRoll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out expo for arcade feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -8 * progress);
      const val = Math.round(startScore + (targetScore - startScore) * ease);
      setActiveRollingScore(val);

      // Play rapid mechanical tick every 60ms
      if (currentTime - lastTickTime > 65) {
        soundManager.playMechanicalTick();
        lastTickTime = currentTime;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateRoll);
      } else {
        setActiveRollingScore(targetScore);
        setIsRolling(false);
        setRevealedIds((prev) => new Set(prev).add(currentTeam.id || currentTeam.teamId));

        const isLastTeam = currentIndex === orderedTeams.length - 1;
        const isRank1 = currentTeam.rank === 1 || isLastTeam;

        if (isRank1) {
          // Rank 1 Grand Fanfare & Confetti Explosion!
          soundManager.playVictoryFanfare();
          try {
            confetti({
              particleCount: 160,
              spread: 100,
              origin: { y: 0.55 },
              colors: ["#fbbf24", "#f59e0b", "#38bdf8", "#ec4899", "#10b981"],
            });
          } catch {
            // ignore
          }
        } else {
          soundManager.playVintageChime();
        }

        // Auto-advance if playing
        if (isPlaying && !isLastTeam) {
          timerRef.current = setTimeout(() => {
            setCurrentIndex((idx) => idx + 1);
          }, 1800);
        } else if (isLastTeam) {
          setIsFinished(true);
          setIsPlaying(false);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animateRoll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isOpen, currentTeam, isPlaying, orderedTeams.length]);

  const handleNext = () => {
    if (currentIndex < orderedTeams.length - 1) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const handleFastRevealAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const allIds = new Set(orderedTeams.map((t) => t.id || t.teamId));
    setRevealedIds(allIds);
    setCurrentIndex(orderedTeams.length - 1);
    setIsFinished(true);
    setIsPlaying(false);
    soundManager.playVictoryFanfare();
    try {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRevealedIds(new Set());
    setCurrentIndex(0);
    setIsFinished(false);
    setIsPlaying(true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || orderedTeams.length === 0) return null;

  const isCurrentRank1 = currentTeam?.rank === 1 || currentIndex === orderedTeams.length - 1;
  const isCurrentTop3 = currentTeam?.rank != null && currentTeam.rank <= 3;
  const progressPercent = Math.round(((currentIndex + 1) / orderedTeams.length) * 100);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 backdrop-blur-xl text-white overflow-hidden animate-fadeIn select-none font-sans">
      {/* Retro CRT Scanline Overlay */}
      <div className="vintage-crt-scanlines absolute inset-0 z-10 pointer-events-none opacity-40" />

      {/* Ambient Arcade Glowing Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* TOP ARCADE MARQUEE HEADER */}
      <header className="relative z-20 px-4 sm:px-8 py-3.5 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
            <i className="bi bi-joystick text-xl" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 font-display uppercase">
              {title}
            </h2>
            <p className="text-[11px] text-cyan-400 font-mono-numbers tracking-widest flex items-center gap-2">
              <span>● ARCADE LIVE REVEAL</span>
              <span className="opacity-50">•</span>
              <span>ASCENDING SCORE SEQUENCE</span>
            </p>
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-mono-numbers font-black text-slate-300">
              TEAM {currentIndex + 1} / {orderedTeams.length}
            </span>
            <div className="w-28 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <i className="bi bi-x-lg" />
            <span className="hidden sm:inline">Exit Ceremony</span>
          </button>
        </div>
      </header>

      {/* MAIN GAME BOARD STAGE */}
      <main className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-8 gap-6 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* LEFT / CENTER: FEATURED ACTIVE TEAM CARD (ARCADE SHOWCASE) */}
        <div className="w-full lg:flex-1 flex flex-col items-center">
          {currentTeam && (
            <div
              className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border transition-all duration-500 relative overflow-hidden ${
                isCurrentRank1
                  ? "bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)]"
                  : isCurrentTop3
                  ? "bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]"
                  : "bg-slate-950/90 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              }`}
            >
              {/* Corner Neon Arcade Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/80 rounded-br-xl" />

              {/* Top Card Badge: Rank & Status */}
              <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black font-mono-numbers tracking-wider border flex items-center gap-1.5 ${
                      isCurrentRank1
                        ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                        : isCurrentTop3
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm"
                        : "bg-slate-900 text-slate-300 border-slate-800"
                    }`}
                  >
                    {isCurrentRank1 ? (
                      <>
                        <i className="bi bi-trophy-fill" /> #1 GRAND CHAMPION
                      </>
                    ) : (
                      <>
                        <i className="bi bi-award-fill" /> RANK #{currentTeam.rank || currentIndex + 1}
                      </>
                    )}
                  </span>

                  <span className="text-xs font-mono-numbers font-bold text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
                    {currentTeam.teamId}
                  </span>
                </div>

                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/30 flex items-center gap-1.5">
                  <i className="bi bi-tag-fill text-[11px]" />
                  {currentTeam.track || "General Track"}
                </span>
              </div>

              {/* Team Profile & Details */}
              <div className="flex items-center gap-4 sm:gap-5 mb-6">
                {currentTeam.avatar ? (
                  <img
                    src={currentTeam.avatar}
                    alt={currentTeam.teamName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-xl shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-xl font-mono-numbers shrink-0 shadow-lg">
                    {currentTeam.teamName.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight truncate">
                    {currentTeam.teamName}
                  </h3>
                  {currentTeam.tagline && (
                    <p className="text-xs sm:text-sm text-cyan-300/90 italic font-sans truncate mt-1">
                      &ldquo;{currentTeam.tagline}&rdquo;
                    </p>
                  )}
                  {currentTeam.members && currentTeam.members.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1 font-sans flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold">👑 Leader:</span>
                      <span className="text-slate-200">{currentTeam.members[0]}</span>
                      {currentTeam.members.length > 1 && (
                        <span className="text-slate-500">
                          (+{currentTeam.members.length - 1} more)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* GIANT VINTAGE RAPID SCORE COUNTER */}
              <div className="my-6 py-6 px-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden shadow-inner">
                {/* Score Header */}
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-display mb-1 flex items-center justify-center gap-2">
                  <i className="bi bi-speedometer2 text-cyan-400" />
                  <span>TOTAL EVENT SCORE</span>
                </div>

                {/* Score Number Display */}
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`text-5xl sm:text-7xl font-mono-numbers font-black tracking-tight ${
                      isRolling
                        ? "vintage-score-rolling scale-110 text-cyan-300"
                        : isCurrentRank1
                        ? "vintage-score-champion text-amber-300"
                        : "text-white"
                    }`}
                  >
                    {activeRollingScore.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono-numbers text-slate-500 self-end mb-2 uppercase">
                    PTS
                  </span>
                </div>

                {/* Rolling Indicator */}
                <div className="mt-2 text-xs font-mono-numbers tracking-widest">
                  {isRolling ? (
                    <span className="text-cyan-400 animate-pulse flex items-center justify-center gap-1.5">
                      <i className="bi bi-arrow-repeat animate-spin text-xs" />
                      CALCULATING SCORE ROLL...
                    </span>
                  ) : isCurrentRank1 ? (
                    <span className="text-amber-300 font-bold tracking-widest flex items-center justify-center gap-1.5">
                      🏆 GRAND LEADERBOARD CHAMPION!
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold tracking-widest">
                      ✓ SCORE LOCKED IN
                    </span>
                  )}
                </div>
              </div>

              {/* REVIEW BREAKDOWN TILES */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="block text-[10px] font-bold text-sky-400 uppercase font-display">
                    Review 1
                  </span>
                  <span className="text-base sm:text-lg font-mono-numbers font-black text-white">
                    {currentTeam.review1Score || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="block text-[10px] font-bold text-violet-400 uppercase font-display">
                    Review 2
                  </span>
                  <span className="text-base sm:text-lg font-mono-numbers font-black text-white">
                    {currentTeam.review2Score || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="block text-[10px] font-bold text-emerald-400 uppercase font-display">
                    Review 3
                  </span>
                  <span className="text-base sm:text-lg font-mono-numbers font-black text-white">
                    {currentTeam.review3Score || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: VINTAGE ARCADE LEADERBOARD REEL */}
        <div className="w-full lg:w-96 rounded-3xl bg-slate-950/80 border border-slate-800 p-4 sm:p-5 flex flex-col max-h-[460px] lg:max-h-[580px] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
            <span className="text-xs font-black uppercase text-slate-300 font-display flex items-center gap-1.5">
              <i className="bi bi-list-stars text-amber-400" />
              Ceremony Board Reel
            </span>
            <span className="text-[10px] font-mono-numbers text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              {revealedIds.size} / {orderedTeams.length} Revealed
            </span>
          </div>

          {/* List of Teams Reel */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {orderedTeams.map((team, idx) => {
              const isRevealed = revealedIds.has(team.id || team.teamId);
              const isActive = idx === currentIndex;
              const isTeamRank1 = team.rank === 1 || idx === orderedTeams.length - 1;

              return (
                <div
                  key={team.id || team.teamId}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-950/50 scale-[1.02]"
                      : isRevealed
                      ? isTeamRank1
                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                      : "bg-slate-950/60 border-slate-900 text-slate-600 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono-numbers font-bold text-[11px] shrink-0 text-slate-400">
                      {isRevealed ? `#${team.rank || idx + 1}` : "?"}
                    </span>
                    <span className="font-bold truncate font-display">
                      {team.teamName}
                    </span>
                  </div>

                  <div className="font-mono-numbers font-black shrink-0 text-right">
                    {isRevealed ? (
                      <span className={isTeamRank1 ? "text-amber-300" : "text-white"}>
                        {team.score}
                      </span>
                    ) : (
                      <span className="text-slate-600">???</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* BOTTOM RETRO ARCADE CONTROL BAR */}
      <footer className="relative z-20 px-4 sm:px-8 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50"
          >
            {isPlaying ? (
              <>
                <i className="bi bi-pause-fill text-base" /> Pause
              </>
            ) : (
              <>
                <i className="bi bi-play-fill text-base" /> Resume
              </>
            )}
          </button>

          {/* Previous Team */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-40"
            title="Previous Team"
          >
            <i className="bi bi-chevron-left" />
          </button>

          {/* Next Team */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= orderedTeams.length - 1}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-40"
            title="Next Team"
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>

        {/* Replay & Fast Forward */}
        <div className="flex items-center gap-2">
          {isFinished && (
            <button
              onClick={handleReplay}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <i className="bi bi-arrow-counterclockwise" /> Replay Ceremony
            </button>
          )}

          <button
            onClick={handleFastRevealAll}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <i className="bi bi-lightning-charge-fill text-amber-400" />
            <span className="hidden sm:inline">Reveal All</span>
          </button>

          <button
            onClick={() => soundManager.toggleSound()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Toggle Sound"
          >
            <i
              className={`bi ${
                soundManager.isEnabled() ? "bi-volume-up-fill text-cyan-400" : "bi-volume-mute-fill"
              }`}
            />
          </button>
        </div>
      </footer>
    </div>,
    document.body
  );
};
