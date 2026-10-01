"use client";

import React from "react";
import { Team } from "@/types";

interface TopTeamsProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export const TopTeams: React.FC<TopTeamsProps> = ({ teams, onSelectTeam }) => {
  // Showcase Top 7 Teams
  const top7TeamsList = teams.slice(0, 7);

  if (top7TeamsList.length === 0) {
    return null;
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold font-mono-numbers shadow-sm">
            <i className="bi bi-trophy-fill text-amber-400 text-xs animate-pulse" />
            <span>#1 CHAMPION</span>
          </div>
        );
      case 1:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-400 text-slate-200 text-xs font-bold font-mono-numbers shadow-sm">
            <i className="bi bi-award-fill text-slate-300 text-xs" />
            <span>#2 RUNNER UP</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/70 border border-amber-700 text-amber-300 text-xs font-bold font-mono-numbers shadow-sm">
            <i className="bi bi-award text-amber-400 text-xs" />
            <span>#3 THIRD PLACE</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs font-bold font-mono-numbers">
            <i className="bi bi-star-fill text-cyan-400 text-xs" />
            <span>#4 TOP CONTENDER</span>
          </div>
        );
      case 4:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-bold font-mono-numbers">
            <i className="bi bi-star-fill text-rose-400 text-xs" />
            <span>#5 TOP CONTENDER</span>
          </div>
        );
      case 5:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono-numbers">
            <i className="bi bi-star-fill text-purple-400 text-xs" />
            <span>#6 TOP CONTENDER</span>
          </div>
        );
      case 6:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono-numbers">
            <i className="bi bi-star-fill text-emerald-400 text-xs" />
            <span>#7 TOP CONTENDER</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold font-mono-numbers">
            <span>#{index + 1}</span>
          </div>
        );
    }
  };

  return (
    <div className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 font-display">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <i className="bi bi-trophy-fill text-base animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-white">
              Top 7 Leaderboard Spotlight
            </h3>
            <p className="text-xs text-slate-400">
              Leading teams currently dominating the competition standings
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-xs text-slate-400 font-bold font-mono-numbers bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
          Top 7 Ranked Teams
        </span>
      </div>

      {/* Top 7 Highlighted List View */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
        {top7TeamsList.map((team, idx) => (
          <div
            key={team.id || team.teamId}
            onClick={() => onSelectTeam(team)}
            className={`group flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 transition-all duration-300 cursor-pointer gap-3 ${
              idx === 0
                ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent hover:from-amber-500/20 border-l-4 border-l-amber-400"
                : idx === 1
                ? "bg-gradient-to-r from-slate-400/15 via-slate-400/5 to-transparent hover:from-slate-400/20 border-l-4 border-l-slate-300"
                : idx === 2
                ? "bg-gradient-to-r from-amber-700/15 via-amber-700/5 to-transparent hover:from-amber-700/20 border-l-4 border-l-amber-600"
                : "hover:bg-slate-800/50 border-l-2 border-l-cyan-500/30"
            }`}
          >
            {/* Left Info & Roster */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="shrink-0">{getRankBadge(idx)}</div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors font-display">
                    {team.teamName}
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 font-mono-numbers">
                    {team.teamId}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-900/90 border border-slate-800 px-2.5 py-0.5 rounded-md font-sans">
                    {team.track || "General Track"}
                  </span>
                </div>

                {/* Display All 4 Member Names as Clean Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1 font-display">
                    Roster:
                  </span>
                  {team.members && team.members.length > 0 ? (
                    team.members.map((member, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-950/90 border border-slate-800 text-slate-200 px-2 py-0.5 rounded-lg font-medium font-sans shadow-sm"
                      >
                        <i className="bi bi-person-fill text-slate-500 text-[10px]" />
                        {member}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">No members added</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Score Display */}
            <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
              <div className="text-right whitespace-nowrap">
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-xl sm:text-2xl font-extrabold font-mono-numbers text-white">
                    {team.score}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold font-display">score</span>
                </div>
                <div className="mt-0.5">
                  <span className="text-xs font-bold text-cyan-400 font-mono-numbers bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20 inline-block shadow-sm">
                    {team.points} pts
                  </span>
                </div>
              </div>

              <i className="bi bi-chevron-right text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all text-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
