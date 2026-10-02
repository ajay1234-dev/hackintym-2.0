"use client";

import React, { useState, useEffect } from "react";
import { HackathonConfig } from "@/types";
import { updateCustomTimer } from "@/lib/firebase/firestore";
import { formatTimeRemaining, soundManager } from "@/lib/utils";

interface CustomTimerModalProps {
  isOpen: boolean;
  config: HackathonConfig;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

type TabType = "duration" | "extension" | "exact" | "target";

export const CustomTimerModal: React.FC<CustomTimerModalProps> = ({
  isOpen,
  config,
  onClose,
  onNotification,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("duration");

  // Tab 1: Custom Duration inputs
  const [customHours, setCustomHours] = useState<number>(() => Math.floor(config.durationHours || 30));
  const [customMinutes, setCustomMinutes] = useState<number>(() =>
    Math.round(((config.durationHours || 30) % 1) * 60)
  );

  // Tab 2: Live Quick Extension input
  const [extensionMinutes, setExtensionMinutes] = useState<number>(15);

  // Tab 3: Exact Remaining inputs
  const [exactHours, setExactHours] = useState<number>(1);
  const [exactMinutes, setExactMinutes] = useState<number>(30);

  // Tab 4: Target End Date/Time input
  const [targetDateTime, setTargetDateTime] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate current live remaining time for display
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    if (!isOpen) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Sync inputs when config updates
  useEffect(() => {
    if (config.durationHours) {
      setCustomHours(Math.floor(config.durationHours));
      setCustomMinutes(Math.round((config.durationHours % 1) * 60));
    }
  }, [config.durationHours]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute live remaining ms
  const isLive = config.eventStatus === "LIVE";
  const isPaused = config.eventStatus === "PAUSED";
  const currentEnd = config.endTime || (now + (config.durationHours || 30) * 3600 * 1000);
  const remainingMs = isPaused
    ? (config.pausedRemainingMs ?? Math.max(0, currentEnd - now))
    : isLive
    ? Math.max(0, currentEnd - now)
    : (config.durationHours || 30) * 3600 * 1000;
  const timeFormatted = formatTimeRemaining(remainingMs);

  // 1. Handle Setting Custom Duration
  const handleSaveDuration = async (h?: number, m?: number) => {
    const hours = h !== undefined ? h : customHours;
    const minutes = m !== undefined ? m : customMinutes;

    if (hours < 0 || minutes < 0 || (hours === 0 && minutes === 0)) {
      setErrorMsg("Duration must be greater than 0 minutes.");
      return;
    }

    const totalHours = Number((hours + minutes / 60).toFixed(2));
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await updateCustomTimer({ durationHours: totalHours });
      soundManager.playScoreUpdate();
      const msg = `Custom duration set to ${hours}h ${minutes > 0 ? `${minutes}m` : ""} (${totalHours} hours total).`;
      onNotification?.(msg);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update duration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Live Quick Extension
  const handleApplyExtension = async (deltaMins: number) => {
    if (deltaMins === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await updateCustomTimer({ minutesDelta: deltaMins });
      soundManager.playScoreUpdate();
      const sign = deltaMins > 0 ? "+" : "";
      const msg = `Applied ${sign}${deltaMins} minutes timer adjustment to live countdown!`;
      onNotification?.(msg);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to adjust timer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Setting Exact Remaining Time
  const handleSetExactRemaining = async () => {
    if (exactHours < 0 || exactMinutes < 0 || (exactHours === 0 && exactMinutes === 0)) {
      setErrorMsg("Remaining time must be greater than 0.");
      return;
    }

    const totalMinutes = exactHours * 60 + exactMinutes;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await updateCustomTimer({ exactRemainingMinutes: totalMinutes });
      soundManager.playScoreUpdate();
      const msg = `Clock overridden: Exactly ${exactHours}h ${exactMinutes}m remaining on all screens.`;
      onNotification?.(msg);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to override countdown. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Target Date & Time
  const handleSetTargetTime = async () => {
    if (!targetDateTime) {
      setErrorMsg("Please select a target finish date and time.");
      return;
    }

    const targetTimestamp = new Date(targetDateTime).getTime();
    if (isNaN(targetTimestamp) || targetTimestamp <= Date.now()) {
      setErrorMsg("Target finish time must be in the future.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await updateCustomTimer({ targetEndTime: targetTimestamp });
      soundManager.playScoreUpdate();
      const targetStr = new Date(targetTimestamp).toLocaleTimeString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      const msg = `Target end time set to ${targetStr}. Countdown synchronized.`;
      onNotification?.(msg);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to set target finish time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPresets = [
    { label: "30 Hours (Default)", h: 30, m: 0 },
    { label: "24 Hours (Full Day)", h: 24, m: 0 },
    { label: "36 Hours (Extended)", h: 36, m: 0 },
    { label: "48 Hours (2 Days)", h: 48, m: 0 },
    { label: "18 Hours", h: 18, m: 0 },
    { label: "12 Hours (Half Day)", h: 12, m: 0 },
    { label: "6 Hours", h: 6, m: 0 },
    { label: "3 Hours", h: 3, m: 0 },
    { label: "1 Hour (Sprint)", h: 1, m: 0 },
    { label: "45 Minutes", h: 0, m: 45 },
    { label: "30 Minutes", h: 0, m: 30 },
    { label: "15 Minutes (Demo)", h: 0, m: 15 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-950 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] p-4.5 sm:p-7 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-all z-20 flex items-center justify-center shadow-md"
          title="Close (Esc)"
        >
          <i className="bi bi-x-lg text-sm" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shrink-0">
            <i className="bi bi-sliders text-xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              Custom Timer Settings
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Configure custom duration, live time extensions, or override countdown
            </p>
          </div>
        </div>

        {/* Live Status Pill & Current Clock Display */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display block">
              Current Competition Clock
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border font-display ${
                  config.eventStatus === "LIVE"
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse"
                    : config.eventStatus === "PAUSED"
                    ? "bg-sky-500/20 border-sky-500/40 text-sky-400"
                    : config.eventStatus === "ENDED"
                    ? "bg-purple-500/20 border-purple-500/40 text-purple-400"
                    : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                }`}
              >
                {config.eventStatus}
              </span>
              <span className="text-xs text-slate-400 font-mono-numbers">
                Default: {config.durationHours || 30}h
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black font-mono-numbers text-cyan-300 tracking-wider">
              {timeFormatted.totalHoursStr}:{timeFormatted.minutesStr}:{timeFormatted.secondsStr}
            </span>
            <span className="text-[10px] text-slate-500 block uppercase font-mono-numbers">
              Remaining
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 mb-6 gap-1 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => { setActiveTab("duration"); setErrorMsg(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "duration"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <i className="bi bi-clock text-xs" />
            <span>Set Duration</span>
          </button>

          <button
            onClick={() => { setActiveTab("extension"); setErrorMsg(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "extension"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <i className="bi bi-plus-slash-minus text-xs" />
            <span>Live Quick Extension</span>
          </button>

          <button
            onClick={() => { setActiveTab("exact"); setErrorMsg(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "exact"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <i className="bi bi-stopwatch text-xs" />
            <span>Override Clock</span>
          </button>

          <button
            onClick={() => { setActiveTab("target"); setErrorMsg(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "target"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <i className="bi bi-calendar-event text-xs" />
            <span>Target Finish Time</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
            <i className="bi bi-exclamation-circle-fill text-rose-400 text-sm shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ─── TAB 1: SET CUSTOM DURATION ─── */}
        {activeTab === "duration" && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-display">
                Enter Custom Hours & Minutes
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1 font-display">
                    Hours
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={customHours}
                    onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-numbers text-xl font-black focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1 font-display">
                    Minutes
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) =>
                      setCustomMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-numbers text-xl font-black focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-display">
                Quick Competition Length Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {quickPresets.map((p) => {
                  const isCurrent = customHours === p.h && customMinutes === p.m;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setCustomHours(p.h);
                        setCustomMinutes(p.m);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs font-sans ${
                        isCurrent
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm"
                          : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className="block font-bold">{p.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono-numbers">
                        {p.h}h {p.m > 0 ? `${p.m}m` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveDuration()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-rose-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 disabled:opacity-50 font-display flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-base" />
                  <span>Updating Timer Across All Screens...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle text-lg" />
                  <span>Apply & Save {customHours}h {customMinutes > 0 ? `${customMinutes}m` : ""} Duration</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ─── TAB 2: LIVE QUICK EXTENSIONS (+ / -) ─── */}
        {activeTab === "extension" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
              <p className="font-bold flex items-center gap-1.5 font-display text-cyan-300">
                <i className="bi bi-lightning-charge-fill text-amber-400" />
                Live Competition Time Adjustment
              </p>
              <p className="mt-1 text-slate-400 font-sans">
                Instantly adds or subtracts time from the live countdown without restarting the hackathon. Changes apply to the hall projector screen and mobile leaderboard immediately.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 font-display">
                One-Click Quick Extensions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: "+15 Mins", delta: 15, style: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25" },
                  { label: "+30 Mins", delta: 30, style: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25" },
                  { label: "+45 Mins", delta: 45, style: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25" },
                  { label: "+1 Hour", delta: 60, style: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25" },
                  { label: "+2 Hours", delta: 120, style: "bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25" },
                  { label: "+3 Hours", delta: 180, style: "bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25" },
                  { label: "-15 Mins", delta: -15, style: "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25" },
                  { label: "-30 Mins", delta: -30, style: "bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25" },
                ].map((ext) => (
                  <button
                    key={ext.label}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleApplyExtension(ext.delta)}
                    className={`py-3 px-3 rounded-xl border text-center font-black font-mono-numbers text-xs transition-all shadow-sm ${ext.style} disabled:opacity-50`}
                  >
                    {ext.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Minutes Extension */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-display">
                Custom Extension Minutes
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={extensionMinutes}
                  onChange={(e) => setExtensionMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="Minutes to add"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono-numbers text-sm font-bold focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleApplyExtension(extensionMinutes)}
                  className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider font-display transition-all shadow-md disabled:opacity-50"
                >
                  +{extensionMinutes}m Extension
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: OVERRIDE COUNTDOWN TO EXACT HH:MM ─── */}
        {activeTab === "exact" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <p className="font-bold flex items-center gap-1.5 font-display text-amber-300">
                <i className="bi bi-exclamation-triangle-fill text-amber-400" />
                Direct Countdown Override
              </p>
              <p className="mt-1 text-slate-400 font-sans">
                Forces the timer to display exactly this remaining time right now across all hall projectors and participants.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-display">
                Set Remaining Clock To Exactly:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1 font-display">
                    Remaining Hours
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={exactHours}
                    onChange={(e) => setExactHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-numbers text-xl font-black focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1 font-display">
                    Remaining Minutes
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={exactMinutes}
                    onChange={(e) =>
                      setExactMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-numbers text-xl font-black focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSetExactRemaining}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50 font-display flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-base" />
                  <span>Synchronizing Override Clock...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-stopwatch text-base" />
                  <span>Override Remaining Time to {exactHours}h {exactMinutes}m</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ─── TAB 4: TARGET FINISH DATE & TIME ─── */}
        {activeTab === "target" && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200">
              <p className="font-bold flex items-center gap-1.5 font-display text-purple-300">
                <i className="bi bi-calendar-check text-purple-400" />
                Target Finish Date & Time
              </p>
              <p className="mt-1 text-slate-400 font-sans">
                Set a specific calendar date and time when the hackathon countdown reaches 00:00:00. The system computes remaining hours and keeps participants synchronized.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-display">
                Select Finish Date & Time
              </label>
              <input
                type="datetime-local"
                value={targetDateTime}
                onChange={(e) => setTargetDateTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white font-mono-numbers text-sm font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSetTargetTime}
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-950/40 disabled:opacity-50 font-display flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin text-base" />
                  <span>Calculating & Synchronizing Target Time...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-calendar-event text-base" />
                  <span>Set Exact Finish Date & Time</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
