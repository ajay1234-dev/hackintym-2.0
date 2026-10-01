"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { HackathonConfig } from "@/types";
import { formatTimeRemaining } from "@/lib/utils";

interface FlipCardProps {
  value: string;
  label: string;
  vast?: boolean;
}

const FlipCard: React.FC<FlipCardProps> = ({ value, label, vast = false }) => {
  const prevRef = useRef<string>(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== prevRef.current) {
      setIsFlipping(true);
      prevRef.current = value;
      const t = setTimeout(() => {
        setIsFlipping(false);
      }, 420);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flip-clock-unit">
      {/* Vintage Flip Card Body */}
      <div className={`${vast ? "vintage-flip-card-vast" : "vintage-flip-card"} group`}>
        {/* Mechanical Side Notches */}
        <div className="vintage-notch-left" />
        <div className="vintage-notch-right" />

        {/* Subtle Top-Card Glossy Sheen */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none z-10" />

        {/* 
          Single Full Number — completely visible, crisp, centered, 
          divided by the horizontal groove, with top-to-bottom flip animation on change
        */}
        <div
          key={value}
          className={`${vast ? "vintage-digit-text-vast" : "vintage-digit-text"} ${isFlipping ? "animate-flip-down" : ""}`}
        >
          {value}
        </div>
      </div>

      {/* Card Unit Label */}
      <span
        className={`font-black uppercase tracking-[0.25em] text-slate-300 font-display ${
          vast ? "text-xs sm:text-sm md:text-base" : "text-[11px] sm:text-xs"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

// Separator Colon
const Separator: React.FC<{ vast?: boolean }> = ({ vast = false }) => (
  <div className={`flex flex-col items-center justify-center gap-3 sm:gap-4 ${vast ? "pb-8 sm:pb-12" : "pb-6"}`}>
    <span
      className={`rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] ${
        vast ? "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
      }`}
    />
    <span
      className={`rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] ${
        vast ? "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
      }`}
    />
  </div>
);

interface CountdownTimerProps {
  config: HackathonConfig;
  vast?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ config, vast = false }) => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { status, remainingMs, progressPercent } = useMemo(() => {
    const { eventStatus, startTime, endTime, durationHours } = config;
    const durationMs = (durationHours || 30) * 3600 * 1000;
    const cur = mounted && now > 0 ? now : (startTime || 0);

    if (eventStatus === "UPCOMING" || !startTime || !endTime) {
      return { status: "UPCOMING", remainingMs: durationMs, progressPercent: 0 };
    }
    if (eventStatus === "PAUSED") {
      const rem = Math.max(0, endTime - cur);
      const prog = Math.min(100, Math.max(0, ((durationMs - rem) / durationMs) * 100));
      return { status: "PAUSED", remainingMs: rem, progressPercent: prog };
    }
    if (eventStatus === "ENDED" || cur >= endTime) {
      return { status: "ENDED", remainingMs: 0, progressPercent: 100 };
    }
    const rem = Math.max(0, endTime - cur);
    const prog = Math.min(100, Math.max(0, ((durationMs - rem) / durationMs) * 100));
    return { status: rem <= 0 ? "ENDED" : "LIVE", remainingMs: rem, progressPercent: prog };
  }, [config, now, mounted]);

  const time = formatTimeRemaining(remainingMs);
  const isExpired = status === "ENDED";

  const statusBadge = () => {
    if (status === "LIVE") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold bg-rose-500/15 border border-rose-500/40 text-rose-400 tracking-wider uppercase font-display shadow-[0_0_20px_rgba(244,63,94,0.35)]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
          LIVE COMPETITION
        </span>
      );
    }
    if (status === "PAUSED") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold bg-sky-500/15 border border-sky-500/40 text-sky-400 tracking-wider uppercase font-display">
          <i className="bi bi-pause-fill text-base" /> PAUSED
        </span>
      );
    }
    if (status === "ENDED") {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold bg-purple-500/15 border border-purple-500/40 text-purple-400 tracking-wider uppercase font-display">
          <i className="bi bi-check-circle-fill text-base" /> CONCLUDED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold bg-amber-500/15 border border-amber-500/40 text-amber-400 tracking-wider uppercase font-display">
        <i className="bi bi-clock-history animate-pulse text-base" /> STARTING SOON
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Vast Extended Outer Box */}
      <div
        className={`relative rounded-3xl sm:rounded-[36px] border border-slate-800/90 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden ${
          vast ? "p-6 sm:p-10 lg:p-14" : "p-5 sm:p-7"
        }`}
      >
        {/* Ambient Stage Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 75%)",
          }}
        />

        {/* Header inside timer box */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <i className="bi bi-stopwatch-fill text-lg sm:text-xl" />
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-white font-display">
                {config.eventName || "HackinTym'26 2.0"} — Official Timer
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                {config.durationHours || 30}-Hour Hackathon Official Sprint Clock
              </p>
            </div>
          </div>
          <div>{statusBadge()}</div>
        </div>

        {/* Vintage Flip Clock Display */}
        <div className={`relative z-10 flex items-center justify-center py-4 ${vast ? "gap-4 sm:gap-8 lg:gap-12" : "gap-3 sm:gap-6"}`}>
          {isExpired ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <div className="w-16 h-16 rounded-3xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 text-3xl mb-1 shadow-lg">
                <i className="bi bi-trophy-fill" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white font-display">
                Hackathon Concluded
              </p>
              <p className="text-sm text-slate-400 max-w-md">
                Final competition standings are locked on the official leaderboard.
              </p>
            </div>
          ) : (
            <>
              <FlipCard value={time.totalHoursStr ?? "00"} label="Hours" vast={vast} />
              <Separator vast={vast} />
              <FlipCard value={time.minutesStr ?? "00"} label="Minutes" vast={vast} />
              <Separator vast={vast} />
              <FlipCard value={time.secondsStr ?? "00"} label="Seconds" vast={vast} />
            </>
          )}
        </div>

        {/* Extended Sprint Progress Bar */}
        {vast && !isExpired && (
          <div className="relative z-10 mt-10 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono-numbers text-slate-400 mb-2">
              <span className="font-bold text-slate-300">Sprint Timeline ({progressPercent.toFixed(1)}% Elapsed)</span>
              <span>{config.durationHours || 30} Hours Total</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-400 transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{ width: `${Math.max(1, progressPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
