"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Team } from "@/types";
import { AVENGER_RANKS } from "@/lib/avengers";
import { AvengerIcon } from "./AvengerIcons";
import { VintageScoreTicker } from "../VintageScoreTicker";

interface AvengerHorizontalCardProps {
  team: Team;
  onSelectTeam: (team: Team) => void;
}

export const AvengerHorizontalCard: React.FC<AvengerHorizontalCardProps> = ({
  team,
  onSelectTeam,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const rank = team.rank || 4;
  const avenger = AVENGER_RANKS[rank] || AVENGER_RANKS[4];
  const teamKey = team.id || team.teamId;

  return (
    <motion.div
      layout
      layoutId={`avenger-card-${teamKey}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: "spring", stiffness: 340, damping: 28 } }}
      onClick={() => onSelectTeam(team)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 cursor-pointer select-none overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-xl"
      style={{
        background: avenger.colors.bgGradient,
        borderColor: isHovered ? avenger.colors.borderHover : avenger.colors.border,
      }}
    >
      {/* Background Watermark Icon */}
      <div
        className="absolute -right-4 -bottom-6 pointer-events-none opacity-10 transition-opacity duration-300 group-hover:opacity-20"
        style={{ color: avenger.colors.primary }}
      >
        <AvengerIcon type={avenger.iconType} size={130} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        {/* Left Section: Rank Badge, Avenger Emblem, Hero Name & Team Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Distinctive Rank Badge */}
          <div
            className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center border font-mono-numbers font-black shadow-sm"
            style={{
              backgroundColor: avenger.colors.badgeBg,
              borderColor: avenger.colors.badgeBorder,
              color: avenger.colors.badgeText,
            }}
          >
            <span className="text-[10px] uppercase font-sans text-slate-400">RANK</span>
            <span className="text-base leading-none">0{avenger.rank}</span>
          </div>

          {/* Superhero Emblem */}
          <div
            className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105"
            style={{
              backgroundColor: "rgba(10, 14, 24, 0.8)",
              borderColor: avenger.colors.badgeBorder,
            }}
          >
            <AvengerIcon type={avenger.iconType} size={26} />
          </div>

          {/* Details: Superhero Codename, Title & Actual Team Name */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-black uppercase tracking-wider font-display"
                style={{ color: avenger.colors.primary }}
              >
                {avenger.heroName}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                • {avenger.title}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-black text-white font-display truncate group-hover:text-cyan-300 transition-colors mt-0.5">
              {team.teamName}
            </h4>

            {/* Short Tagline / Core Trait Reason */}
            <p className="text-[11px] text-slate-400 font-sans italic truncate mt-0.5">
              &quot;{avenger.shortDescription}&quot;
            </p>
          </div>
        </div>

        {/* Right Section: Score Readout & Tap Hint */}
        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
          <div className="sm:text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-display">
              TOTAL SCORE
            </span>
            <VintageScoreTicker
              value={team.score}
              isChampion={false}
              className="text-xl sm:text-2xl font-black font-mono-numbers text-white"
            />
          </div>

          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
            style={{
              backgroundColor: "rgba(10, 14, 24, 0.8)",
              borderColor: avenger.colors.badgeBorder,
              color: avenger.colors.primary,
            }}
          >
            <i className="bi bi-chevron-right text-xs" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
