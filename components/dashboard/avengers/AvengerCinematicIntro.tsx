"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AVENGER_RANKS } from "@/lib/avengers";
import { AvengerIcon } from "./AvengerIcons";
import { soundManager } from "@/lib/utils";

interface AvengerCinematicIntroProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const AvengerCinematicIntro: React.FC<AvengerCinematicIntroProps> = ({
  isOpen,
  onFinish,
}) => {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<number>(0);
  // Phase 0: "THE BATTLE HAS ENDED"
  // Phase 1: "SEVEN REMAIN"
  // Phase 2: "THE TOP 7 • THE AVENGERS OF HACKINTYM"
  // Phase 3: Seven rank markers reveal (01 to 07)
  // Phase 4: Complete!

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      return;
    }

    soundManager.playScoreUpdate();
    setPhase(0);

    const t1 = setTimeout(() => {
      setPhase(1);
    }, 700);

    const t2 = setTimeout(() => {
      setPhase(2);
      soundManager.playCasioScrambleTick();
    }, 1400);

    const t3 = setTimeout(() => {
      setPhase(3);
      soundManager.playCasioBeep();
    }, 2200);

    const t4 = setTimeout(() => {
      onFinish();
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onFinish]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-white select-none overflow-hidden font-display">
      {/* Subtle traveling red/blue energy streaks */}
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: "200%" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 -translate-y-1/2 h-[2px] w-1/3 bg-gradient-to-r from-rose-500 via-white to-cyan-400 opacity-70 blur-[1px]"
      />

      <div className="text-center px-4 max-w-xl space-y-4 relative z-10">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="p0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                HACKINTYM 2.0 • EVOLUTION ARENA
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-slate-100">
                THE BATTLE HAS ENDED.
              </h2>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="p1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-rose-400 block mb-1">
                ONLY THE STRONGEST SURVIVED
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-white">
                SEVEN REMAIN.
              </h2>
            </motion.div>
          )}

          {phase >= 2 && (
            <motion.div
              key="p2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 block">
                  THE TOP 7
                </span>
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1 bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-transparent">
                  THE AVENGERS OF HACKINTYM
                </h1>
                <p className="text-xs text-slate-400 font-sans italic mt-1">
                  &quot;Seven teams. Seven identities. One battlefield.&quot;
                </p>
              </div>

              {/* Phase 3: Seven Rank Markers Reveal */}
              {phase === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 sm:gap-3 pt-3 flex-wrap"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((num, i) => {
                    const hero = AVENGER_RANKS[num];
                    return (
                      <motion.div
                        key={num}
                        initial={{ opacity: 0, scale: 0.5, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 400 }}
                        className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-md min-w-[50px]"
                        style={{ borderColor: hero.colors.badgeBorder }}
                      >
                        <AvengerIcon type={hero.iconType} size={18} />
                        <span
                          className="font-mono-numbers font-black text-xs mt-1"
                          style={{ color: hero.colors.primary }}
                        >
                          0{num}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-sans">
                          {hero.heroName.split(" ")[0]}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button in bottom corner */}
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
