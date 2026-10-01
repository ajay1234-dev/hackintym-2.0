"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { HackathonConfig } from "@/types";
import { formatTimeRemaining } from "@/lib/utils";

interface MiniFlipCardProps {
  value: string;
  label: string;
}

const MiniFlipCard: React.FC<MiniFlipCardProps> = ({ value, label }) => {
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
    <div className="flex flex-col items-center gap-1">
      <div className="vintage-flip-card-mini">
        <div
          key={value}
          className={`vintage-digit-text-mini ${isFlipping ? "animate-flip-down" : ""}`}
        >
          {value}
        </div>
      </div>
      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-display">
        {label}
      </span>
    </div>
  );
};

interface MiniCountdownTimerProps {
  config: HackathonConfig;
}

export const MiniCountdownTimer: React.FC<MiniCountdownTimerProps> = ({ config }) => {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { status, remainingMs } = useMemo(() => {
    const { eventStatus, startTime, endTime, durationHours } = config;
    const durationMs = (durationHours || 30) * 3600 * 1000;
    const cur = mounted && now > 0 ? now : (startTime || 0);

    if (eventStatus === "UPCOMING" || !startTime || !endTime) {
      return { status: "UPCOMING", remainingMs: durationMs };
    }
    if (eventStatus === "PAUSED") {
      return { status: "PAUSED", remainingMs: Math.max(0, endTime - cur) };
    }
    if (eventStatus === "ENDED" || cur >= endTime) {
      return { status: "ENDED", remainingMs: 0 };
    }
    const rem = Math.max(0, endTime - cur);
    return { status: rem <= 0 ? "ENDED" : "LIVE", remainingMs: rem };
  }, [config, now, mounted]);

  const time = formatTimeRemaining(remainingMs);
  const isExpired = status === "ENDED";

  const getStatusBadge = () => {
    if (status === "LIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-rose-500/15 border border-rose-500/40 text-rose-400 tracking-wider uppercase font-display shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          LIVE
        </span>
      );
    }
    if (status === "PAUSED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-sky-500/15 border border-sky-500/40 text-sky-400 tracking-wider uppercase font-display">
          <i className="bi bi-pause-fill" /> PAUSED
        </span>
      );
    }
    if (status === "ENDED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/15 border border-purple-500/40 text-purple-400 tracking-wider uppercase font-display">
          <i className="bi bi-check-circle-fill" /> CONCLUDED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/15 border border-amber-500/40 text-amber-400 tracking-wider uppercase font-display">
        <i className="bi bi-clock-history animate-pulse" /> STARTING SOON
      </span>
    );
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800/90 shadow-xl p-3 sm:p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Hackathon Sprint & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <i className="bi bi-stopwatch-fill text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-white font-display">
                {config.eventName || "HackinTym'26 2.0"}
              </span>
              {getStatusBadge()}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Official {config.durationHours || 30}-Hour Sprint Countdown
            </p>
          </div>
        </div>

        {/* Center: Miniature Vintage Flip Timer */}
        <div className="flex items-center gap-2 sm:gap-3 py-1">
          {isExpired ? (
            <span className="text-sm font-black text-purple-300 font-display flex items-center gap-1.5">
              <i className="bi bi-trophy-fill text-purple-400" /> Hackathon Ended
            </span>
          ) : (
            <>
              <MiniFlipCard value={time.totalHoursStr ?? "00"} label="Hours" />
              <div className="flex flex-col items-center justify-center gap-1.5 pb-3">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
              </div>
              <MiniFlipCard value={time.minutesStr ?? "00"} label="Mins" />
              <div className="flex flex-col items-center justify-center gap-1.5 pb-3">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
              </div>
              <MiniFlipCard value={time.secondsStr ?? "00"} label="Secs" />
            </>
          )}
        </div>

        {/* Right: Fullscreen Timer Projection Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/timer"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-cyan-500/20 hover:from-rose-500/30 hover:to-cyan-500/30 border border-slate-700/80 hover:border-cyan-500/60 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md group font-display"
            title="Open Large Timer in a New Window for Projector Screen"
          >
            <i className="bi bi-arrows-fullscreen text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Open Timer Screen</span>
            <i className="bi bi-box-arrow-up-right text-[11px] text-slate-400 group-hover:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
};
