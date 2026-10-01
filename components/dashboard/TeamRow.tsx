"use client";

import React, { useState, useEffect } from "react";
import { Team } from "@/types";

interface TeamRowProps {
  team: Team;
  maxScore: number;
  isTop7Section?: boolean;
  onSelectTeam: (team: Team) => void;
}

export const TeamRow: React.FC<TeamRowProps> = ({
  team,
  isTop7Section = false,
  onSelectTeam,
}) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 1500);
    return () => clearTimeout(timer);
  }, [team.score, team.points, team.review1Score, team.review2Score, team.review3Score]);

  const rank = team.rank;

  const getRankBadge = () => {
    if (!rank) {
      return (
        <span
          title="Awaiting Review Evaluation"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-500 font-mono-numbers text-sm font-semibold"
        >
          —
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 font-black text-base font-mono-numbers shadow-[0_0_15px_rgba(251,191,36,0.35)]">
          <i className="bi bi-trophy-fill text-xs" />1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl bg-slate-700/60 border-2 border-slate-300 text-slate-100 font-black text-base font-mono-numbers shadow-md">
          <i className="bi bi-award-fill text-xs" />2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl bg-amber-900/60 border-2 border-amber-600 text-amber-400 font-black text-base font-mono-numbers shadow-md">
          <i className="bi bi-award text-xs" />3
        </span>
      );
    }
    if (rank <= 7) {
      return (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-900/30 border border-cyan-500/60 text-cyan-300 font-black text-sm font-mono-numbers shadow-sm">
          #{rank}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs font-mono-numbers">
        #{rank}
      </span>
    );
  };

  const getDelta = () => {
    if (!rank || !team.rankDelta || team.rankDelta === 0) return null;
    if (team.rankDelta > 0) {
      return (
        <span className="text-[11px] font-bold text-emerald-400 font-mono-numbers flex items-center">
          <i className="bi bi-arrow-up-short text-sm" />+{team.rankDelta}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-rose-400 font-mono-numbers flex items-center">
        <i className="bi bi-arrow-down-short text-sm" />{team.rankDelta}
      </span>
    );
  };

  // Row styling
  const rowClass = highlight
    ? "bg-rose-500/15 border-rose-400/50 shadow-md"
    : isTop7Section && rank && rank <= 7
    ? rank === 1
      ? "team-row-rank1 hover:brightness-110"
      : rank === 2
      ? "team-row-rank2 hover:brightness-110"
      : rank === 3
      ? "team-row-rank3 hover:brightness-110"
      : "team-row-top hover:brightness-110"
    : "team-row-rest hover:bg-slate-900/60 hover:opacity-100";

  return (
    <tr
      onClick={() => onSelectTeam(team)}
      className={`group cursor-pointer transition-all duration-200 border-b border-slate-800/60 ${rowClass}`}
      title="Click to view full team card and members"
    >
      {/* 1. Rank Column */}
      <td className="py-4 px-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          {getRankBadge()}
          {getDelta() && <div className="w-6 flex justify-center">{getDelta()}</div>}
        </div>
      </td>

      {/* 2. Team Name & Category Column */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {/* Team Avatar Photo OR Initials Fallback */}
          {team.avatar ? (
            <img
              src={team.avatar}
              alt={team.teamName}
              className={`shrink-0 rounded-xl object-cover border shadow-sm ${
                isTop7Section
                  ? "w-10 h-10 border-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                  : "w-8 h-8 border-slate-700"
              }`}
            />
          ) : (
            <div
              className={`shrink-0 rounded-xl flex items-center justify-center font-black font-mono-numbers border shadow-sm ${
                isTop7Section ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"
              } ${
                rank === 1
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : rank === 2
                  ? "bg-slate-700/60 border-slate-400 text-slate-200"
                  : rank === 3
                  ? "bg-amber-950/60 border-amber-600 text-amber-400"
                  : isTop7Section
                  ? "bg-cyan-900/40 border-cyan-500/50 text-cyan-300"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              {team.teamName.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-black tracking-tight font-display transition-colors ${
                  isTop7Section
                    ? "text-white text-base sm:text-lg group-hover:text-cyan-300"
                    : "text-slate-100 text-sm sm:text-base group-hover:text-cyan-400"
                }`}
              >
                {team.teamName}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 font-mono-numbers">
                {team.teamId}
              </span>
              {isTop7Section && rank != null && rank <= 3 && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-display">
                  {rank === 1 ? "CHAMPION" : rank === 2 ? "RUNNER-UP" : "PODIUM"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5 flex items-center gap-1.5">
              <i className="bi bi-tag-fill text-[10px] text-cyan-400/80" />
              <span>{team.track || "General Track"}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-[11px] group-hover:text-cyan-300 transition-colors">
                <i className="bi bi-people-fill text-[11px] mr-1" />
                {team.members?.length || 0} members (Click for card)
              </span>
            </p>
          </div>
        </div>
      </td>

      {/* 3. Review 1 Column */}
      <td className="py-4 px-3 text-center whitespace-nowrap">
        <span
          className={`inline-block font-mono-numbers font-black text-sm px-3 py-1 rounded-xl border ${
            (team.review1Score || 0) > 0
              ? "text-sky-300 bg-sky-500/10 border-sky-500/30 shadow-sm"
              : "text-slate-600 bg-slate-950 border-slate-900"
          }`}
        >
          {team.review1Score || 0}
        </span>
      </td>

      {/* 4. Review 2 Column */}
      <td className="py-4 px-3 text-center whitespace-nowrap">
        <span
          className={`inline-block font-mono-numbers font-black text-sm px-3 py-1 rounded-xl border ${
            (team.review2Score || 0) > 0
              ? "text-violet-300 bg-violet-500/10 border-violet-500/30 shadow-sm"
              : "text-slate-600 bg-slate-950 border-slate-900"
          }`}
        >
          {team.review2Score || 0}
        </span>
      </td>

      {/* 5. Review 3 Column */}
      <td className="py-4 px-3 text-center whitespace-nowrap">
        <span
          className={`inline-block font-mono-numbers font-black text-sm px-3 py-1 rounded-xl border ${
            (team.review3Score || 0) > 0
              ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 shadow-sm"
              : "text-slate-600 bg-slate-950 border-slate-900"
          }`}
        >
          {team.review3Score || 0}
        </span>
      </td>

      {/* 6. Individual Points Column */}
      <td className="py-4 px-3 text-center whitespace-nowrap">
        <span className="inline-block font-mono-numbers font-bold text-xs sm:text-sm text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-xl border border-cyan-500/30">
          +{team.points} <span className="text-[10px] text-cyan-400/70">pts</span>
        </span>
      </td>

      {/* 7. Total Score Column */}
      <td className="py-4 px-5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-3">
          <span
            className={`font-black font-mono-numbers leading-none tracking-tight ${
              isTop7Section
                ? "text-2xl sm:text-3xl text-white group-hover:text-rose-400 transition-colors"
                : "text-xl sm:text-2xl text-slate-100 group-hover:text-rose-400 transition-colors"
            }`}
          >
            {team.score}
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-900 group-hover:bg-cyan-500/20 border border-slate-800 group-hover:border-cyan-500/50 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-all shadow-sm">
            <i className="bi bi-person-vcard text-sm" />
          </div>
        </div>
      </td>
    </tr>
  );
};
