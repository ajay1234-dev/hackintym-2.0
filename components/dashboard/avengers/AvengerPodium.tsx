"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Team } from "@/types";
import { AVENGER_RANKS, AvengerConfig } from "@/lib/avengers";
import { AvengerIcon } from "./AvengerIcons";
import { VintageScoreTicker } from "../VintageScoreTicker";

interface AvengerPodiumProps {
  top3Teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export const AvengerPodium: React.FC<AvengerPodiumProps> = ({
  top3Teams,
  onSelectTeam,
}) => {
  const teamRank1 = top3Teams.find((t) => t.rank === 1) || null;
  const teamRank2 = top3Teams.find((t) => t.rank === 2) || null;
  const teamRank3 = top3Teams.find((t) => t.rank === 3) || null;

  return (
    <div className="w-full">
      {/* Top 3 Responsive Grid / Podium: Rank 2 on Left, Rank 1 in Center (Tallest), Rank 3 on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-end">
        {/* ─── RANK 2: CAPTAIN AMERICA (Left, Silver/Navy) ─── */}
        <div className="order-2 md:order-1 md:col-span-4 w-full">
          {teamRank2 ? (
            <PodiumCard
              team={teamRank2}
              avenger={AVENGER_RANKS[2]}
              isCenterRank1={false}
              onSelect={() => onSelectTeam(teamRank2)}
            />
          ) : (
            <EmptyPodiumSlot rank={2} avenger={AVENGER_RANKS[2]} />
          )}
        </div>

        {/* ─── RANK 1: IRON MAN (Center, Gold/Crimson, Largest) ─── */}
        <div className="order-1 md:order-2 md:col-span-4 w-full md:-translate-y-4">
          {teamRank1 ? (
            <PodiumCard
              team={teamRank1}
              avenger={AVENGER_RANKS[1]}
              isCenterRank1={true}
              onSelect={() => onSelectTeam(teamRank1)}
            />
          ) : (
            <EmptyPodiumSlot rank={1} avenger={AVENGER_RANKS[1]} isCenterRank1={true} />
          )}
        </div>

        {/* ─── RANK 3: THOR (Right, Bronze/Electric Blue) ─── */}
        <div className="order-3 md:order-3 md:col-span-4 w-full">
          {teamRank3 ? (
            <PodiumCard
              team={teamRank3}
              avenger={AVENGER_RANKS[3]}
              isCenterRank1={false}
              onSelect={() => onSelectTeam(teamRank3)}
            />
          ) : (
            <EmptyPodiumSlot rank={3} avenger={AVENGER_RANKS[3]} />
          )}
        </div>
      </div>
    </div>
  );
};

interface PodiumCardProps {
  team: Team;
  avenger: AvengerConfig;
  isCenterRank1: boolean;
  onSelect: () => void;
}

const PodiumCard: React.FC<PodiumCardProps> = ({
  team,
  avenger,
  isCenterRank1,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const teamKey = team.id || team.teamId;

  return (
    <motion.div
      layout
      layoutId={`avenger-card-${teamKey}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: "spring", stiffness: 320, damping: 26 } }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-3xl cursor-pointer select-none transition-all duration-300 border overflow-hidden backdrop-blur-xl ${
        isCenterRank1
          ? "p-6 sm:p-7 shadow-[0_25px_60px_-10px_rgba(245,158,11,0.25)] hover:shadow-[0_30px_70px_rgba(251,191,36,0.4)]"
          : "p-5 sm:p-6 shadow-[0_20px_45px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.8)]"
      }`}
      style={{
        background: avenger.colors.bgGradient,
        borderColor: isHovered ? avenger.colors.borderHover : avenger.colors.border,
      }}
    >
      {/* Background Cinematic Watermark / Emblazoned Glow */}
      <div
        className="absolute -right-8 -bottom-8 pointer-events-none opacity-15 transition-opacity duration-300 group-hover:opacity-25"
        style={{ color: avenger.colors.primary }}
      >
        <AvengerIcon type={avenger.iconType} size={isCenterRank1 ? 220 : 170} />
      </div>

      {/* Radiant Top Glow Highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${avenger.colors.primary} 50%, transparent 100%)`,
          opacity: isHovered ? 1 : 0.6,
        }}
      />

      {/* Top Header: Rank & Avenger Badge */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Distinctive Rank Number */}
          <span
            className={`font-black font-mono-numbers px-3 py-1 rounded-xl border flex items-center justify-center tracking-tight shadow-md ${
              isCenterRank1 ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            }`}
            style={{
              backgroundColor: avenger.colors.badgeBg,
              borderColor: avenger.colors.badgeBorder,
              color: avenger.colors.badgeText,
            }}
          >
            #{avenger.rank}
          </span>

          {/* Subtitle Pill (e.g. CHAMPION / RUNNER-UP / PODIUM) */}
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border font-display"
            style={{
              backgroundColor: "rgba(10, 14, 24, 0.8)",
              borderColor: avenger.colors.badgeBorder,
              color: avenger.colors.badgeText,
            }}
          >
            {avenger.subtitle}
          </span>
        </div>

        {/* Hero Vector Emblem */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: "rgba(10, 14, 24, 0.85)",
            borderColor: avenger.colors.badgeBorder,
          }}
        >
          <AvengerIcon type={avenger.iconType} size={30} />
        </div>
      </div>

      {/* Hero Identity: Superhero Name & Title */}
      <div className="mb-4 relative z-10">
        <h3
          className="text-xs sm:text-sm font-black uppercase tracking-widest font-display flex items-center gap-1.5"
          style={{ color: avenger.colors.primary }}
        >
          <span>{avenger.heroName}</span>
        </h3>
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-sans mt-0.5">
          {avenger.title}
        </p>
      </div>

      {/* Actual Team Name & Track (The Hero of the hackathon!) */}
      <div className="mb-5 relative z-10">
        <h4
          className={`font-black text-white font-display tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors ${
            isCenterRank1 ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}
        >
          {team.teamName}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-sans">
          <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
            {team.teamId}
          </span>
          <span className="truncate">{team.track || "General Track"}</span>
        </div>
      </div>

      {/* Score Readout (Prominent, High-Contrast) */}
      <div
        className="pt-4 border-t flex items-center justify-between relative z-10"
        style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-display">
            TOTAL SCORE
          </span>
          <span className="text-[11px] text-slate-500 font-mono-numbers">
            +{team.points} bonus
          </span>
        </div>

        <div className="text-right">
          <VintageScoreTicker
            value={team.score}
            isChampion={isCenterRank1}
            className={`font-black font-mono-numbers ${
              isCenterRank1 ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
            }`}
          />
        </div>
      </div>

      {/* Tap / Click Prompt */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5 relative z-10">
        <span className="group-hover:text-slate-300 transition-colors">
          Inspect Hero Profile
        </span>
        <i
          className="bi bi-arrow-right transition-transform group-hover:translate-x-1"
          style={{ color: avenger.colors.primary }}
        />
      </div>
    </motion.div>
  );
};

const EmptyPodiumSlot: React.FC<{
  rank: number;
  avenger: AvengerConfig;
  isCenterRank1?: boolean;
}> = ({ rank, avenger, isCenterRank1 = false }) => (
  <div
    className={`rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center flex flex-col items-center justify-center ${
      isCenterRank1 ? "min-h-[290px]" : "min-h-[250px]"
    }`}
  >
    <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
      <AvengerIcon type={avenger.iconType} size={28} />
    </div>
    <span className="text-xs font-mono-numbers font-bold text-slate-500">#{rank}</span>
    <h4 className="text-sm font-bold text-slate-400 font-display mt-0.5">{avenger.heroName}</h4>
    <p className="text-[11px] text-slate-600 font-sans mt-1">Awaiting Review Evaluation</p>
  </div>
);
