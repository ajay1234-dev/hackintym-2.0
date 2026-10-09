"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AVENGER_RANKS } from "@/lib/avengers";
import { AvengerIcon } from "./AvengerIcons";
import { soundManager } from "@/lib/utils";
import { Team } from "@/types";

interface AvengerCinematicIntroProps {
  isOpen: boolean;
  teams?: Team[];
  onFinish: () => void;
}

// Phases:
// 0 — "THE BATTLE HAS ENDED."           (1.2s)
// 1 — "SEVEN REMAIN."                    (1.2s)
// 2 — "THE AVENGERS OF HACKINTYM"        (1.4s)
// 3..9 — reveal rank 7 → rank 1 one by one (each ~1.3s)
// 10 — final full assemble view           (3s then onFinish)

const REVEAL_DURATION = 1350; // ms per team card reveal
const PHASE_OFFSET = 3;       // phase index where reveals start (phase 3 = rank 7)

export const AvengerCinematicIntro: React.FC<AvengerCinematicIntroProps> = ({
  isOpen,
  teams = [],
  onFinish,
}) => {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  // revealedRanks: which rank cards have been shown so far
  const [revealedRanks, setRevealedRanks] = useState<number[]>([]);
  const [activeRevealRank, setActiveRevealRank] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearAll = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      setRevealedRanks([]);
      setActiveRevealRank(null);
      clearAll();
      return;
    }

    setPhase(0);
    setRevealedRanks([]);
    setActiveRevealRank(null);

    soundManager.playScoreUpdate();

    // Opening text phases
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => {
      setPhase(2);
      soundManager.playCasioScrambleTick();
    }, 2400);
    const t3 = setTimeout(() => {
      setPhase(3);
      soundManager.playCasioBeep();
    }, 3800);

    timersRef.current = [t1, t2, t3];

    // Reveal ranks 7 → 1, one by one
    const ranks = [7, 6, 5, 4, 3, 2, 1];
    ranks.forEach((rank, i) => {
      const startAt = 3800 + i * REVEAL_DURATION;

      const tReveal = setTimeout(() => {
        setActiveRevealRank(rank);
        setPhase(PHASE_OFFSET + i);
        soundManager.playCasioBeep();
      }, startAt);

      const tAdd = setTimeout(() => {
        setRevealedRanks((prev) => [...prev, rank]);
        setActiveRevealRank(null);
      }, startAt + REVEAL_DURATION - 100);

      timersRef.current.push(tReveal, tAdd);
    });

    // Final assembled view
    const finalStart = 3800 + ranks.length * REVEAL_DURATION;
    const tFinalPhase = setTimeout(() => {
      setPhase(10);
      setRevealedRanks([1, 2, 3, 4, 5, 6, 7]);
      soundManager.playScoreUpdate();
    }, finalStart);

    const tFinish = setTimeout(() => {
      onFinish();
    }, finalStart + 3200);

    timersRef.current.push(tFinalPhase, tFinish);

    return clearAll;
  }, [isOpen, onFinish]);

  if (!mounted || !isOpen) return null;

  // Get team for a given rank
  const getTeamForRank = (rank: number): Team | null => {
    return (
      teams.find(
        (t) => (t.score || 0) > 0 && t.rank === rank
      ) || null
    );
  };

  const isFinalPhase = phase === 10;
  const isTextPhase = phase < PHASE_OFFSET;
  const isRevealPhase = phase >= PHASE_OFFSET && !isFinalPhase;

  // Current rank being spotlit (rank 7 first, rank 1 last)
  const ranks = [7, 6, 5, 4, 3, 2, 1];
  const currentRevealIdx = phase - PHASE_OFFSET;
  const currentRevealRank = isRevealPhase && currentRevealIdx >= 0 ? ranks[currentRevealIdx] : null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden font-display">

      {/* Animated background energy lines */}
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: "200%" }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
        className="absolute top-[35%] h-[1px] w-2/5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60"
      />
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: "200%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.9, repeatDelay: 0.8 }}
        className="absolute top-[65%] h-[1px] w-1/3 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"
      />
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: "200%" }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "linear", delay: 1.4, repeatDelay: 0.3 }}
        className="absolute top-[50%] h-[1px] w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"
      />

      {/* Corner glow ambients */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ══════════════════════════════════════════════
          OPENING TEXT PHASES (phase 0, 1, 2)
         ══════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {isTextPhase && (
          <motion.div
            key={`text-phase-${phase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="text-center px-6 relative z-10"
          >
            {phase === 0 && (
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500 block mb-3">
                  HACKINTYM 2.0 • EVOLUTION ARENA
                </span>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider text-slate-100 leading-tight">
                  THE BATTLE<br />HAS ENDED.
                </h2>
              </div>
            )}
            {phase === 1 && (
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-rose-400 block mb-3">
                  ONLY THE STRONGEST SURVIVED
                </span>
                <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-[0.15em] text-white leading-tight">
                  SEVEN<br />REMAIN.
                </h2>
              </div>
            )}
            {phase === 2 && (
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400 block">
                  PRESENTING
                </span>
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-transparent leading-tight">
                  THE AVENGERS<br />OF HACKINTYM
                </h1>
                <p className="text-xs text-slate-400 font-sans italic mt-2">
                  &quot;Seven teams. Seven identities. One battlefield.&quot;
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          INDIVIDUAL TEAM REVEAL PHASE (phase 3–9)
         ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRevealPhase && currentRevealRank !== null && (() => {
          const hero = AVENGER_RANKS[currentRevealRank];
          const team = getTeamForRank(currentRevealRank);
          return (
            <motion.div
              key={`reveal-${currentRevealRank}`}
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              className="relative z-10 flex flex-col items-center gap-5 px-6 w-full max-w-md"
            >
              {/* Rank + entry label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <span
                  className="text-[10px] font-black uppercase tracking-[0.4em] block mb-1"
                  style={{ color: hero.colors.primary }}
                >
                  {currentRevealRank === 1
                    ? "⭐ ENTERING THE ARENA — THE CHAMPION"
                    : currentRevealRank === 7
                    ? "OPENING THE GATES — RANK #7"
                    : `RISING TO RANK #${currentRevealRank}`}
                </span>
              </motion.div>

              {/* Hero Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="w-full rounded-3xl border p-6 relative overflow-hidden"
                style={{
                  background: hero.colors.bgGradient,
                  borderColor: hero.colors.border,
                  boxShadow: `0 0 60px -10px ${hero.colors.glow}, 0 0 30px -15px ${hero.colors.primary}`,
                }}
              >
                {/* Watermark icon */}
                <div
                  className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none"
                  style={{ color: hero.colors.primary }}
                >
                  <AvengerIcon type={hero.iconType} size={160} />
                </div>

                {/* Top strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                  style={{
                    background: `linear-gradient(90deg, ${hero.colors.secondary}, ${hero.colors.primary}, ${hero.colors.secondary})`,
                  }}
                />

                <div className="relative z-10 flex items-center gap-4">
                  {/* Rank badge */}
                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 font-mono-numbers font-black shrink-0 shadow-lg"
                    style={{
                      backgroundColor: hero.colors.badgeBg,
                      borderColor: hero.colors.badgeBorder,
                      color: hero.colors.badgeText,
                      boxShadow: `0 0 20px -5px ${hero.colors.primary}`,
                    }}
                  >
                    <span className="text-[9px] font-sans uppercase text-slate-400 tracking-wider">RANK</span>
                    <span className="text-2xl leading-none">#{hero.rank}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Hero name */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <span
                        className="text-xs font-black uppercase tracking-widest block"
                        style={{ color: hero.colors.primary }}
                      >
                        {hero.heroName}
                      </span>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-sans">
                        {hero.title}
                      </p>
                    </motion.div>

                    {/* Team name */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.38 }}
                      className="mt-2"
                    >
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display truncate">
                        {team ? team.teamName : <span className="text-slate-500 text-lg">TBD</span>}
                      </h2>
                      {team && (
                        <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1 mt-0.5">
                          <i className="bi bi-tag-fill text-cyan-400 text-[9px]" />
                          {team.track || "General Track"}
                          {team.score > 0 && (
                            <>
                              <span className="text-slate-600 mx-1">•</span>
                              <span className="font-mono-numbers font-bold" style={{ color: hero.colors.primary }}>
                                {team.score} pts
                              </span>
                            </>
                          )}
                        </span>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Already-revealed stack below (shrunk) */}
              {revealedRanks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap items-center justify-center gap-2 mt-1"
                >
                  {[...revealedRanks].reverse().map((r) => {
                    const h = AVENGER_RANKS[r];
                    return (
                      <motion.div
                        key={r}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase"
                        style={{
                          backgroundColor: h.colors.badgeBg,
                          borderColor: h.colors.badgeBorder,
                          color: h.colors.badgeText,
                        }}
                      >
                        <AvengerIcon type={h.iconType} size={11} />
                        <span>#{r}</span>
                        <span className="opacity-70">{h.heroName.split(" ")[0]}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          FINAL ASSEMBLED VIEW (phase 10)
         ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isFinalPhase && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-2xl"
          >
            {/* Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 block">
                HACKINTYM 2.0 • THE FINAL SEVEN
              </span>
              <h1 className="text-xl sm:text-3xl font-black uppercase bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-transparent tracking-tight">
                AVENGERS ASSEMBLED
              </h1>
            </div>

            {/* All 7 cards in rank order 1→7 */}
            <div className="w-full space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((rank, i) => {
                const hero = AVENGER_RANKS[rank];
                const team = getTeamForRank(rank);
                return (
                  <motion.div
                    key={rank}
                    initial={{ opacity: 0, x: rank % 2 === 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 320, damping: 26 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border"
                    style={{
                      background: hero.colors.bgGradient,
                      borderColor: hero.colors.border,
                    }}
                  >
                    {/* Rank badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex flex-col items-center justify-center border font-mono-numbers font-black shrink-0 text-sm"
                      style={{
                        backgroundColor: hero.colors.badgeBg,
                        borderColor: hero.colors.badgeBorder,
                        color: hero.colors.badgeText,
                      }}
                    >
                      #{rank}
                    </div>

                    {/* Hero icon + name */}
                    <div style={{ color: hero.colors.primary }}>
                      <AvengerIcon type={hero.iconType} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-[10px] font-black uppercase tracking-wider block"
                        style={{ color: hero.colors.primary }}
                      >
                        {hero.heroName}
                      </span>
                      <span className="text-sm font-black text-white font-display truncate block">
                        {team ? team.teamName : <span className="text-slate-500 text-xs">TBD</span>}
                      </span>
                    </div>

                    {/* Score */}
                    {team && team.score > 0 && (
                      <span
                        className="font-mono-numbers font-black text-base shrink-0"
                        style={{ color: hero.colors.primary }}
                      >
                        {team.score}
                        <span className="text-[9px] text-slate-400 ml-0.5">pts</span>
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <button
        type="button"
        onClick={onFinish}
        className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all"
      >
        Skip ✕
      </button>
    </div>,
    document.body
  );
};
