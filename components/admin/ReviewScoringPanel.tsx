"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Team, PublishingSession } from "@/types";
import {
  bulkPublishReviewScores,
  startLivePublishingSession,
  advanceLivePublishingSession,
  fastForwardLivePublishingSession,
  cancelLivePublishingSession,
  subscribeToHackathonConfig,
} from "@/lib/firebase/firestore";
import { soundManager } from "@/lib/utils";

type ReviewNum = 1 | 2 | 3;

interface ReviewScoringPanelProps {
  teams: Team[];
  onNotification?: (msg: string) => void;
}

interface ProjectedTeam {
  teamId: string;
  team: Team;
  reviewVal: number;
  projectedTotal: number;
}

export const ReviewScoringPanel: React.FC<ReviewScoringPanelProps> = ({
  teams,
  onNotification,
}) => {
  const [activeReview, setActiveReview] = useState<ReviewNum>(1);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [isInstantSaving, setIsInstantSaving] = useState(false);
  const [published, setPublished] = useState<ReviewNum[]>([]);
  const [activeSession, setActiveSession] = useState<PublishingSession | null>(null);
  const [isLiveRunning, setIsLiveRunning] = useState(false);
  const [sequenceList, setSequenceList] = useState<ProjectedTeam[]>([]);
  const [currentSeqIdx, setCurrentSeqIdx] = useState(0);

  const runnerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Subscribe to config to know if a publishing session is in progress
  useEffect(() => {
    return subscribeToHackathonConfig((config) => {
      setActiveSession(config.publishingSession || null);
    });
  }, []);

  // Pre-fill inputs from existing team review scores when team list or active review changes
  useEffect(() => {
    const key = `review${activeReview}Score` as keyof Team;
    const prefilled: Record<string, string> = {};
    teams.forEach((t) => {
      const id = t.id || t.teamId;
      const existing = t[key];
      prefilled[id] =
        existing != null && (existing as number) > 0
          ? String(existing)
          : scores[id] || "";
    });
    setScores(prefilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, activeReview]);

  const setScore = (teamId: string, val: string) => {
    setScores((prev) => ({ ...prev, [teamId]: val }));
  };

  const handleFillAll = (value: number) => {
    const filled: Record<string, string> = {};
    teams.forEach((t) => {
      filled[t.id || t.teamId] = String(value);
    });
    setScores(filled);
  };

  // 1. Instant Save fallback
  const handleInstantSave = async () => {
    const numericScores: Record<string, number> = {};
    for (const [id, val] of Object.entries(scores)) {
      numericScores[id] = Number(val) || 0;
    }

    setIsInstantSaving(true);
    try {
      await bulkPublishReviewScores(activeReview, numericScores);
      if (!published.includes(activeReview)) setPublished((p) => [...p, activeReview]);
      onNotification?.(`Review ${activeReview} scores published instantly!`);
    } catch (err) {
      console.error(err);
      onNotification?.("Error publishing scores. Check console.");
    } finally {
      setIsInstantSaving(false);
    }
  };

  // 2. Start Live Scoreboard Sequential Reveal (Least to Rank 1)
  const handleStartLivePublish = async () => {
    if (teams.length === 0 || isLiveRunning) return;

    // Build numeric scores map
    const numericScores: Record<string, number> = {};
    for (const [id, val] of Object.entries(scores)) {
      numericScores[id] = Number(val) || 0;
    }

    // Build projected totals for each team
    const projected: ProjectedTeam[] = teams.map((team) => {
      const key = team.id || team.teamId;
      const val = Number(scores[key]) || 0;
      const r1 = activeReview === 1 ? val : (team.review1Score || 0);
      const r2 = activeReview === 2 ? val : (team.review2Score || 0);
      const r3 = activeReview === 3 ? val : (team.review3Score || 0);
      const projectedTotal = r1 + r2 + r3;
      return { teamId: key, team, reviewVal: val, projectedTotal };
    });

    // Sort ASCENDING: lowest projected total first, highest (Rank 1) last!
    projected.sort((a, b) => {
      if (a.projectedTotal !== b.projectedTotal) {
        return a.projectedTotal - b.projectedTotal;
      }
      return (a.team.points || 0) - (b.team.points || 0);
    });

    const sequence = projected.map((item) => item.teamId);

    setIsLiveRunning(true);
    isCancelledRef.current = false;
    setSequenceList(projected);
    setCurrentSeqIdx(0);

    // Broadcast session start to Firestore & local storage
    await startLivePublishingSession(activeReview, numericScores, sequence);

    // Play initial scramble ticks
    soundManager.playCasioScrambleTick();

    // Step-by-step runner with ~1-second flip and ~1-second lock-in gap
    let idx = 0;

    const runNextStep = () => {
      if (isCancelledRef.current) return;

      if (idx >= projected.length) {
        // All teams finished!
        setIsLiveRunning(false);
        if (!published.includes(activeReview)) setPublished((p) => [...p, activeReview]);
        onNotification?.(`Review ${activeReview} scores published successfully on the live scoreboard!`);
        return;
      }

      const currentItem = projected[idx];
      const isLast = idx === projected.length - 1;

      // Give 1 second for Casio numbers to rapidly flip before snapping
      runnerTimerRef.current = setTimeout(async () => {
        if (isCancelledRef.current) return;

        // Lock in this team's score in Firestore & session
        await advanceLivePublishingSession(currentItem.teamId, activeReview, currentItem.reviewVal);

        if (isLast) {
          // Rank 1 Champion lock-in: Casio beep + Victory Fanfare + Confetti
          soundManager.playCasioBeep();
          setTimeout(() => soundManager.playVictoryFanfare(), 300);
          try {
            confetti({
              particleCount: 180,
              spread: 120,
              origin: { y: 0.55 },
              colors: ["#fbbf24", "#38bdf8", "#34d399", "#f43f5e", "#a855f7"],
            });
          } catch {
            // ignore
          }
          setIsLiveRunning(false);
          if (!published.includes(activeReview)) setPublished((p) => [...p, activeReview]);
          onNotification?.(`Review ${activeReview} scores published successfully on the live scoreboard!`);
        } else {
          // Intermediate team lock-in: authentic Casio dual-beep
          soundManager.playCasioBeep();
          idx++;
          setCurrentSeqIdx(idx);

          // 1-second gap before locking in the next team
          runnerTimerRef.current = setTimeout(() => {
            runNextStep();
          }, 1000);
        }
      }, 1100);
    };

    // Kick off first step
    runNextStep();
  };

  const handleFastForward = async () => {
    isCancelledRef.current = true;
    if (runnerTimerRef.current) clearTimeout(runnerTimerRef.current);
    await fastForwardLivePublishingSession();
    setIsLiveRunning(false);
    if (!published.includes(activeReview)) setPublished((p) => [...p, activeReview]);
    soundManager.playVictoryFanfare();
    try {
      confetti({ particleCount: 200, spread: 130, origin: { y: 0.55 } });
    } catch {
      // ignore
    }
    onNotification?.(`All Review ${activeReview} scores published immediately!`);
  };

  const handleCancelLivePublish = async () => {
    isCancelledRef.current = true;
    if (runnerTimerRef.current) clearTimeout(runnerTimerRef.current);
    await cancelLivePublishingSession();
    setIsLiveRunning(false);
    onNotification?.("Live publishing session cancelled.");
  };

  const totalFilled = Object.values(scores).filter((v) => v !== "" && v !== "0").length;
  const reviewKey = `review${activeReview}Score` as keyof Team;
  const tabs: ReviewNum[] = [1, 2, 3];

  const currentTeamBeingRevealed = sequenceList[currentSeqIdx] || null;
  const progressPercent = sequenceList.length > 0 ? Math.round(((currentSeqIdx + 1) / sequenceList.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <i className="bi bi-clipboard2-check-fill text-base" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white font-display">
              Review Scoring Panel
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enter review marks and publish live to the scoreboard from least to Rank 1
            </p>
          </div>
        </div>

        {/* Published badges */}
        <div className="flex items-center gap-1.5">
          {tabs.map((r) => (
            <span
              key={r}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono-numbers ${
                published.includes(r)
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              R{r} {published.includes(r) ? "✓" : "—"}
            </span>
          ))}
        </div>
      </div>

      {/* Review Tabs */}
      <div className="flex border-b border-slate-800">
        {tabs.map((r) => (
          <button
            key={r}
            disabled={isLiveRunning}
            onClick={() => setActiveReview(r)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all font-display flex items-center justify-center gap-1.5 disabled:opacity-40 ${
              activeReview === r
                ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-400"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <i className={`bi bi-${r === 1 ? "1" : r === 2 ? "2" : "3"}-circle-fill text-sm`} />
            Review {r}
            {published.includes(r) && (
              <i className="bi bi-check-circle-fill text-emerald-400 text-xs ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Score Table */}
      <div className="p-4 sm:p-5">
        {teams.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center text-slate-500 gap-2">
            <i className="bi bi-people text-2xl" />
            <p className="text-xs">No teams registered yet. Add teams first.</p>
          </div>
        ) : (
          <>
            {/* Quick fill controls */}
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 font-sans">
                <span className="font-bold text-white font-mono-numbers">{totalFilled}</span>
                /{teams.length} teams filled for Review {activeReview}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-display uppercase tracking-wider">Fill all:</span>
                {[0, 10, 20, 50, 100].map((v) => (
                  <button
                    key={v}
                    disabled={isLiveRunning}
                    onClick={() => handleFillAll(v)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono-numbers transition-all disabled:opacity-40"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Team score rows */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {teams.map((team) => {
                const id = team.id || team.teamId;
                const existingVal = team[reviewKey] as number | undefined;
                const inputVal = scores[id] ?? "";
                const hasExisting = existingVal != null && existingVal > 0;
                const isCurrentlyActiveInSession = isLiveRunning && currentTeamBeingRevealed?.teamId === id;

                return (
                  <div
                    key={id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isCurrentlyActiveInSession
                        ? "bg-amber-500/10 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-black text-slate-400 font-mono-numbers">
                      #{team.rank || "—"}
                    </span>

                    {/* Team info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate font-display">{team.teamName}</p>
                      <p className="text-[10px] text-slate-500 font-mono-numbers">
                        {team.teamId} · Current R{activeReview}: {hasExisting ? (
                          <span className="text-amber-400 font-bold">{existingVal}</span>
                        ) : (
                          <span className="text-slate-600">not set</span>
                        )}
                      </p>
                    </div>

                    {/* Score input */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isLiveRunning}
                        onClick={() => setScore(id, String(Math.max(0, (Number(inputVal) || 0) - 5)))}
                        className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:border-rose-500/50 transition-all flex items-center justify-center disabled:opacity-40"
                      >
                        <i className="bi bi-dash text-sm" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        disabled={isLiveRunning}
                        value={inputVal}
                        onChange={(e) => setScore(id, e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400/60 text-white font-mono-numbers text-sm text-center focus:outline-none disabled:opacity-40"
                      />
                      <button
                        type="button"
                        disabled={isLiveRunning}
                        onClick={() => setScore(id, String((Number(inputVal) || 0) + 5))}
                        className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center disabled:opacity-40"
                      >
                        <i className="bi bi-plus text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LIVE PUBLISHING ACTIVE CONTROLLER (Shows directly inside panel without any popup modal!) */}
            {isLiveRunning && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-cyan-500/10 border border-amber-500/40 shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">
                      Publishing to Live Scoreboard (Review {activeReview})
                    </span>
                  </div>
                  <span className="text-xs font-mono-numbers text-slate-400 font-bold">
                    Team {currentSeqIdx + 1} of {sequenceList.length} ({progressPercent}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-3 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Current team banner */}
                <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 mb-3">
                  <span className="truncate">
                    Current: <strong className="text-white">{currentTeamBeingRevealed?.team.teamName}</strong> ({currentTeamBeingRevealed?.teamId})
                  </span>
                  <span className="font-mono-numbers text-amber-400 font-bold shrink-0 ml-2">
                    Score: {currentTeamBeingRevealed?.reviewVal} pts
                  </span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFastForward}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <i className="bi bi-fast-forward-fill" />
                    <span>Fast-Forward All</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelLivePublish}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Publish Action Buttons (when not running) */}
            {!isLiveRunning && (
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartLivePublish}
                  disabled={isInstantSaving || teams.length === 0}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-display"
                  title="Sequential 1-second Casio flip reveal on the live scoreboard from least to Rank 1"
                >
                  <i className="bi bi-broadcast text-sm" />
                  <span>Publish Review {activeReview} (Live Scoreboard Sequence)</span>
                </button>

                <button
                  type="button"
                  onClick={handleInstantSave}
                  disabled={isInstantSaving || teams.length === 0}
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm font-display disabled:opacity-40"
                  title="Publish all entered scores immediately without sequence"
                >
                  {isInstantSaving ? (
                    <i className="bi bi-arrow-repeat animate-spin text-sm" />
                  ) : (
                    <i className="bi bi-lightning-fill text-amber-400 text-sm" />
                  )}
                  <span>Instant Save</span>
                </button>
              </div>
            )}

            {/* Score totals hint */}
            <p className="mt-2 text-center text-[10px] text-slate-500 font-sans">
              Sequential publish flips Casio numbers live on the scoreboard and locks in each team from least to Rank 1 with a 1-second interval
            </p>
          </>
        )}
      </div>
    </div>
  );
};
