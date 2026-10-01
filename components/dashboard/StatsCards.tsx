"use client";

import React, { useMemo } from "react";
import { Team, HackathonConfig } from "@/types";

interface StatsCardsProps {
  teams: Team[];
  config: HackathonConfig;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ teams, config }) => {
  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const totalParticipants = teams.reduce(
      (sum, t) => sum + (t.members ? t.members.length : 0),
      0
    );
    const totalPoints = teams.reduce((sum, t) => sum + (t.points || 0), 0);
    const totalScore = teams.reduce((sum, t) => sum + (t.score || 0), 0);
    const topScore = teams.length > 0 ? Math.max(...teams.map((t) => t.score || 0)) : 0;
    const avgScore = totalTeams > 0 ? Math.round(totalScore / totalTeams) : 0;

    return {
      totalTeams,
      totalParticipants,
      totalPoints,
      topScore,
      avgScore,
    };
  }, [teams]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-10">
      
      {/* Teams Stat Card */}
      <div className="relative group p-5 sm:p-6 rounded-3xl cyber-card border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Registered Teams
          </span>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-md">
            <i className="bi bi-shield-check text-base" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono-numbers text-white">
            {stats.totalTeams}
          </span>
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider font-display">Active</span>
        </div>
      </div>

      {/* Participants Stat Card */}
      <div className="relative group p-5 sm:p-6 rounded-3xl cyber-card border border-slate-800 hover:border-rose-500/50 transition-all duration-300 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Participants
          </span>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shadow-md">
            <i className="bi bi-people-fill text-base" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono-numbers text-white">
            {stats.totalParticipants}
          </span>
          <span className="text-xs text-rose-400 font-bold uppercase tracking-wider font-display">Hackers</span>
        </div>
      </div>

      {/* Total Points Stat Card */}
      <div className="relative group p-5 sm:p-6 rounded-3xl cyber-card border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Total Points Scored
          </span>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-md">
            <i className="bi bi-fire text-base" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono-numbers text-white">
            {stats.totalPoints.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-display">pts</span>
        </div>
      </div>

      {/* Top Score / Highest Score Stat Card */}
      <div className="relative group p-5 sm:p-6 rounded-3xl cyber-card border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            Leaderboard High
          </span>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-md">
            <i className="bi bi-trophy-fill text-base" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono-numbers text-white text-glow-gold">
            {stats.topScore.toLocaleString()}
          </span>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider font-display">Top Score</span>
        </div>
      </div>

    </div>
  );
};
