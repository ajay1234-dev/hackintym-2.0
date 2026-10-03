"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Team } from "@/types";
import { TeamRow } from "./TeamRow";
import { TeamCard } from "./TeamCard";
import { TeamDetailsModal } from "./TeamDetailsModal";
import { VintageGameBoardCeremony } from "./VintageGameBoardCeremony";

interface LeaderboardProps {
  teams: Team[];
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  teams,
  isLoading = false,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);

  // Sync selectedTeam with the latest realtime teams array so modal always shows up-to-date avatar & score
  const activeSelectedTeam = useMemo(() => {
    if (!selectedTeam) return null;
    return (
      teams.find(
        (t) =>
          (t.id && t.id === selectedTeam.id) ||
          (t.teamId && t.teamId === selectedTeam.teamId)
      ) || selectedTeam
    );
  }, [teams, selectedTeam]);

  const tracks = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => {
      if (t.track && t.track.trim()) set.add(t.track.trim());
    });
    return ["ALL", ...Array.from(set)];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    if (selectedTrack === "ALL") return teams;
    return teams.filter((t) => t.track && t.track.trim() === selectedTrack);
  }, [teams, selectedTrack]);

  const maxScore = useMemo(() => {
    return teams.length > 0 ? Math.max(...teams.map((t) => t.score || 0)) : 1000;
  }, [teams]);

  const hasAnyScoredTeams = useMemo(() => {
    return filteredTeams.some((t) => (t.score || 0) > 0 && t.rank != null);
  }, [filteredTeams]);

  return (
    <section id="leaderboard" className="w-full">
      {/* Top Action Bar: Categories & Vintage Game Board Ceremony Launcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        {tracks.length > 2 ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1.5 font-display">
              <i className="bi bi-funnel-fill text-cyan-400" /> Category:
            </span>
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setSelectedTrack(track)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-sans ${
                  selectedTrack === track
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                    : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {track === "ALL" ? "All Categories" : track}
              </button>
            ))}
          </div>
        ) : <div />}

        {/* Vintage Game Board Score Ceremony Button */}
        <button
          onClick={() => setIsCeremonyOpen(true)}
          disabled={teams.length === 0}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/40 font-display disabled:opacity-40 shrink-0"
          title="Watch vintage arcade game board score reveal ceremony"
        >
          <i className="bi bi-joystick text-sm text-amber-400" />
          <span>🎮 Game Board Ceremony</span>
        </button>
      </div>

      {/* Main Leaderboard Table / Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center rounded-3xl border border-slate-800 bg-slate-900/40">
          <i className="bi bi-arrow-repeat text-cyan-400 text-3xl animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-200 font-display">Loading leaderboard standings...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center rounded-3xl border border-slate-800 bg-slate-900/40 px-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-2xl mb-3 shadow-inner">
            <i className="bi bi-shield-x" />
          </div>
          <h4 className="text-base font-bold text-slate-200 mb-1 font-display">
            {selectedTrack !== "ALL" ? "No matching teams found in this category" : "No teams registered yet"}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm">
            {selectedTrack !== "ALL"
              ? "Try selecting 'All Categories' above to see all registered teams."
              : "Teams will appear on the leaderboard in real time once registered."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status / Header Badge */}
          <div className="flex items-center justify-between px-2 mb-1">
            <div className="flex items-center gap-2.5">
              {hasAnyScoredTeams ? (
                <>
                  <i className="bi bi-trophy-fill text-amber-400 text-sm" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-display">
                    Live Standings
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                    • Top 7 highlighted with podium styling • Live auto-reordering
                  </span>
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check text-cyan-400 text-sm" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300 font-display">
                    Registered Teams (Awaiting Review 1)
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
                    • Rankings will activate automatically after Review 1 scores are entered
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] font-mono-numbers text-slate-500 font-medium">
              {filteredTeams.length} {filteredTeams.length === 1 ? "team" : "teams"}
            </span>
          </div>

          {/* Unified Desktop Table View */}
          <div className="hidden md:block rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/85 shadow-2xl backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 font-display bg-slate-900/80">
                  <th className="py-4 px-4 text-center w-24">Rank</th>
                  <th className="py-4 px-4">Team Name & Category</th>
                  <th className="py-4 px-3 text-center w-24">Review 1</th>
                  <th className="py-4 px-3 text-center w-24">Review 2</th>
                  <th className="py-4 px-3 text-center w-24">Review 3</th>
                  <th className="py-4 px-3 text-center w-28">Points</th>
                  <th className="py-4 px-6 text-right w-40">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <AnimatePresence initial={false}>
                  {filteredTeams.map((team) => (
                    <TeamRow
                      key={team.id || team.teamId}
                      team={team}
                      maxScore={maxScore}
                      isTop7Section={(team.score || 0) > 0 && team.rank != null && team.rank <= 7}
                      onSelectTeam={(t) => setSelectedTeam(t)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Unified Mobile Card View */}
          <div className="md:hidden space-y-2.5">
            <AnimatePresence initial={false}>
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id || team.teamId}
                  team={team}
                  maxScore={maxScore}
                  onSelectTeam={(t) => setSelectedTeam(t)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Separate Team Card Modal (Shown when clicked) */}
      <TeamDetailsModal
        team={activeSelectedTeam}
        topScore={maxScore}
        onClose={() => setSelectedTeam(null)}
      />

      {/* Vintage Game Board Scoring Ceremony */}
      <VintageGameBoardCeremony
        teams={teams}
        isOpen={isCeremonyOpen}
        onClose={() => setIsCeremonyOpen(false)}
        title="LIVE LEADERBOARD SCORE CEREMONY"
      />
    </section>
  );
};
