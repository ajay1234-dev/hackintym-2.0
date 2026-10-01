"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Team, HackathonConfig, AdminUser } from "@/types";
import {
  subscribeToTeams,
  subscribeToHackathonConfig,
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
