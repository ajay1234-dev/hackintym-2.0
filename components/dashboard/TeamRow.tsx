"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Team, PublishingSession } from "@/types";
import { getAvengerByRank } from "@/lib/avengers";
import { VintageScoreTicker } from "./VintageScoreTicker";
import { CasioScoreScrambler } from "./CasioScoreScrambler";

interface TeamRowProps {
  team: Team;
  maxScore: number;
  isTop7Section?: boolean;
  publishingSession?: PublishingSession | null;
  onSelectTeam: (team: Team) => void;
}

export const TeamRow: React.FC<TeamRowProps> = ({
  team,
  isTop7Section = false,
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
  const showAvatar = Boolean(team.avatar && team.avatar.trim() && !imgError);

  const getRankBadge = () => {
    if (isFlipping) {
      return (
        <span
          title="Flipping & evaluating marks..."
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/60 text-cyan-300 font-mono-numbers text-xs font-bold animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.4)]"
        >
          <i className="bi bi-arrow-repeat animate-spin text-xs text-rose-400" />
        </span>
      );
    }
    if (!rank || !hasScore) {
      return (
        <span
          title="Awaiting Review Evaluation"
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-500 font-mono-numbers text-sm font-semibold"
        >
          —
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl bg-gradient-to-b from-amber-400/30 to-amber-500/10 border-2 border-amber-400 text-amber-300 font-black text-base font-mono-numbers shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <i className="bi bi-trophy-fill text-xs" />1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl bg-gradient-to-b from-slate-600/30 to-slate-800/20 border-2 border-slate-300 text-slate-100 font-black text-base font-mono-numbers shadow-md">
          <i className="bi bi-award-fill text-xs" />2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center gap-1 w-10 h-10 rounded-xl bg-gradient-to-b from-amber-800/40 to-amber-950/20 border-2 border-amber-600 text-amber-400 font-black text-base font-mono-numbers shadow-md">
          <i className="bi bi-award text-xs" />3
        </span>
      );
    }
    if (rank <= 7) {
      return (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-500/60 text-cyan-300 font-black text-sm font-mono-numbers shadow-sm">
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
    if (!rank || !hasScore || !team.rankDelta || team.rankDelta === 0) return null;
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
  const rowClass = highlight || isActiveTarget
    ? "bg-rose-500/15 border-rose-400/90 shadow-[0_0_25px_rgba(244,63,94,0.35),0_0_15px_rgba(56,189,248,0.25)] scale-[1.003] z-20"
    : isFlipping
    ? "bg-slate-900/40 border-slate-800/80 opacity-90"
    : isTop7Section && rank && hasScore && rank <= 7
    ? rank === 1
      ? "team-row-rank1 hover:brightness-110"
      : rank === 2
      ? "team-row-rank2 hover:brightness-110"
      : rank === 3
      ? "team-row-rank3 hover:brightness-110"
      : "team-row-top hover:brightness-110"
    : "team-row-rest hover:bg-slate-900/60 hover:opacity-100";

  return (
    <motion.tr
      id={`team-row-${teamKey}`}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 350, damping: 28 },
        opacity: { duration: 0.15 },
      }}
      onClick={() => onSelectTeam(team)}
      className={`group cursor-pointer select-none border-b border-slate-800/60 ${rowClass}`}
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
          {showAvatar ? (
            <img
              src={team.avatar}
              alt={team.teamName}
              onError={() => setImgError(true)}
              className={`shrink-0 rounded-2xl object-cover border shadow-sm ${
                isTop7Section
                  ? "w-11 h-11 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                  : "w-9 h-9 border-slate-700"
              }`}
            />
          ) : (
            <div
              className={`shrink-0 rounded-2xl flex items-center justify-center font-black font-mono-numbers border shadow-sm ${
                isTop7Section ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs"
              } ${
                rank === 1 && hasScore
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : rank === 2 && hasScore
                  ? "bg-slate-700/60 border-slate-400 text-slate-200"
                  : rank === 3 && hasScore
                  ? "bg-amber-950/60 border-amber-600 text-amber-400"
                  : isTop7Section && hasScore
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
              {avenger && hasScore && (
                <span
                  className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border font-display flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: avenger.colors.badgeBg,
                    borderColor: avenger.colors.badgeBorder,
                    color: avenger.colors.badgeText,
                  }}
                >
                  <span>{avenger.heroName}</span>
                  <span className="opacity-75 text-[9px] hidden sm:inline">• {avenger.title}</span>
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
        {isFlipping && publishingSession?.reviewNum === 1 ? (
          <div className="inline-flex min-w-[54px] h-8 px-2 rounded-xl bg-slate-950 border border-rose-500/70 items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.4),0_0_6px_rgba(244,63,94,0.4)]">
            <CasioScoreScrambler
              value={sessionScores[teamKey] || 0}
              isScrambling={true}
              minDigits={2}
              className="text-xs font-mono-numbers"
            />
          </div>
        ) : (
          <span
            className={`inline-block font-mono-numbers font-black text-sm px-3 py-1 rounded-xl border ${
              (team.review1Score || 0) > 0
                ? "text-sky-300 bg-sky-500/10 border-sky-500/30 shadow-sm"
                : "text-slate-600 bg-slate-950 border-slate-900"
            }`}
          >
            {team.review1Score || 0}
          </span>
        )}
      </td>

      {/* 4. Review 2 Column */}
      <td className="py-4 px-3 text-center whitespace-nowrap">
        {isFlipping && publishingSession?.reviewNum === 2 ? (
          <div className="inline-flex min-w-[54px] h-8 px-2 rounded-xl bg-slate-950 border border-rose-500/70 items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.4),0_0_6px_rgba(244,63,94,0.4)]">
            <CasioScoreScrambler
              value={sessionScores[teamKey] || 0}
              isScrambling={true}
              minDigits={2}
              className="text-xs font-mono-numbers"
            />
          </div>
        ) : (
          <span
            className={`inline-block font-mono-numbers font-black text-sm px-3 py-1 rounded-xl border ${
              (team.review2Score || 0) > 0
                ? "text-violet-300 bg-violet-500/10 border-violet-500/30 shadow-sm"
                : "text-slate-600 bg-slate-950 border-slate-900"
            }`}
          >
            {team.review2Score || 0}
          </span>
        )}
      </td>

      {/* 5. Review 3 Column */}
      <td className="py-4 px-3 text-center whitespace-nowrap">
        {isFlipping && publishingSession?.reviewNum === 3 ? (
          <div className="inline-flex min-w-[54px] h-8 px-2 rounded-xl bg-slate-950 border border-rose-500/70 items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.4),0_0_6px_rgba(244,63,94,0.4)]">
            <CasioScoreScrambler
              value={sessionScores[teamKey] || 0}
              isScrambling={true}
              minDigits={2}
              className="text-xs font-mono-numbers"
            />
          </div>
        ) : (
          <span
            className={`inline-block font-mono-numbers font-black text-sm px-3 py-1 rounded-xl border ${
              (team.review3Score || 0) > 0
                ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                : "text-slate-600 bg-slate-950 border-slate-900"
            }`}
          >
            {team.review3Score || 0}
          </span>
        )}
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
          {isFlipping ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border-2 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.5),0_0_12px_rgba(56,189,248,0.5)] flex items-center justify-center">
              <CasioScoreScrambler
                value={team.score}
                isScrambling={true}
                minDigits={2}
                playSound={isActiveTarget}
                className="text-2xl sm:text-3xl font-black font-mono-numbers tracking-widest"
              />
            </div>
          ) : (
            <VintageScoreTicker
              value={team.score}
              isChampion={rank === 1 && hasScore}
              className={
                isTop7Section
                  ? "text-2xl sm:text-3xl text-white group-hover:text-amber-300 transition-colors"
                  : "text-xl sm:text-2xl text-slate-100 group-hover:text-amber-300 transition-colors"
              }
            />
          )}

          <div className="w-8 h-8 rounded-xl bg-slate-900 group-hover:bg-cyan-500/20 border border-slate-800 group-hover:border-cyan-500/50 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-all shadow-sm">
            <i className="bi bi-person-vcard text-sm" />
          </div>
        </div>
      </td>
    </motion.tr>
  );
};
