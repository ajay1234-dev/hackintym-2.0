"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { Team } from "@/types";
import { soundManager } from "@/lib/utils";
import { CasioScoreScrambler } from "@/components/dashboard/CasioScoreScrambler";
import { updateTeam } from "@/lib/firebase/firestore";

interface CasioPublishingModalProps {
  isOpen: boolean;
  reviewNum: 1 | 2 | 3;
  scores: Record<string, string>; // raw input values from panel
  teams: Team[];
  onClose: () => void;
  onFinished: () => void;
}

interface CeremonyTeamItem {
  team: Team;
  newReviewScore: number;
  newTotalScore: number;
  isLocked: boolean;
  rank: number;
}

export const CasioPublishingModal: React.FC<CasioPublishingModalProps> = ({
  isOpen,
  reviewNum,
  scores,
  teams,
  onClose,
  onFinished,
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [lockedTeamKeys, setLockedTeamKeys] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute projected scores and sort ASCENDING: Least score first, Highest (Rank 1) last!
  const sequence = useMemo<CeremonyTeamItem[]>(() => {
    const list = teams.map((team) => {
      const key = team.id || team.teamId;
      const reviewVal = Number(scores[key]) || 0;
      
      const r1 = reviewNum === 1 ? reviewVal : (team.review1Score || 0);
      const r2 = reviewNum === 2 ? reviewVal : (team.review2Score || 0);
      const r3 = reviewNum === 3 ? reviewVal : (team.review3Score || 0);
      const total = r1 + r2 + r3;

      return {
        team,
        newReviewScore: reviewVal,
        newTotalScore: total,
        isLocked: false,
        rank: 0,
      };
    });

    // Sort ascending by total score (least to greatest)
    list.sort((a, b) => {
      if (a.newTotalScore !== b.newTotalScore) {
        return a.newTotalScore - b.newTotalScore; // lowest first
      }
      return (a.team.points || 0) - (b.team.points || 0);
    });

    // Assign final ranks in reverse (highest score gets Rank 1)
    const totalCount = list.length;
    return list.map((item, idx) => ({
      ...item,
      rank: totalCount - idx,
    }));
  }, [teams, scores, reviewNum]);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen && sequence.length > 0) {
      setCurrentIndex(0);
      setIsPaused(false);
      setIsFinished(false);
      setLockedTeamKeys(new Set());
    }
  }, [isOpen, sequence]);

  // Step-by-step sequential reveal execution
  useEffect(() => {
    if (!isOpen || isPaused || isFinished || sequence.length === 0) return;

    if (currentIndex >= sequence.length) {
      setIsFinished(true);
      return;
    }

    const currentItem = sequence[currentIndex];
    const teamKey = currentItem.team.id || currentItem.team.teamId;
    const isRank1 = currentIndex === sequence.length - 1;

    // Auto-scroll active card into view
    setTimeout(() => {
      activeRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    // Give 1.5 seconds of high-speed Casio digital number scrambling before locking in
    const scrambleDuration = isRank1 ? 2200 : 1400;

    timerRef.current = setTimeout(async () => {
      // 1. Lock in current team
      setLockedTeamKeys((prev) => new Set(prev).add(teamKey));

      // 2. Play Casio watch beep / victory fanfare
      if (isRank1) {
        soundManager.playCasioBeep();
        setTimeout(() => soundManager.playVictoryFanfare(), 300);
        try {
          confetti({
            particleCount: 180,
            spread: 110,
            origin: { y: 0.55 },
            colors: ["#34d399", "#fbbf24", "#38bdf8", "#f43f5e", "#a855f7"],
          });
        } catch {
          // ignore
        }
      } else {
        soundManager.playCasioBeep();
      }

      // 3. Persist score to Firestore for this team
      try {
        const patch: Record<string, any> = {
          score: currentItem.newTotalScore,
          updatedAt: Date.now(),
        };
        if (reviewNum === 1) patch.review1Score = currentItem.newReviewScore;
        if (reviewNum === 2) patch.review2Score = currentItem.newReviewScore;
        if (reviewNum === 3) patch.review3Score = currentItem.newReviewScore;

        await updateTeam(teamKey, patch);
      } catch (err) {
        console.error("Error updating team during Casio reveal:", err);
      }

      // 4. Advance to next team after brief pause
      if (!isRank1) {
        timerRef.current = setTimeout(() => {
          setCurrentIndex((idx) => idx + 1);
        }, 1100);
      } else {
        setIsFinished(true);
      }
    }, scrambleDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, currentIndex, isPaused, isFinished, sequence, reviewNum]);

  // Fast Instant Publish (reveals all remaining immediately)
  const handleFastInstantPublish = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const allKeys = new Set(sequence.map((item) => item.team.id || item.team.teamId));
    setLockedTeamKeys(allKeys);
    setCurrentIndex(sequence.length - 1);
    setIsFinished(true);

    // Save all to Firestore
    for (const item of sequence) {
      const teamKey = item.team.id || item.team.teamId;
      const patch: Record<string, any> = {
        score: item.newTotalScore,
        updatedAt: Date.now(),
      };
      if (reviewNum === 1) patch.review1Score = item.newReviewScore;
      if (reviewNum === 2) patch.review2Score = item.newReviewScore;
      if (reviewNum === 3) patch.review3Score = item.newReviewScore;
      await updateTeam(teamKey, patch).catch(() => {});
    }

    soundManager.playVictoryFanfare();
    try {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const currentItem = sequence[currentIndex] || null;
  const isCurrentRank1 = currentIndex === sequence.length - 1;

  if (!mounted || !isOpen || sequence.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-[#050907]/95 backdrop-blur-2xl text-slate-100 overflow-hidden animate-fadeIn select-none font-sans">
      {/* Casio LCD Grid Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* CASIO DIGITAL BEZEL MARQUEE HEADER */}
      <header className="relative z-20 px-4 sm:px-8 py-3.5 border-b border-emerald-500/25 bg-[#060c08] flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono-numbers font-black shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            <span className="text-xs">LCD</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-numbers font-bold text-emerald-400 tracking-widest bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                CASIO THEME • DIGITAL SCORE CEREMONY
              </span>
              <span className="text-[10px] font-mono-numbers text-amber-400 font-bold hidden sm:inline">
                WATER RESIST • AUTO-SYNC
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white font-display uppercase mt-0.5">
              Review {reviewNum} Sequential Marks Publishing
            </h2>
          </div>
        </div>

        {/* Progress & Quick Close */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-mono-numbers font-black text-emerald-400">
              REVEALING TEAM {currentIndex + 1} OF {sequence.length}
            </span>
            <div className="w-32 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-300"
                style={{
                  width: `${Math.round(((currentIndex + 1) / sequence.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={() => {
              onFinished();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <i className="bi bi-x-lg text-xs" />
            <span>{isFinished ? "Finish & Close" : "Cancel"}</span>
          </button>
        </div>
      </header>

      {/* CEREMONY BODY: FOCUS STAGE & ASCENDING LEADERBOARD STREAM */}
      <main className="relative z-20 flex-1 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-8 gap-6 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* LEFT / CENTER: CASIO DIGITAL SPOTLIGHT DISPLAY */}
        <div className="w-full lg:flex-1 flex flex-col items-center">
          {currentItem && (
            <div
              className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border transition-all duration-500 relative overflow-hidden ${
                isCurrentRank1
                  ? "bg-[#110e05] border-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.3)]"
                  : "bg-[#070d0a] border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              }`}
            >
              {/* Casio Screws on corners */}
              <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-slate-900" />
              </div>
              <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-slate-900" />
              </div>
              <div className="absolute bottom-3 left-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-slate-900" />
              </div>
              <div className="absolute bottom-3 right-3 w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-slate-900" />
              </div>

              {/* Status Header */}
              <div className="flex items-center justify-between gap-3 mb-5 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black font-mono-numbers tracking-wider border flex items-center gap-1.5 ${
                      isCurrentRank1
                        ? "bg-amber-500 text-slate-950 border-amber-300 font-bold"
                        : "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {isCurrentRank1 ? "👑 #1 GRAND CHAMPION" : `RANK #${currentItem.rank}`}
                  </span>
                  <span className="text-xs font-mono-numbers font-bold text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
                    {currentItem.team.teamId}
                  </span>
                </div>

                <span className="text-xs font-mono-numbers text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                  {lockedTeamKeys.has(currentItem.team.id || currentItem.team.teamId)
                    ? "✓ LOCKED"
                    : "⚡ CASIO FLIPPING..."}
                </span>
              </div>

              {/* Team Info */}
              <div className="flex items-center gap-4 mb-6">
                {currentItem.team.avatar ? (
                  <img
                    src={currentItem.team.avatar}
                    alt={currentItem.team.teamName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xl font-mono-numbers shrink-0">
                    {currentItem.team.teamName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight truncate">
                    {currentItem.team.teamName}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">Category:</span>
                    <span>{currentItem.team.track || "General Track"}</span>
                  </p>
                </div>
              </div>

              {/* CASIO LCD DIGITAL SCORE BOX */}
              <div className="p-6 rounded-2xl casio-lcd-panel text-center relative overflow-hidden mb-6">
                <span className="block text-[10px] font-mono-numbers font-black uppercase tracking-widest text-emerald-500/80 mb-1">
                  CASIO DIGITAL SCORE REGISTER • TOTAL POINTS
                </span>

                <div className="py-2 flex items-center justify-center">
                  <CasioScoreScrambler
                    value={currentItem.newTotalScore}
                    isScrambling={
                      !lockedTeamKeys.has(currentItem.team.id || currentItem.team.teamId)
                    }
                    isChampion={isCurrentRank1}
                    className="text-5xl sm:text-7xl font-mono-numbers font-black"
                    minDigits={3}
                    playSound={true}
                  />
                </div>

                {/* Sub-label */}
                <div className="text-xs font-mono-numbers mt-2 tracking-widest">
                  {lockedTeamKeys.has(currentItem.team.id || currentItem.team.teamId) ? (
                    <span className="text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                      <i className="bi bi-check-circle-fill text-emerald-400" />
                      OFFICIALLY PUBLISHED & RECORDED
                    </span>
                  ) : (
                    <span className="text-emerald-400/90 font-bold animate-pulse flex items-center justify-center gap-1.5">
                      <i className="bi bi-arrow-repeat animate-spin text-xs" />
                      SPEEDILY SCRAMBLING NUMBERS...
                    </span>
                  )}
                </div>
              </div>

              {/* Marks Breakdown Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between text-xs font-mono-numbers">
                <span className="text-slate-400">Review {reviewNum} Added Marks:</span>
                <span className="text-emerald-400 font-black text-sm">
                  +{currentItem.newReviewScore} pts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: SEQUENTIAL ASCENDING REEL (Least -> Rank 1) */}
        <div className="w-full lg:w-96 rounded-3xl bg-[#070d0a]/90 border border-emerald-500/30 p-4 sm:p-5 flex flex-col max-h-[480px] lg:max-h-[580px] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 shrink-0">
            <span className="text-xs font-black uppercase text-emerald-300 font-display flex items-center gap-1.5">
              <i className="bi bi-clock-history" />
              Ascending Reveal Reel (Least → Rank 1)
            </span>
            <span className="text-[10px] font-mono-numbers text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              {lockedTeamKeys.size} / {sequence.length} Done
            </span>
          </div>

          {/* Reel List with Smooth Auto-Scroll */}
          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {sequence.map((item, idx) => {
              const teamKey = item.team.id || item.team.teamId;
              const isLocked = lockedTeamKeys.has(teamKey);
              const isActive = idx === currentIndex;
              const isRank1 = idx === sequence.length - 1;

              return (
                <div
                  key={teamKey}
                  ref={isActive ? activeRowRef : null}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    isActive
                      ? "bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-950/60 scale-[1.02]"
                      : isLocked
                      ? isRank1
                        ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                        : "bg-[#09140e] border-emerald-500/20 text-slate-300"
                      : "bg-slate-950/60 border-slate-900 text-slate-600 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono-numbers font-bold text-[11px] shrink-0 text-emerald-400">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold truncate font-display block">
                        {item.team.teamName}
                      </span>
                      <span className="text-[10px] font-mono-numbers text-slate-500">
                        {isRank1 ? "Finalist Rank 1" : `Ascending #${idx + 1}`}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono-numbers font-black shrink-0 text-right">
                    {isLocked ? (
                      <span className={isRank1 ? "text-amber-300 text-sm" : "text-emerald-400 text-sm"}>
                        {item.newTotalScore}
                      </span>
                    ) : (
                      <CasioScoreScrambler
                        value={item.newTotalScore}
                        isScrambling={true}
                        className="text-xs text-emerald-600"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* CASIO BOTTOM CONTROL BAR */}
      <footer className="relative z-20 px-4 sm:px-8 py-3.5 border-t border-emerald-500/20 bg-[#060c08] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused((p) => !p)}
            disabled={isFinished}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50"
          >
            {isPaused ? (
              <>
                <i className="bi bi-play-fill text-base" /> Resume Ceremony
              </>
            ) : (
              <>
                <i className="bi bi-pause-fill text-base" /> Pause
              </>
            )}
          </button>

          {/* Step Next */}
          <button
            onClick={() => {
              if (currentIndex < sequence.length - 1) {
                if (timerRef.current) clearTimeout(timerRef.current);
                setCurrentIndex((i) => i + 1);
              }
            }}
            disabled={currentIndex >= sequence.length - 1 || isFinished}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold transition-all disabled:opacity-40"
          >
            <span>Next Team →</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast Instant Publish */}
          {!isFinished && (
            <button
              onClick={handleFastInstantPublish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
            >
              <i className="bi bi-lightning-charge-fill text-amber-400" />
              <span>Instant Publish All</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => soundManager.toggleSound()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Toggle Sound"
          >
            <i
              className={`bi ${
                soundManager.isEnabled() ? "bi-volume-up-fill text-emerald-400" : "bi-volume-mute-fill"
              }`}
            />
          </button>
        </div>
      </footer>
    </div>,
    document.body
  );
};
