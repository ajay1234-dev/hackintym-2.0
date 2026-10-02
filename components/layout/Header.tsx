"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EventStatus, AdminUser } from "@/types";
import { soundManager } from "@/lib/utils";
import { logoutAdmin } from "@/lib/firebase/auth";

interface HeaderProps {
  status: EventStatus;
  adminUser?: AdminUser | null;
}

export const Header: React.FC<HeaderProps> = ({ status, adminUser }) => {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(soundManager.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = soundManager.toggleSound();
    setSoundOn(next);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "LIVE":
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-extrabold tracking-wider uppercase font-display">
              LIVE COMPETITION
            </span>
          </div>
        );
      case "UPCOMING":
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <i className="bi bi-clock-history text-xs animate-pulse" />
            <span className="text-xs font-extrabold tracking-wider uppercase font-display">
              STARTING SOON
            </span>
          </div>
        );
      case "PAUSED":
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <span className="h-2 w-2 rounded-full bg-sky-400"></span>
            <span className="text-xs font-extrabold tracking-wider uppercase font-display">
              TIMER PAUSED
            </span>
          </div>
        );
      case "ENDED":
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <i className="bi bi-stars text-xs" />
            <span className="text-xs font-extrabold tracking-wider uppercase font-display">
              HACKATHON COMPLETED
            </span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-3">
          
          {/* Logo & Subtitle */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative flex items-center justify-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 group-hover:border-rose-500/50 transition-all duration-300 shadow-lg shadow-slate-950/50">
              <img
                src="/logo.png"
                alt="HackinTym'26 2.0 Logo"
                className="h-10 sm:h-11 w-auto object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-white group-hover:via-cyan-400 group-hover:to-rose-400 transition-all">
                  HackinTym'26 2.0
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono-numbers">
                  30H
                </span>
              </div>
              <p className="text-[10px] tracking-widest font-semibold uppercase text-slate-400 group-hover:text-slate-300 mt-0.5">
                INTRA-COLLEGE HACKATHON
              </p>
            </div>
          </Link>

          {/* Center Status (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {getStatusBadge()}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer Screen Button */}
            <Link
              href="/timer"
              target="_blank"
              title="Open Hall Projection Timer"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-md text-xs font-bold font-display"
            >
              <i className="bi bi-arrows-fullscreen text-cyan-400" />
              <span className="hidden md:inline">Timer Screen</span>
            </Link>


            {/* Audio Toggle Button */}
            <button
              onClick={handleToggleSound}
              title={soundOn ? "Disable Sound FX" : "Enable Sound FX"}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-all flex items-center justify-center shadow-md"
            >
              {soundOn ? (
                <i className="bi bi-volume-up-fill text-sm text-cyan-400" />
              ) : (
                <i className="bi bi-volume-mute-fill text-sm text-slate-500" />
              )}
            </button>

            {/* Admin Dashboard / Login Button */}
            {adminUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-rose-950/30 font-display"
                >
                  <i className="bi bi-shield-lock-fill text-sm" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
                <button
                  onClick={() => logoutAdmin()}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all flex items-center justify-center shadow-md"
                >
                  <i className="bi bi-box-arrow-right text-sm" />
                </button>
              </div>
            ) : (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs sm:text-sm font-bold transition-all group font-display shadow-md"
              >
                <i className="bi bi-shield-lock-fill text-sm text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Admin</span>
                <i className="bi bi-chevron-right text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="md:hidden flex items-center justify-center pb-3 pt-1">
          {getStatusBadge()}
        </div>
      </div>
    </header>
  );
};
