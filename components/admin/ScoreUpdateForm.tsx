"use client";

import React, { useState } from "react";
import { Team } from "@/types";
import { updateTeamScore } from "@/lib/firebase/firestore";
import { soundManager } from "@/lib/utils";

interface ScoreUpdateFormProps {
  teams: Team[];
  onNotification?: (msg: string) => void;
}

export const ScoreUpdateForm: React.FC<ScoreUpdateFormProps> = ({
  teams,
  onNotification,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [scoreValue, setScoreValue] = useState<string>("");
  const [pointsValue, setPointsValue] = useState<string>("");
  const [reasonNote, setReasonNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedTeam = teams.find(
    (t) => t.id === selectedTeamId || t.teamId === selectedTeamId
  );

  const handleSelectTeam = (id: string) => {
    setSelectedTeamId(id);
    const t = teams.find((item) => item.id === id || item.teamId === id);
    if (t) {
      setScoreValue(String(t.score));
      setPointsValue(String(t.points));
    }
  };

  const handleQuickAddScore = (delta: number) => {
    const current = Number(scoreValue) || (selectedTeam?.score || 0);
    const newScore = Math.max(0, current + delta);
    setScoreValue(String(newScore));

    const newPoints = Math.round(newScore / 10);
    setPointsValue(String(newPoints));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert("Please select a team to update.");
      return;
    }

    const newScore = Number(scoreValue);
    const newPoints = Number(pointsValue);

    if (isNaN(newScore) || isNaN(newPoints)) {
      alert("Please enter valid numeric scores and points.");
      return;
    }

    setIsSubmitting(true);
    try {
      const note =
        reasonNote.trim() ||
        `${selectedTeam?.teamName || "Team"} score updated to ${newScore}`;

      await updateTeamScore(selectedTeamId, newScore, newPoints, note);
      soundManager.playScoreUpdate();

      const success = `Successfully updated ${selectedTeam?.teamName || "Team"} to ${newScore} score (${newPoints} points)!`;
      setSuccessMsg(success);
      if (onNotification) onNotification(success);

      setReasonNote("");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to update team score.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl cyber-card border border-slate-800 p-6 sm:p-7 shadow-2xl">
      
      {/* Title */}
      <div className="flex items-center gap-3 mb-6 font-display">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
          <i className="bi bi-fire text-lg" />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-wide text-white">
            Live Judge Score Adjustment
          </h3>
          <p className="text-xs text-slate-400">Instantly update scores and points for any team</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-md">
          <i className="bi bi-check-circle-fill text-base shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        
        {/* Select Team */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Select Team
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => handleSelectTeam(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-rose-500/60 text-white text-xs sm:text-sm focus:outline-none shadow-sm"
            required
          >
            <option value="">-- Choose a team from roster --</option>
            {teams.map((team) => (
              <option key={team.id || team.teamId} value={team.id || team.teamId}>
                #{team.rank || "-"} {team.teamName} — Current Score: {team.score}
              </option>
            ))}
          </select>
        </div>

        {selectedTeam && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between shadow-inner">
            <span>
              Current: <strong className="text-white font-mono-numbers">{selectedTeam.score}</strong> score,{" "}
              <strong className="text-cyan-400 font-mono-numbers">{selectedTeam.points}</strong> pts
            </span>
            <span className="text-slate-400 font-sans font-medium">
              Track: {selectedTeam.track || "General"}
            </span>
          </div>
        )}

        {/* Quick Delta Buttons */}
        {selectedTeam && (
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-display">
              Quick Add Score Points (+):
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[+10, +25, +50, +100, -10].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => handleQuickAddScore(delta)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono-numbers transition-all shadow-sm ${
                    delta > 0
                      ? "bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-cyan-400"
                      : "bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-rose-400"
                  }`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Score & Points Input Fields */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Score (Total)
            </label>
            <input
              type="number"
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              placeholder="e.g. 950"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-rose-500/60 text-white font-mono-numbers text-sm focus:outline-none shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
              Points
            </label>
            <input
              type="number"
              value={pointsValue}
              onChange={(e) => setPointsValue(e.target.value)}
              placeholder="e.g. 95"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500/60 text-white font-mono-numbers text-sm focus:outline-none shadow-sm"
              required
            />
          </div>
        </div>

        {/* Reason / Milestone Note */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-display">
            Activity Reason / Evaluation Note (Optional)
          </label>
          <input
            type="text"
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder="e.g. Milestone 2 Demo evaluation + code quality bonus"
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500/60 text-white text-xs sm:text-sm focus:outline-none placeholder-slate-600 shadow-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedTeamId}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 hover:from-rose-600 hover:to-cyan-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-display mt-2"
        >
          <i className="bi bi-send-fill text-sm" />
          <span>{isSubmitting ? "UPDATING FIRESTORE..." : "UPDATE TEAM SCORE"}</span>
        </button>

      </form>
    </div>
  );
};
