"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  maxScore: number;
  onSelectTeam: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onSelectTeam,
}) => {
  const [highlight, setHighlight] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 1800);
    return () => clearTimeout(timer);
  }, [team.score, team.points, team.review1Score, team.review2Score, team.review3Score]);

  const hasScore = (team.score || 0) > 0;
  const rank = team.rank;
  const isTop7 = hasScore && rank != null && rank <= 7;
  const showAvatar = Boolean(team.avatar && team.avatar.trim() && !imgError);

  const getRankBadge = () => {
    if (!rank || !hasScore) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono-numbers font-bold text-xs">
          —
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono-numbers font-black text-xs shadow-sm flex items-center gap-1">
          <i className="bi bi-trophy-fill text-amber-400 text-xs" /> #1 CHAMPION
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-400 text-slate-200 font-mono-numbers font-black text-xs flex items-center gap-1">
          <i className="bi bi-award-fill text-slate-300 text-xs" /> #2 RUNNER-UP
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-600 text-amber-300 font-mono-numbers font-black text-xs flex items-center gap-1">
          <i className="bi bi-award text-amber-400 text-xs" /> #3 PODIUM
        </span>
      );
    }
    if (rank <= 7) {
      return (
        <span className="px-2 py-0.5 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono-numbers font-black text-xs shadow-sm">
          #{rank} TOP 7
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono-numbers font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <motion.div
      layout
      layoutId={`card-${team.id || team.teamId}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: "spring", stiffness: 350, damping: 28 },
        opacity: { duration: 0.2 },
      }}
      onClick={() => onSelectTeam(team)}
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99] ${
        highlight
          ? "bg-rose-500/20 border-rose-500/60 shadow-rose-950/40"
          : isTop7
          ? rank === 1
            ? "bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-950 border-amber-500/40"
            : rank === 2
            ? "bg-gradient-to-r from-slate-700/20 via-slate-900/90 to-slate-950 border-slate-400/40"
            : rank === 3
            ? "bg-gradient-to-r from-amber-900/20 via-slate-900/90 to-slate-950 border-amber-600/40"
            : "bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500/60"
          : "bg-slate-950/90 border-slate-800/80 hover:border-slate-700"
      }`}
    >
      {/* Top Header: Rank, ID, and Total Score */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {getRankBadge()}
          <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 font-mono-numbers">
            {team.teamId}
          </span>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-mono-numbers text-white leading-none">
            {team.score}
          </span>
          <span className="text-[10px] text-slate-400 ml-1 font-display uppercase tracking-wider block">
            score
          </span>
        </div>
      </div>

      {/* Team Name & Track */}
      <div className="mb-3 flex items-start gap-3">
        {showAvatar ? (
          <img
            src={team.avatar}
            alt={team.teamName}
            onError={() => setImgError(true)}
            className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs font-mono-numbers text-slate-300 shrink-0">
            {team.teamName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-white text-base sm:text-lg line-clamp-1 font-display tracking-tight">
            {team.teamName}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-sans">
            <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2.5 py-0.5 rounded-md border border-slate-800 text-[11px] text-slate-300">
              <i className="bi bi-tag-fill text-[9px] text-cyan-400" />
              {team.track || "General Track"}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <i className="bi bi-people-fill text-[11px]" />
              {team.members?.length || 0} members
            </span>
          </div>
        </div>
      </div>

      {/* Reviews & Points Grid */}
      <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-800/80 text-center">
        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="block text-[9px] font-bold uppercase text-slate-500 font-display">
            R1
          </span>
          <span className="font-mono-numbers font-bold text-xs text-sky-400">
            {team.review1Score || 0}
          </span>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="block text-[9px] font-bold uppercase text-slate-500 font-display">
            R2
          </span>
          <span className="font-mono-numbers font-bold text-xs text-violet-400">
            {team.review2Score || 0}
          </span>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="block text-[9px] font-bold uppercase text-slate-500 font-display">
            R3
          </span>
          <span className="font-mono-numbers font-bold text-xs text-emerald-400">
            {team.review3Score || 0}
          </span>
        </div>

        <div className="p-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
          <span className="block text-[9px] font-bold uppercase text-cyan-400 font-display">
            Points
          </span>
          <span className="font-mono-numbers font-bold text-xs text-cyan-300">
            +{team.points}
          </span>
        </div>
      </div>

      {/* Tap hint */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/50">
        <span className="text-slate-400 font-medium">Tap to view full team card & leader</span>
        <i className="bi bi-chevron-right text-xs text-cyan-400" />
      </div>
    </motion.div>
  );
};
