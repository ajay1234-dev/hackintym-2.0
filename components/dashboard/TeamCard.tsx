"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Team, PublishingSession } from "@/types";
import { getAvengerByRank } from "@/lib/avengers";
import { VintageScoreTicker } from "./VintageScoreTicker";
import { CasioScoreScrambler } from "./CasioScoreScrambler";

interface TeamCardProps {
  team: Team;
  maxScore: number;
  publishingSession?: PublishingSession | null;
  onSelectTeam: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  publishingSession,
  onSelectTeam,
}) => {
  const [highlight, setHighlight] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 1600);
    return () => clearTimeout(timer);
  }, [team.score, team.points, team.review1Score, team.review2Score, team.review3Score]);

  const teamKey = team.id || team.teamId;
  const isSessionActive = publishingSession && publishingSession.status === "IN_PROGRESS";
  const sessionScores = publishingSession?.scores || {};
  const hasSessionScore = isSessionActive && (
    teamKey in sessionScores || team.id in sessionScores || team.teamId in sessionScores
  );

  const isLockedIn = !isSessionActive || Boolean(
    publishingSession?.lockedTeamIds?.includes(teamKey) ||
    publishingSession?.lockedTeamIds?.includes(team.id) ||
    publishingSession?.lockedTeamIds?.includes(team.teamId)
  );

  const isFlipping = Boolean(isSessionActive && hasSessionScore && !isLockedIn);
  const isActiveTarget = Boolean(
    isSessionActive && (
      publishingSession?.activeTeamId === teamKey ||
      publishingSession?.activeTeamId === team.id ||
      publishingSession?.activeTeamId === team.teamId
    )
  );

  const hasScore = (team.score || 0) > 0;
  const rank = team.rank;
  const avenger = hasScore ? getAvengerByRank(rank) : null;
  const isTop7 = hasScore && rank != null && rank <= 7;
  const showAvatar = Boolean(team.avatar && team.avatar.trim() && !imgError);

  const getRankBadge = () => {
    if (isFlipping) {
      return (
        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono-numbers font-bold text-xs flex items-center gap-1.5 animate-pulse">
          <i className="bi bi-arrow-repeat animate-spin text-xs" />
          <span>EVALUATING</span>
        </span>
      );
    }
    if (!rank || !hasScore) {
      return (
        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono-numbers font-bold text-xs">
          —
        </span>
      );
    }
    if (avenger) {
      return (
        <span
          className="px-2.5 py-1 rounded-xl border font-mono-numbers font-black text-xs shadow-sm flex items-center gap-1.5"
          style={{
            backgroundColor: avenger.colors.badgeBg,
            borderColor: avenger.colors.badgeBorder,
            color: avenger.colors.badgeText,
          }}
        >
          <span>#{avenger.rank}</span>
          <span>{avenger.heroName.toUpperCase()}</span>
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
      id={`team-card-${teamKey}`}
      layout
      layoutId={`card-${teamKey}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: "spring", stiffness: 350, damping: 28 },
        opacity: { duration: 0.2 },
      }}
      onClick={() => onSelectTeam(team)}
      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99] ${
        highlight || isActiveTarget
          ? "bg-amber-500/15 border-amber-400/90 shadow-[0_0_25px_rgba(251,191,36,0.35)] scale-[1.01]"
          : isFlipping
          ? "bg-slate-900/60 border-slate-800/80"
          : isTop7
          ? rank === 1
            ? "bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-slate-950 border-amber-500/50 shadow-amber-950/20"
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
          <span className="text-[11px] font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 font-mono-numbers">
            {team.teamId}
          </span>
        </div>

        <div className="text-right">
          {isFlipping ? (
            <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.4)] flex items-center justify-center">
              <CasioScoreScrambler
                value={team.score}
                isScrambling={true}
                minDigits={2}
                playSound={isActiveTarget}
                className="text-2xl font-black font-mono-numbers text-amber-300 leading-none"
              />
            </div>
          ) : (
            <VintageScoreTicker
              value={team.score}
              isChampion={rank === 1 && hasScore}
              className="text-2xl font-black font-mono-numbers text-white leading-none"
            />
          )}
          <span className="text-[10px] text-slate-400 ml-1 font-display uppercase tracking-wider block mt-0.5">
            total score
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
          {isFlipping && publishingSession?.reviewNum === 1 ? (
            <CasioScoreScrambler
              value={sessionScores[teamKey] || 0}
              isScrambling={true}
              minDigits={2}
              className="text-xs text-amber-300 font-mono-numbers"
            />
          ) : (
            <span className="font-mono-numbers font-bold text-xs text-sky-400">
              {team.review1Score || 0}
            </span>
          )}
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="block text-[9px] font-bold uppercase text-slate-500 font-display">
            R2
          </span>
          {isFlipping && publishingSession?.reviewNum === 2 ? (
            <CasioScoreScrambler
              value={sessionScores[teamKey] || 0}
              isScrambling={true}
              minDigits={2}
              className="text-xs text-amber-300 font-mono-numbers"
            />
          ) : (
            <span className="font-mono-numbers font-bold text-xs text-violet-400">
              {team.review2Score || 0}
            </span>
          )}
        </div>

        <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
          <span className="block text-[9px] font-bold uppercase text-slate-500 font-display">
            R3
          </span>
          {isFlipping && publishingSession?.reviewNum === 3 ? (
            <CasioScoreScrambler
              value={sessionScores[teamKey] || 0}
              isScrambling={true}
              minDigits={2}
              className="text-xs text-amber-300 font-mono-numbers"
            />
          ) : (
            <span className="font-mono-numbers font-bold text-xs text-emerald-400">
              {team.review3Score || 0}
            </span>
          )}
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
