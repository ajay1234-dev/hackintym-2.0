"use client";

import React, { useState, useEffect, useRef } from "react";
import { soundManager } from "@/lib/utils";

interface CasioScoreScramblerProps {
  value: number;
  isScrambling?: boolean;
  isChampion?: boolean;
  className?: string;
  prefix?: string;
  suffix?: string;
  minDigits?: number;
  playSound?: boolean;
  onLockIn?: () => void;
}

export const CasioScoreScrambler: React.FC<CasioScoreScramblerProps> = ({
  value,
  isScrambling = false,
  isChampion = false,
  className = "",
  prefix = "",
  suffix = "",
  minDigits = 3,
  playSound = false,
  onLockIn,
}) => {
  const [displayedText, setDisplayedText] = useState<string>(() => {
    return String(value).padStart(minDigits, "0");
  });
  const [justLocked, setJustLocked] = useState<boolean>(false);
  const prevScrambleRef = useRef<boolean>(isScrambling);
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pad helper
  const formatNum = (n: number) => String(n).padStart(minDigits, "0");

  useEffect(() => {
    // If scrambling is active
    if (isScrambling) {
      prevScrambleRef.current = true;
      setJustLocked(false);

      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);

      scrambleIntervalRef.current = setInterval(() => {
        // Generate random digital digits
        let randomStr = "";
        for (let i = 0; i < Math.max(minDigits, String(value).length); i++) {
          randomStr += Math.floor(Math.random() * 10).toString();
        }
        setDisplayedText(randomStr);

        if (playSound && Math.random() > 0.4) {
          soundManager.playCasioScrambleTick();
        }
      }, 45);

      return () => {
        if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
      };
    } else {
      // Transition from scrambling -> locked
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }

      setDisplayedText(formatNum(value));

      if (prevScrambleRef.current) {
        prevScrambleRef.current = false;
        setJustLocked(true);
        if (playSound) {
          soundManager.playCasioBeep();
        }
        onLockIn?.();
        const timeout = setTimeout(() => setJustLocked(false), 800);
        return () => clearTimeout(timeout);
      }
    }
  }, [isScrambling, value, minDigits, playSound, onLockIn]);

  return (
    <span
      className={`inline-flex items-center font-mono-numbers tracking-widest font-black tabular-nums transition-all select-none ${
        isScrambling
          ? "casio-flipping text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-105"
          : justLocked
          ? "casio-locked-pulse text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
          : isChampion
          ? "text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]"
          : "text-emerald-400"
      } ${className}`}
    >
      {prefix && <span className="text-[0.75em] opacity-75 mr-1">{prefix}</span>}
      <span className="relative">
        {/* Faint LCD Ghost Segments (like classic Casio watches) */}
        <span
          className="absolute inset-0 opacity-10 text-emerald-700 pointer-events-none"
          aria-hidden="true"
        >
          {"8".repeat(displayedText.length)}
        </span>
        <span className="relative z-10">{displayedText}</span>
      </span>
      {suffix && <span className="text-[0.75em] opacity-75 ml-1">{suffix}</span>}
    </span>
  );
};
