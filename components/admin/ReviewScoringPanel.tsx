"use client";

import React, { useState, useEffect, useRef } from "react";
import { Team } from "@/types";
import { bulkPublishReviewScores } from "@/lib/firebase/firestore";
import { VintageGameBoardCeremony } from "@/components/dashboard/VintageGameBoardCeremony";
import { CasioPublishingModal } from "./CasioPublishingModal";

type ReviewNum = 1 | 2 | 3;

interface ReviewScoringPanelProps {
  teams: Team[];
  onNotification?: (msg: string) => void;
}

export const ReviewScoringPanel: React.FC<ReviewScoringPanelProps> = ({
  teams,
  onNotification,
}) => {
  const [activeReview, setActiveReview] = useState<ReviewNum>(1);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState<ReviewNum[]>([]);
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);
  const [isCasioPublishOpen, setIsCasioPublishOpen] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Pre-fill inputs from existing team review scores when team list or active review changes
  useEffect(() => {
    const key = `review${activeReview}Score` as keyof Team;
    const prefilled: Record<string, string> = {};
    teams.forEach((t) => {
      const id = t.id || t.teamId;
      const existing = t[key];
      prefilled[id] = existing != null && (existing as number) > 0
        ? String(existing)
        : scores[id] || "";
    });
    setScores(prefilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams, activeReview]);

  const setScore = (teamId: string, val: string) => {
    setScores((prev) => ({ ...prev, [teamId]: val }));
  };

  const handlePublish = async () => {
    // Build numeric scores map
    const numericScores: Record<string, number> = {};
    for (const [id, val] of Object.entries(scores)) {
      numericScores[id] = Number(val) || 0;
    }

    setIsPublishing(true);
    try {
      await bulkPublishReviewScores(activeReview, numericScores);
      if (!published.includes(activeReview)) setPublished((p) => [...p, activeReview]);
      const msg = `Review ${activeReview} scores published — leaderboard updated instantly!`;
      onNotification?.(msg);
    } catch (err) {
      console.error(err);
      onNotification?.("Error publishing scores. Check console.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFillAll = (value: number) => {
    const filled: Record<string, string> = {};
    teams.forEach((t) => {
      filled[t.id || t.teamId] = String(value);
    });
    setScores(filled);
  };

  const totalFilled = Object.values(scores).filter((v) => v !== "" && v !== "0").length;
  const reviewKey = `review${activeReview}Score` as keyof Team;

  const tabs: ReviewNum[] = [1, 2, 3];

  return (
    <div className="rounded-2xl border border-slate-800 cyber-card shadow-2xl overflow-hidden">

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
              Set scores per review — publish to update all teams at once
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
            onClick={() => setActiveReview(r)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all font-display flex items-center justify-center gap-1.5 ${
              activeReview === r
                ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-400"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
            }`}
          >
            <i className={`bi bi-${r === 1 ? "1" : r === 2 ? "2" : "3"}-circle-fill text-sm`} />
            Review {r}
            {published.includes(r) && (
              <i className="bi bi-check-circle-fill text-emerald-400 text-xs" />
            )}
          </button>
        ))}
      </div>

      {/* Score Table */}
      <div className="p-4 sm:p-5">

        {teams.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center text-slate-500 gap-2">
            <i className="bi bi-people text-2xl" />
            <p className="text-xs">No teams yet. Add teams first.</p>
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
                {[0, 100, 200].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleFillAll(v)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono-numbers transition-all"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Team score rows */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {teams.map((team) => {
                const id = team.id || team.teamId;
                const existingVal = team[reviewKey] as number | undefined;
                const inputVal = scores[id] ?? "";
                const hasExisting = existingVal != null && existingVal > 0;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all"
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
                        onClick={() => setScore(id, String(Math.max(0, (Number(inputVal) || 0) - 10)))}
                        className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:border-rose-500/50 transition-all flex items-center justify-center"
                      >
                        <i className="bi bi-dash text-sm" />
                      </button>
                      <input
                        ref={(el) => { inputRefs.current[id] = el; }}
                        type="number"
                        min={0}
                        value={inputVal}
                        onChange={(e) => setScore(id, e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-400/60 text-white font-mono-numbers text-sm text-center focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setScore(id, String((Number(inputVal) || 0) + 10))}
                        className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition-all flex items-center justify-center"
                      >
                        <i className="bi bi-plus text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Publish & Vintage Game Board Ceremony Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCasioPublishOpen(true)}
                disabled={isPublishing || teams.length === 0}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-display"
                title="Cinematic Casio digital scoring ceremony revealing scores ascending from least to Rank 1"
              >
                <i className="bi bi-clock-history text-sm" />
                <span>Publish Review {activeReview} (Casio Sequential Scoring)</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || teams.length === 0}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm font-display disabled:opacity-40"
                title="Publish all entered scores immediately without animation"
              >
                {isPublishing ? (
                  <i className="bi bi-arrow-repeat animate-spin text-sm" />
                ) : (
                  <i className="bi bi-lightning-fill text-amber-400 text-sm" />
                )}
                <span>Instant Save</span>
              </button>
            </div>

            {/* Score totals hint */}
            <p className="mt-2 text-center text-[10px] text-slate-500 font-sans">
              Casio scoring mode flips random numbers at high speed and reveals marks sequentially from least to Rank 1
            </p>
          </>
        )}
      </div>

      {/* CASIO DIGITAL SEQUENTIAL PUBLISHING CEREMONY */}
      <CasioPublishingModal
        isOpen={isCasioPublishOpen}
        reviewNum={activeReview}
        scores={scores}
        teams={teams}
        onClose={() => setIsCasioPublishOpen(false)}
        onFinished={() => {
          if (!published.includes(activeReview)) setPublished((p) => [...p, activeReview]);
          onNotification?.(`Review ${activeReview} scores published with Casio digital scoring ceremony!`);
        }}
      />

      {/* VINTAGE GAME BOARD SCORING CEREMONY MODAL */}
      <VintageGameBoardCeremony
        teams={teams}
        isOpen={isCeremonyOpen}
        onClose={() => setIsCeremonyOpen(false)}
        title={`REVIEW ${activeReview} • VINTAGE GAME BOARD CEREMONY`}
      />
    </div>
  );
};
