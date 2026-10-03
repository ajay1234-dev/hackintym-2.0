"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Team, HackathonConfig } from "@/types";
import { TeamRow } from "./TeamRow";
import { TeamCard } from "./TeamCard";
import { TeamDetailsModal } from "./TeamDetailsModal";
import { Top7Avengers } from "./avengers/Top7Avengers";
import { AvengerProfileModal } from "./avengers/AvengerProfileModal";
import { subscribeToHackathonConfig } from "@/lib/firebase/firestore";

interface LeaderboardProps {
  teams: Team[];
  isLoading?: boolean;
}

type ViewMode = "ALL" | "AVENGERS" | "TABLE";

export const Leaderboard: React.FC<LeaderboardProps> = ({
  teams,
  isLoading = false,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [config, setConfig] = useState<HackathonConfig | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("ALL");

  // Subscribe to realtime config for live publishing session sync across all screens
  useEffect(() => {
    return subscribeToHackathonConfig((newConfig) => {
      setConfig(newConfig);
    });
  }, []);

  const publishingSession = config?.publishingSession || null;
  const isPublishingActive = publishingSession && publishingSession.status === "IN_PROGRESS";

  // Sync selectedTeam with latest realtime teams array so modal always shows up-to-date avatar & score
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

  // Determine whether clicked team receives the AvengerProfileModal or standard TeamDetailsModal
  const isTop7Selected = Boolean(
    activeSelectedTeam &&
      (activeSelectedTeam.score || 0) > 0 &&
      activeSelectedTeam.rank != null &&
      activeSelectedTeam.rank <= 7
  );

  return (
    <section id="leaderboard" className="w-full space-y-6">
      {/* Top Action Bar: Categories, View Mode & Realtime Sync Status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle (when teams are evaluated) */}
          {hasAnyScoredTeams && (
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-display">
              <button
                type="button"
                onClick={() => setViewMode("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "ALL"
                    ? "bg-gradient-to-r from-rose-500/20 to-cyan-500/20 text-white border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Views
              </button>
              <button
                type="button"
                onClick={() => setViewMode("AVENGERS")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  viewMode === "AVENGERS"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "text-slate-400 hover:text-amber-300"
                }`}
              >
                <i className="bi bi-shield-fill text-[11px]" />
                <span>Top 7 Avengers</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === "TABLE"
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Full Table
              </button>
            </div>
          )}

          {/* Live sync status pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono-numbers">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REALTIME SYNC</span>
          </div>
        </div>
      </div>

      {/* Live Scoring Ceremony Active Banner */}
      {isPublishingActive && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-cyan-500/15 border-2 border-amber-400/70 shadow-2xl shadow-amber-950/40 animate-pulse flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              <i className="bi bi-broadcast text-lg animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 font-display flex items-center gap-2">
                <span>Review {publishingSession.reviewNum} Score Publishing Ceremony</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Rapid numbers flipping live • Marks revealing sequentially from least to Rank 1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-400/40 font-mono-numbers text-xs font-bold text-amber-300">
            <span>{publishingSession.lockedTeamIds?.length || 0}</span>
            <span className="text-slate-500">/</span>
            <span>{publishingSession.sequence?.length || 0} Teams Locked In</span>
          </div>
        </div>
      )}

      {/* Loading state */}
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
        <div className="space-y-8">
          {/* ═══════════════════════════════════════════════════════════════
              1. THE TOP 7 AVENGERS OF HACKINTYM (Cinematic Hero Presentation)
             ═══════════════════════════════════════════════════════════════ */}
          {hasAnyScoredTeams && (viewMode === "ALL" || viewMode === "AVENGERS") && (
            <Top7Avengers
              teams={filteredTeams}
              onSelectTeam={(t) => setSelectedTeam(t)}
            />
          )}

          {/* ═══════════════════════════════════════════════════════════════
              2. FULL LEADERBOARD TABLE / CARDS (All Teams Standings)
             ═══════════════════════════════════════════════════════════════ */}
          {(viewMode === "ALL" || viewMode === "TABLE" || !hasAnyScoredTeams) && (
            <div className="space-y-4">
              {/* Header Separator */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  {hasAnyScoredTeams ? (
                    <>
                      <i className="bi bi-list-ol text-cyan-400 text-sm" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-200 font-display">
                        Complete Leaderboard Standings
                      </span>
                      <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                        • Top 7 marked with dynamic Avenger identities • 60fps auto-reordering
                      </span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check text-cyan-400 text-sm" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300 font-display">
                        Registered Teams (Awaiting Review 1)
                      </span>
                      <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
                        • Top 7 Avengers will assemble once Review 1 scores are published
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[11px] font-mono-numbers text-slate-500 font-medium">
                  {filteredTeams.length} {filteredTeams.length === 1 ? "team" : "teams"}
                </span>
              </div>

              {/* Unified Desktop Table View */}
              <div className="hidden md:block rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-400 font-display bg-slate-900/80">
                      <th className="py-4 px-4 text-center w-24">Rank</th>
                      <th className="py-4 px-4">Team Name & Category</th>
                      <th className="py-4 px-3 text-center w-24">Review 1</th>
                      <th className="py-4 px-3 text-center w-24">Review 2</th>
                      <th className="py-4 px-3 text-center w-24">Review 3</th>
                      <th className="py-4 px-3 text-center w-28">Points</th>
                      <th className="py-4 px-6 text-right w-44">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <AnimatePresence initial={false}>
                      {filteredTeams.map((team) => (
                        <TeamRow
                          key={team.id || team.teamId}
                          team={team}
                          maxScore={maxScore}
                          publishingSession={publishingSession}
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
                      publishingSession={publishingSession}
                      onSelectTeam={(t) => setSelectedTeam(t)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL ROUTING: Top 7 Avenger Profile vs Standard Team Details ─── */}
      {isTop7Selected ? (
        <AvengerProfileModal
          team={activeSelectedTeam}
          onClose={() => setSelectedTeam(null)}
        />
      ) : (
        <TeamDetailsModal
          team={activeSelectedTeam}
          topScore={maxScore}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </section>
  );
};
