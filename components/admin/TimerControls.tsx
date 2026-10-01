"use client";

import React, { useState } from "react";
import { HackathonConfig } from "@/types";
import { setHackathonStatus, resetHackathon } from "@/lib/firebase/firestore";
import { soundManager } from "@/lib/utils";

interface TimerControlsProps {
  config: HackathonConfig;
  onNotification?: (msg: string) => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  config,
  onNotification,
}) => {
  const [duration, setDuration] = useState<number>(config.durationHours || 30);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStart = async () => {
    setIsUpdating(true);
    try {
      await setHackathonStatus("LIVE", duration);
      soundManager.playEventStart();
      if (onNotification) onNotification("Hackathon started! Authoritative 30-hour countdown is now LIVE.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePause = async () => {
    setIsUpdating(true);
    try {
      await setHackathonStatus("PAUSED", duration);
      if (onNotification) onNotification("Hackathon timer has been paused.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResume = async () => {
    setIsUpdating(true);
    try {
      await setHackathonStatus("LIVE", duration);
      if (onNotification) onNotification("Hackathon timer resumed.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnd = async () => {
    if (!confirm("Are you sure you want to end the hackathon? This will freeze the leaderboard.")) {
      return;
    }
    setIsUpdating(true);
    try {
      await setHackathonStatus("ENDED", duration);
      if (onNotification) onNotification("Hackathon officially completed!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset hackathon to UPCOMING? The countdown will be cleared.")) {
      return;
    }
    setIsUpdating(true);
    try {
      await resetHackathon(duration);
      if (onNotification) onNotification("Hackathon status reset to UPCOMING.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-3xl cyber-card border border-slate-800 p-6 sm:p-7 shadow-2xl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 font-display">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
            <i className="bi bi-clock-history text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white">
              Hackathon Timer & Event Controls
            </h3>
            <p className="text-xs text-slate-400">Manage authoritative sprint countdown status</p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-bold font-mono-numbers shadow-sm">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              config.eventStatus === "LIVE"
                ? "bg-rose-500 animate-ping"
                : config.eventStatus === "PAUSED"
                ? "bg-sky-400"
                : config.eventStatus === "ENDED"
                ? "bg-purple-400"
                : "bg-amber-400"
            }`}
          />
          <span className="text-slate-300">STATUS: {config.eventStatus}</span>
        </div>
      </div>

      {/* Duration Selector */}
      <div className="mb-6 p-4.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
            Sprint Duration
          </label>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Default competition length is 30 hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[30, 24, 12, 1].map((hrs) => (
            <button
              key={hrs}
              type="button"
              onClick={() => setDuration(hrs)}
              disabled={config.eventStatus === "LIVE"}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono-numbers transition-all ${
                duration === hrs
                  ? "bg-cyan-400 text-slate-950 font-black shadow-md"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              } disabled:opacity-50`}
            >
              {hrs}h
            </button>
          ))}
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* START / RESUME */}
        {config.eventStatus === "PAUSED" ? (
          <button
            onClick={handleResume}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 font-display"
          >
            <i className="bi bi-play-fill text-base" />
            <span>RESUME</span>
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isUpdating || config.eventStatus === "LIVE"}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50 disabled:opacity-40 disabled:cursor-not-allowed font-display"
          >
            <i className="bi bi-play-fill text-base" />
            <span>START HACKATHON</span>
          </button>
        )}

        {/* PAUSE */}
        <button
          onClick={handlePause}
          disabled={isUpdating || config.eventStatus !== "LIVE"}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-sky-400 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed font-display shadow-md"
        >
          <i className="bi bi-pause-fill text-base" />
          <span>PAUSE TIMER</span>
        </button>

        {/* END */}
        <button
          onClick={handleEnd}
          disabled={isUpdating || config.eventStatus === "ENDED"}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-purple-400 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed font-display shadow-md"
        >
          <i className="bi bi-check-circle-fill text-sm" />
          <span>END EVENT</span>
        </button>

        {/* RESET */}
        <button
          onClick={handleReset}
          disabled={isUpdating}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40 font-display shadow-md"
        >
          <i className="bi bi-arrow-counterclockwise text-sm" />
          <span>RESET TIMER</span>
        </button>
      </div>

    </div>
  );
};
