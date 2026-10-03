"use client";

import React, { useState, useEffect } from "react";
import { Team, HackathonConfig, AdminUser } from "@/types";
import {
  subscribeToTeams,
  subscribeToHackathonConfig,
} from "@/lib/firebase/firestore";
import { subscribeToAuth } from "@/lib/firebase/auth";
import { Header } from "@/components/layout/Header";
import { MiniCountdownTimer } from "@/components/dashboard/MiniCountdownTimer";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { AvengerCinematicIntro } from "@/components/dashboard/avengers/AvengerCinematicIntro";
import { INITIAL_HACKATHON_CONFIG, INITIAL_TEAMS } from "@/lib/firebase/mockData";

export default function Home() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [config, setConfig] = useState<HackathonConfig>(INITIAL_HACKATHON_CONFIG);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCinematicIntroActive, setIsCinematicIntroActive] = useState(false);
  const lastTriggerTimeRef = React.useRef<number>(0);

  // Listen for admin broadcasted cinematic assemble sequence
  useEffect(() => {
    if (config.cinematicIntroTriggeredAt) {
      const triggerTime = config.cinematicIntroTriggeredAt;
      const now = Date.now();
      if (now - triggerTime < 20000 && triggerTime > lastTriggerTimeRef.current) {
        lastTriggerTimeRef.current = triggerTime;
        setIsCinematicIntroActive(true);
      }
    }
  }, [config.cinematicIntroTriggeredAt]);

  useEffect(() => {
    const unsubTeams = subscribeToTeams((updatedTeams) => {
      setTeams(updatedTeams);
      setIsLoading(false);
    });
    const unsubConfig = subscribeToHackathonConfig((updatedConfig) => {
      setConfig(updatedConfig);
    });
    const unsubAuth = subscribeToAuth((user) => {
      setAdminUser(user);
    });
    return () => {
      unsubTeams();
      unsubConfig();
      unsubAuth();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-100">
      <Header status={config.eventStatus} adminUser={adminUser} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* ─── 1. TOP COMPACT FLIP TIMER BAR WITH FULLSCREEN BUTTON ─── */}
        <section className="w-full">
          <MiniCountdownTimer config={config} />
        </section>

        {/* ─── 2. LIVE LEADERBOARD (Front & Center, No Congestion) ─── */}
        <section className="w-full">
          <Leaderboard teams={teams} isLoading={isLoading} />
        </section>
      </main>

      {/* Admin Broadcasted Fullscreen Cinematic Intro Overlay */}
      <AvengerCinematicIntro
        isOpen={isCinematicIntroActive}
        onFinish={() => setIsCinematicIntroActive(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/95 py-6 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto object-contain rounded" />
            <span className="font-display font-bold text-slate-400">
              HackinTym'26 2.0 • 30-Hour Intra-College Hackathon
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-mono-numbers text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Leaderboard
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
