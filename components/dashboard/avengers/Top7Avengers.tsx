"use client";

import React, { useState } from "react";
import { Team } from "@/types";
import { AvengerPodium } from "./AvengerPodium";
import { AvengerHorizontalCard } from "./AvengerHorizontalCard";
import { AvengerProfileModal } from "./AvengerProfileModal";

interface Top7AvengersProps {
  teams: Team[];
  onSelectTeam?: (team: Team) => void;
}

export const Top7Avengers: React.FC<Top7AvengersProps> = ({
  teams,
  onSelectTeam,
}) => {
  const [selectedHeroTeam, setSelectedHeroTeam] = useState<Team | null>(null);

  // Extract Top 7 evaluated teams (score > 0 and rank <= 7)
  const top7Teams = teams.filter(
    (t) => (t.score || 0) > 0 && t.rank != null && t.rank <= 7
  );

  const top3Teams = top7Teams.filter((t) => t.rank != null && t.rank <= 3);
  const ranks4to7 = top7Teams
    .filter((t) => t.rank != null && t.rank >= 4 && t.rank <= 7)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0));

  const handleCardClick = (team: Team) => {
    setSelectedHeroTeam(team);
    onSelectTeam?.(team);
  };

  if (top7Teams.length === 0) {
    return null; // Awaiting first evaluation
  }

  return (
    <div className="w-full space-y-6">
      {/* ─── 1. TOP 7 CINEMATIC HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-950/30 via-slate-900/90 to-cyan-950/30 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Accent Lighting */}
        <div className="absolute -left-10 top-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 bottom-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 font-display">
              HACKINTYM 2.0 • EVOLUTION ARENA
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display bg-gradient-to-r from-amber-300 via-rose-100 to-cyan-300 bg-clip-text text-transparent">
            THE AVENGERS OF HACKINTYM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans italic">
            &quot;Seven teams. Seven identities. One battlefield.&quot;
          </p>
        </div>
      </div>

      {/* ─── 2. TOP 3 PODIUM (Iron Man #1, Captain America #2, Thor #3) ─── */}
      <AvengerPodium top3Teams={top3Teams} onSelectTeam={handleCardClick} />

      {/* ─── 3. RANKS 4–7 CONTENDERS (Hulk #4, Spider-Man #5, Black Widow #6, Hawkeye #7) ─── */}
      {ranks4to7.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2.5 px-1">
            <i className="bi bi-shield-shaded text-slate-500 text-sm" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-display">
              The Elite Contenders (Ranks 04–07)
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ranks4to7.map((team) => (
              <AvengerHorizontalCard
                key={team.id || team.teamId}
                team={team}
                onSelectTeam={handleCardClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. CINEMATIC TEAM HERO PROFILE MODAL ─── */}
      <AvengerProfileModal
        team={selectedHeroTeam}
        onClose={() => setSelectedHeroTeam(null)}
      />
    </div>
  );
};
