"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Team } from "@/types";
import { TeamRow } from "./TeamRow";
import { TeamCard } from "./TeamCard";
import { TeamDetailsModal } from "./TeamDetailsModal";

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

  // Split into top 7 and rest of teams (strictly evaluated teams with score > 0 and rank <= 7 are in top 7)
  const top7 = filteredTeams.filter(
    (t) => (t.score || 0) > 0 && t.rank != null && t.rank <= 7
  );
  const rest = filteredTeams.filter((t) => !top7.includes(t));

  return (
    <section id="leaderboard" className="w-full">
      {/* Track Filter Chips (if multiple categories exist) */}
      {tracks.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1.5 font-display">
            <i className="bi bi-funnel-fill text-cyan-400" /> Category:
          </span>
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-sans ${
                selectedTrack === track
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                  : "bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {track === "ALL" ? "All Categories" : track}
            </button>
          ))}
        </div>
      )}

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
        <div className="space-y-6">
          {/* ═════════ TOP 7 SECTION ═════════ */}
          {top7.length > 0 && (
            <div>
              {/* Top 7 Header Badge */}
              <div className="flex items-center gap-2.5 px-1 mb-3">
                <i className="bi bi-trophy-fill text-amber-400 text-sm" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-display">
                  Top 7 Podium Rankings
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
              </div>

              {/* Desktop Table View */}
              <div
                className="hidden md:block rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-950/20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(245,158,11,0.05) 0%, rgba(10,14,24,0.98) 100%)",
                }}
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-900/40 text-[11px] font-black uppercase tracking-wider text-amber-400 font-display bg-amber-500/5">
                      <th className="py-4 px-4 text-center w-24">Rank</th>
                      <th className="py-4 px-4">Team Name & Category</th>
                      <th className="py-4 px-3 text-center w-24">Review 1</th>
                      <th className="py-4 px-3 text-center w-24">Review 2</th>
                      <th className="py-4 px-3 text-center w-24">Review 3</th>
                      <th className="py-4 px-3 text-center w-28">Points</th>
                      <th className="py-4 px-6 text-right w-40">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/20">
                    <AnimatePresence initial={false}>
                      {top7.map((team) => (
                        <TeamRow
                          key={team.id || team.teamId}
                          team={team}
                          maxScore={maxScore}
                          isTop7Section={true}
                          onSelectTeam={(t) => setSelectedTeam(t)}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-2.5">
                <AnimatePresence initial={false}>
                  {top7.map((team) => (
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

          {/* ═════════ OTHER TEAMS SECTION ═════════ */}
          {rest.length > 0 && (
            <div>
              {/* Rest Section Separator */}
              <div className="flex items-center gap-2.5 px-1 mb-3">
                {top7.length === 0 ? (
                  <>
                    <i className="bi bi-shield-check text-cyan-400 text-sm" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-300 font-display">
                      Registered Teams (Awaiting Review 1)
                    </span>
                    <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
                      • Rankings will activate automatically after Review 1 scores are entered
                    </span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-list-ol text-slate-500 text-sm" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-display">
                      Participating Teams
                    </span>
                  </>
                )}
                <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 font-display bg-slate-900/60">
                      <th className="py-3.5 px-4 text-center w-24">Rank</th>
                      <th className="py-3.5 px-4">Team Name & Category</th>
                      <th className="py-3.5 px-3 text-center w-24">Review 1</th>
                      <th className="py-3.5 px-3 text-center w-24">Review 2</th>
                      <th className="py-3.5 px-3 text-center w-24">Review 3</th>
                      <th className="py-3.5 px-3 text-center w-28">Points</th>
                      <th className="py-3.5 px-6 text-right w-40">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <AnimatePresence initial={false}>
                      {rest.map((team) => (
                        <TeamRow
                          key={team.id || team.teamId}
                          team={team}
                          maxScore={maxScore}
                          isTop7Section={false}
                          onSelectTeam={(t) => setSelectedTeam(t)}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-2">
                <AnimatePresence initial={false}>
                  {rest.map((team) => (
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
        </div>
      )}

      {/* Separate Team Card Modal (Shown when clicked) */}
      <TeamDetailsModal
        team={activeSelectedTeam}
        topScore={maxScore}
        onClose={() => setSelectedTeam(null)}
      />
    </section>
  );
};
