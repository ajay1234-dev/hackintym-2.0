"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Team, HackathonConfig, AdminUser } from "@/types";
import {
  subscribeToTeams,
  subscribeToHackathonConfig,
  triggerCinematicIntroBroadcast,
} from "@/lib/firebase/firestore";
import { subscribeToAuth } from "@/lib/firebase/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TimerControls } from "@/components/admin/TimerControls";
import { ReviewScoringPanel } from "@/components/admin/ReviewScoringPanel";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { AdminLeaderboardPreview } from "@/components/admin/AdminLeaderboardPreview";
import { INITIAL_HACKATHON_CONFIG, INITIAL_TEAMS } from "@/lib/firebase/mockData";

export default function AdminPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [config, setConfig] = useState<HackathonConfig>(INITIAL_HACKATHON_CONFIG);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBroadcastingIntro, setIsBroadcastingIntro] = useState(false);

  // Authenticated state listener
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setAdminUser(user);
      setAuthChecking(false);
      if (!user) {
        router.replace("/admin/login");
      }
    });

    const unsubTeams = subscribeToTeams((updated) => {
      setTeams(updated);
    });

    const unsubConfig = subscribeToHackathonConfig((updated) => {
      setConfig(updated);
    });

    return () => {
      unsubAuth();
      unsubTeams();
      unsubConfig();
    };
  }, [router]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 font-sans">
        <i className="bi bi-arrow-repeat text-3xl text-rose-500 animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
          Checking Admin Authorization...
        </p>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans">
      
      {/* Admin Navbar */}
      <AdminHeader adminUser={adminUser} status={config.eventStatus} />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 animate-fadeIn">
          <i className="bi bi-stars text-cyan-400 text-sm animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Control Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome & System Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl cyber-card border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shadow-md">
              <img src="/logo.png" alt="HackinTym'26 2.0" className="h-8 w-auto object-contain rounded-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                HackinTym'26 2.0 Master Control Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-slate-200 font-semibold">{adminUser.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-numbers text-slate-400 self-start sm:self-auto bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AUTHORITATIVE STATE SYNC</span>
          </div>
        </div>

        {/* Live Scoreboard Cinematic Intro Broadcast Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <i className="bi bi-broadcast-pin text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white font-display flex items-center gap-2">
                <span>Top 7 Avengers Ceremony Broadcast</span>
                <span className="text-[10px] text-amber-300 font-normal border border-amber-400/40 px-2 py-0.5 rounded-full bg-amber-500/10">
                  Live Screen Trigger
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Broadcast the full-screen Avengers Assemble opening ceremony to the live scoreboard
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBroadcastingIntro}
            onClick={async () => {
              setIsBroadcastingIntro(true);
              try {
                await triggerCinematicIntroBroadcast();
                showNotification("Top 7 Avengers Cinematic Intro broadcasted to the live scoreboard!");
              } catch (err) {
                console.error(err);
                showNotification("Could not trigger broadcast. Check console.");
              } finally {
                setTimeout(() => setIsBroadcastingIntro(false), 2500);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider font-display shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50 shrink-0"
          >
            {isBroadcastingIntro ? (
              <>
                <i className="bi bi-arrow-repeat animate-spin text-sm" />
                <span>Broadcasting to Screen...</span>
              </>
            ) : (
              <>
                <i className="bi bi-play-circle-fill text-sm" />
                <span>Trigger Cinematic Intro</span>
              </>
            )}
          </button>
        </div>

        {/* Top Controls: 30-Hour Timer Control Engine */}
        <section>
          <TimerControls config={config} onNotification={showNotification} />
        </section>

        {/* Review Scoring Panel — 3 reviews, bulk publish */}
        <section>
          <ReviewScoringPanel
            teams={teams}
            onNotification={showNotification}
          />
        </section>

        {/* Live Leaderboard Preview (read-only) */}
        <section>
          <AdminLeaderboardPreview
            teams={teams}
            onSelectTeamForScore={() => {
              window.scrollTo({ top: 300, behavior: "smooth" });
            }}
          />
        </section>

        {/* Full Team Roster CRUD Management */}
        <section>
          <TeamManagement
            teams={teams}
            onNotification={showNotification}
          />
        </section>

        {/* Team Details Modal */}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950/90 backdrop-blur-xl text-center text-xs text-slate-400 font-display">
        HackinTym'26 2.0 Admin Console • Authoritative 30-Hour Scoring System
      </footer>

    </div>
  );
}
