"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Team } from "@/types";
import { getAvengerByRank } from "@/lib/avengers";
import { AvengerIcon } from "./AvengerIcons";
import { VintageScoreTicker } from "../VintageScoreTicker";

interface AvengerProfileModalProps {
  team: Team | null;
  onClose: () => void;
}

export const AvengerProfileModal: React.FC<AvengerProfileModalProps> = ({
  team,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted || !team) return null;

  const rank = team.rank;
  const avenger = getAvengerByRank(rank);

  // If team is outside Top 7, this modal gracefully closes
  if (!avenger) return null;

  const totalReviews =
    (team.review1Score || 0) + (team.review2Score || 0) + (team.review3Score || 0);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with cinematic blur & dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-2xl transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto z-10 select-none font-sans"
          style={{
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 14, 24, 0.99) 100%)",
            borderColor: avenger.colors.border,
            boxShadow: `0 25px 70px -15px ${avenger.colors.glow}`,
          }}
        >
          {/* Top Cinematic Accent Strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${avenger.colors.secondary} 0%, ${avenger.colors.primary} 50%, ${avenger.colors.secondary} 100%)`,
            }}
          />

          {/* Background Watermark Superhero Emblem */}
          <div
            className="absolute -right-12 -top-12 pointer-events-none opacity-10"
            style={{ color: avenger.colors.primary }}
          >
            <AvengerIcon type={avenger.iconType} size={280} />
          </div>

          <div className="p-6 sm:p-8 space-y-6 relative z-10 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {/* Header: Rank, Superhero Name, Title & Close Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-mono-numbers font-black shadow-lg"
                  style={{
                    backgroundColor: avenger.colors.badgeBg,
                    borderColor: avenger.colors.badgeBorder,
                    color: avenger.colors.badgeText,
                  }}
                >
                  <span className="text-[10px] font-sans uppercase text-slate-400">RANK</span>
                  <span className="text-xl leading-none">#{avenger.rank}</span>
                </div>

                {/* Hero Titles */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-black uppercase tracking-widest font-display"
                      style={{ color: avenger.colors.primary }}
                    >
                      {avenger.heroName}
                    </span>
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: "rgba(10, 14, 24, 0.8)",
                        borderColor: avenger.colors.badgeBorder,
                        color: avenger.colors.badgeText,
                      }}
                    >
                      {avenger.subtitle}
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white font-display tracking-wide mt-0.5">
                    {avenger.title}
                  </h3>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-sm shrink-0"
                aria-label="Close modal"
              >
                <i className="bi bi-x-lg text-sm" />
              </button>
            </div>

            {/* Team Hero Banner Card */}
            <div
              className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: avenger.colors.bgGradient,
                borderColor: avenger.colors.border,
              }}
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">
                  COMPETITOR TEAM
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mt-0.5">
                  {team.teamName}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300 font-sans">
                  <span className="font-mono-numbers px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                    {team.teamId}
                  </span>
                  <span>•</span>
                  <span>{team.track || "General Track"}</span>
                </div>
              </div>

              <div className="sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-display">
                  TOTAL SCORE
                </span>
                <VintageScoreTicker
                  value={team.score}
                  isChampion={avenger.rank === 1}
                  className="text-3xl sm:text-4xl font-black font-mono-numbers text-white"
                />
              </div>
            </div>

            {/* SECTION 1: WHY THIS TEAM OWNS THIS IDENTITY */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <i className="bi bi-shield-check text-cyan-400 text-sm" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-display">
                  Why This Team Owns This Identity
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {avenger.reason}
              </p>
            </div>

            {/* SECTION 2: HACKINTYM PERFORMANCE METRICS */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-display flex items-center gap-2">
                <i className="bi bi-speedometer2 text-amber-400" />
                <span>HackinTym Performance Metrics</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block font-display">
                    Review 1
                  </span>
                  <span className="font-mono-numbers font-black text-sm text-sky-400">
                    {team.review1Score || 0} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block font-display">
                    Review 2
                  </span>
                  <span className="font-mono-numbers font-black text-sm text-violet-400">
                    {team.review2Score || 0} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block font-display">
                    Review 3
                  </span>
                  <span className="font-mono-numbers font-black text-sm text-emerald-400">
                    {team.review3Score || 0} pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block font-display">
                    Bonus Points
                  </span>
                  <span className="font-mono-numbers font-black text-sm text-cyan-300">
                    +{team.points} pts
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: AVENGER IDENTITY TRAITS (Descriptive, not fabricated scores) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-display flex items-center gap-2">
                  <i className="bi bi-stars text-cyan-400" />
                  <span>Avenger Identity Traits</span>
                </h4>
                <span className="text-[10px] text-slate-500 uppercase font-sans">
                  Rank #{avenger.rank} Signature Profile
                </span>
              </div>

              <div className="space-y-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                {avenger.traitBars.map((trait) => (
                  <div key={trait.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-slate-300 font-medium">{trait.name}</span>
                      <span className="font-mono-numbers text-slate-400 text-[11px] font-bold">
                        {trait.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trait.percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: avenger.colors.primary,
                          boxShadow: `0 0 10px ${avenger.colors.primary}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: TEAM MEMBERS */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-display flex items-center gap-2">
                <i className="bi bi-people-fill text-purple-400" />
                <span>Team Members ({team.members?.length || 0})</span>
              </h4>

              {team.members && team.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {team.members.map((member, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono-numbers font-bold text-xs text-slate-300">
                        {index + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 font-sans truncate">
                        {member}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950 border border-slate-900">
                  No members registered for this team.
                </p>
              )}
            </div>

            {/* Bottom Actions: BACK TO LEADERBOARD */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg font-display"
              >
                <i className="bi bi-arrow-left" />
                <span>Back to Leaderboard</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
