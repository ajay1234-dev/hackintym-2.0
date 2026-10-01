"use client";

import React from "react";
import { Team } from "@/types";

interface AdminLeaderboardPreviewProps {
  teams: Team[];
  onSelectTeamForScore?: (teamId: string) => void;
}

export const AdminLeaderboardPreview: React.FC<AdminLeaderboardPreviewProps> = ({
  teams,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 cyber-card shadow-2xl font-sans overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 font-display">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <i className="bi bi-trophy-fill text-base" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-white">
              Live Standings Preview
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Real-time · includes per-review scores
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono-numbers bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          {teams.length} teams
        </span>
      </div>

      {teams.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs px-6">
          <i className="bi bi-trophy text-3xl text-slate-700 mb-3 block" />
          <p className="font-semibold text-slate-300 font-display text-sm">No teams yet.</p>
          <p className="mt-1 text-slate-500">Add teams using the Team Management section.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-display bg-slate-950/50">
                <th className="py-3 px-4 text-center w-14">Rank</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-3 text-center">R1</th>
                <th className="py-3 px-3 text-center">R2</th>
                <th className="py-3 px-3 text-center">R3</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {teams.map((team) => {
                const rank = team.rank;
                const isTop7 = rank != null && rank <= 7;
                return (
                  <tr
                    key={team.id || team.teamId}
                    className={`transition-all ${
                      rank === 1
                        ? "bg-amber-500/8 hover:bg-amber-500/12"
                        : rank === 2
                        ? "bg-slate-800/30 hover:bg-slate-800/50"
                        : rank === 3
                        ? "bg-amber-950/30 hover:bg-amber-950/50"
                        : isTop7
                        ? "hover:bg-slate-900/60"
                        : "opacity-75 hover:opacity-100 hover:bg-slate-950/40"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black font-mono-numbers text-xs border ${
                        !rank ? "bg-slate-900 border-slate-800 text-slate-600 font-semibold"
                        : rank === 1 ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
                        : rank === 2 ? "bg-slate-700/40 border-slate-400/50 text-slate-200"
                        : rank === 3 ? "bg-amber-950/60 border-amber-600/50 text-amber-400"
                        : isTop7 ? "bg-cyan-900/30 border-cyan-500/30 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                      }`}>
                        {rank || "—"}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {team.avatar ? (
                          <img
                            src={team.avatar}
                            alt={team.teamName}
                            className="w-6 h-6 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                            {team.teamName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white font-display text-xs">{team.teamName}</p>
                          <p className="text-[10px] text-slate-500 font-mono-numbers mt-0.5">
                            {team.teamId} · {team.track || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* R1 */}
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono-numbers font-bold text-xs ${
                        (team.review1Score || 0) > 0 ? "text-sky-400" : "text-slate-700"
                      }`}>
                        {team.review1Score || 0}
                      </span>
                    </td>

                    {/* R2 */}
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono-numbers font-bold text-xs ${
                        (team.review2Score || 0) > 0 ? "text-violet-400" : "text-slate-700"
                      }`}>
                        {team.review2Score || 0}
                      </span>
                    </td>

                    {/* R3 */}
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono-numbers font-bold text-xs ${
                        (team.review3Score || 0) > 0 ? "text-emerald-400" : "text-slate-700"
                      }`}>
                        {team.review3Score || 0}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-black font-mono-numbers text-sm text-white">
                        {team.score}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
