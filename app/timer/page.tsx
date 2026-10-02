"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HackathonConfig } from "@/types";
import { subscribeToHackathonConfig } from "@/lib/firebase/firestore";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { CustomTimerModal } from "@/components/admin/CustomTimerModal";
import { INITIAL_HACKATHON_CONFIG } from "@/lib/firebase/mockData";
import { soundManager } from "@/lib/utils";

export default function TimerPage() {
  const [config, setConfig] = useState<HackathonConfig>(INITIAL_HACKATHON_CONFIG);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    setSoundOn(soundManager.isEnabled());
    const unsub = subscribeToHackathonConfig((newConfig) => {
      setConfig(newConfig);
    });

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      unsub();
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleSound = () => {
    const next = soundManager.toggleSound();
    setSoundOn(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans select-none">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Bar Controls */}
      <header className="relative z-10 flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="HackinTym'26 2.0"
            className="h-10 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform"
          />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight font-display text-white">
              HackinTym'26 2.0
            </h1>
            <p className="text-[10px] tracking-widest font-bold uppercase text-slate-400">
              HALL PROJECTION SCREEN
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            title={soundOn ? "Mute Sound FX" : "Enable Sound FX"}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-md"
          >
            <i className={`bi ${soundOn ? "bi-volume-up-fill text-cyan-400" : "bi-volume-mute-fill text-slate-500"} text-base`} />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md font-display"
          >
            <i className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-arrows-fullscreen"} text-cyan-400`} />
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          <button
            onClick={() => setShowCustomModal(true)}
            title="Custom Timer Settings & Quick Extension"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md font-display"
          >
            <i className="bi bi-sliders text-cyan-400" />
            <span className="hidden sm:inline">Timer Settings</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-cyan-500/20 hover:from-rose-500/30 hover:to-cyan-500/30 border border-slate-700/80 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md font-display"
          >
            <i className="bi bi-trophy-fill text-amber-400 text-sm" />
            <span>Leaderboard</span>
          </Link>
        </div>
      </header>

      {/* Center Hero: The Vast Vintage Flip Timer Alone */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 max-w-6xl mx-auto w-full">
        <div className="w-full">
          <CountdownTimer config={config} vast={true} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-2 text-xs text-slate-500 font-display">
        HackinTym'26 2.0 • 30-Hour Official Intra-College Hackathon
      </footer>

      {/* Custom Timer Modal */}
      <CustomTimerModal
        isOpen={showCustomModal}
        config={config}
        onClose={() => setShowCustomModal(false)}
      />
    </div>
  );
}
