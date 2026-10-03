"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Team } from "@/types";

interface TeamDetailsModalProps {
  team: Team | null;
  topScore: number;
  onClose: () => void;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
  team,
  topScore,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (team) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [team, onClose]);

  if (!mounted || !team) return null;

  const hasScore = (team.score || 0) > 0;
  const scoreDeficit = hasScore ? Math.max(0, topScore - team.score) : 0;
  const rank = team.rank;

  const getRankBadge = () => {
    if (!rank || !hasScore) {
      return {
        label: "⏳ AWAITING REVIEW 1",
        style: "text-slate-400 border-slate-800 bg-slate-900/90",
      };
    }
    if (rank === 1) {
      return {
        label: "🏆 #1 CHAMPION",
        style: "text-amber-300 border-amber-400/80 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
      };
    }
    if (rank === 2) {
      return {
        label: "🥈 #2 RUNNER-UP",
        style: "text-slate-100 border-slate-300/80 bg-slate-700/40 shadow-sm",
      };
    }
    if (rank === 3) {
      return {
        label: "🥉 #3 2ND RUNNER-UP",
        style: "text-amber-300 border-amber-600/80 bg-amber-900/40 shadow-sm",
      };
    }
    if (rank <= 7) {
      return {
        label: `🌟 #${rank} TOP 7 PODIUM`,
        style: "text-cyan-300 border-cyan-500/60 bg-cyan-900/30 shadow-sm",
      };
    }
    return {
      label: `RANK #${rank}`,
      style: "text-slate-400 border-slate-800 bg-slate-900",
    };
  };

  const { label: rankTitle, style: rankStyle } = getRankBadge();

  // First member is designated as the Team Leader!
  const leaderName = team.members && team.members.length > 0 ? team.members[0] : null;
  const regularMembers = team.members && team.members.length > 1 ? team.members.slice(1) : [];

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
    >
      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto overscroll-contain transform-gpu"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all z-20 flex items-center justify-center shadow-md"
          title="Close (Esc)"
        >
          <i className="bi bi-x-lg text-sm" />
        </button>

        {/* Header Tags: Rank and Category */}
        <div className="flex items-center gap-2.5 flex-wrap mb-4 pr-10">
          <span
            className={`px-3.5 py-1.5 rounded-xl font-mono-numbers font-black text-xs border flex items-center gap-1.5 ${rankStyle}`}
          >
            {rankTitle}
          </span>

          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-1.5 font-sans">
            <i className="bi bi-tag-fill text-[11px] text-cyan-400" />
            Category: {team.track || "General Track"}
          </span>
        </div>

        {/* Team Avatar & Name Heading */}
        <div className="mb-6 flex items-center gap-4">
          {team.avatar ? (
            <div className="relative shrink-0">
              <img
                src={team.avatar}
                alt={team.teamName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-xl shadow-cyan-950/40"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-emerald-300 font-mono-numbers flex items-center gap-0.5 shadow">
                <i className="bi bi-check-lg" />
              </span>
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-xl sm:text-2xl font-mono-numbers text-cyan-400 shrink-0 shadow-inner">
              {team.teamName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display truncate">
              {team.teamName}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Official competition roster card</span>
              {team.avatar && (
                <span className="text-cyan-400 font-bold">• Photo Verified ✓</span>
              )}
            </p>
          </div>
        </div>

        {/* Team Tagline / Punchline (if set) */}
        {team.tagline && team.tagline.trim() && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/30 flex items-center gap-3 shadow-inner">
            <i className="bi bi-quote text-cyan-400 text-xl shrink-0" />
            <p className="text-xs sm:text-sm font-bold italic text-cyan-200 font-sans tracking-wide">
              “{team.tagline.trim()}”
            </p>
          </div>
        )}

        {/* 4-Item Review & Points Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 font-display block mb-1">
              Review 1
            </span>
            <span className="text-2xl font-black font-mono-numbers text-white">
              {team.review1Score || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 font-display block mb-1">
              Review 2
            </span>
            <span className="text-2xl font-black font-mono-numbers text-white">
              {team.review2Score || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-display block mb-1">
              Review 3
            </span>
            <span className="text-2xl font-black font-mono-numbers text-white">
              {team.review3Score || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-display block mb-1">
              Points
            </span>
            <span className="text-2xl font-black font-mono-numbers text-cyan-300">
              +{team.points}
            </span>
          </div>
        </div>

        {/* Total Score & Leader Gap */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-display block">
              Total Competition Score
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono-numbers text-white">
              {team.score}
            </span>
            <span className="text-xs text-rose-400 font-bold ml-1.5">pts</span>
          </div>

          {hasScore && rank !== 1 && scoreDeficit > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-500 font-display block">
                Gap to #1
              </span>
              <span className="text-sm font-black font-mono-numbers text-rose-400">
                −{scoreDeficit} pts from leader
              </span>
            </div>
          )}
        </div>

        {/* ─── TEAM MEMBERS SECTION ─── */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 font-display flex items-center gap-2">
              <i className="bi bi-people-fill text-cyan-400" />
              Team Roster & Roles ({team.members?.length || 0} Members)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono-numbers">
              1 Leader + {Math.max(0, (team.members?.length || 0) - 1)} Members
            </span>
          </div>

          {team.members && team.members.length > 0 ? (
            <div className="space-y-2.5">
              {/* 👑 1ST MEMBER = TEAM LEADER (Special Featured Card) */}
              {leaderName && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-slate-900 border-2 border-amber-400/70 shadow-lg shadow-amber-950/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-lg shrink-0 shadow-sm">
                      <i className="bi bi-award-fill" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-display">
                          👑 TEAM LEADER
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono-numbers">
                          Primary Point of Contact
                        </span>
                      </div>
                      <p className="text-base sm:text-lg font-black text-white truncate font-display mt-0.5">
                        {leaderName}
                      </p>
                    </div>
                  </div>
                  <i className="bi bi-check-circle-fill text-amber-400 text-base shrink-0" />
                </div>
              )}

              {/* OTHER MEMBERS (Member 2, Member 3, Member 4) */}
              {regularMembers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {regularMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono-numbers shrink-0">
                        {idx + 2}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-display block">
                          Member {idx + 2}
                        </span>
                        <p className="font-bold text-sm text-slate-100 truncate font-sans">
                          {member}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-slate-800">
              No members listed for this team yet.
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-sans">
            HackinTym'26 2.0 Official Dashboard
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition-all font-display shadow-sm"
          >
            Close Card
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
