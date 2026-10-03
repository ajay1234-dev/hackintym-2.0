"use client";

import React, { useState, useEffect, useRef } from "react";
import { soundManager } from "@/lib/utils";

interface VintageScoreTickerProps {
  value: number;
  className?: string;
  isChampion?: boolean;
  prefix?: string;
  suffix?: string;
  playSound?: boolean;
}

export const VintageScoreTicker: React.FC<VintageScoreTickerProps> = ({
  value,
  className = "",
  isChampion = false,
  prefix = "",
  suffix = "",
  playSound = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => String(value));
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const prevValueRef = useRef<number>(value);
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    prevValueRef.current = value;
    setIsFlipping(true);
    setIsLocked(false);

    if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
    if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);

    const digitCount = Math.max(3, String(value).length);

    // Rapid Casio random number flipping at high speed
    scrambleIntervalRef.current = setInterval(() => {
      let rand = "";
      for (let i = 0; i < digitCount; i++) {
        rand += Math.floor(Math.random() * 10).toString();
      }
      setDisplayValue(rand);

      if (playSound && Math.random() > 0.45) {
        soundManager.playCasioScrambleTick();
      }
    }, 40);

    // Lock in marks after suspenseful rapid flip cycle
    lockTimeoutRef.current = setTimeout(() => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
        scrambleIntervalRef.current = null;
      }
      setDisplayValue(value.toLocaleString());
      setIsFlipping(false);
      setIsLocked(true);

      if (playSound) {
        soundManager.playCasioBeep();
      }

      setTimeout(() => setIsLocked(false), 700);
    }, 750);

    return () => {
      if (scrambleIntervalRef.current) clearInterval(scrambleIntervalRef.current);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
    };
  }, [value, playSound]);

  return (
    <span
      className={`inline-flex items-baseline font-mono-numbers font-black tabular-nums transition-all select-none ${
        isFlipping
          ? "casio-flipping scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          : isLocked
          ? "casio-locked-pulse text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
          : isChampion
          ? "vintage-score-champion text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          : "text-white"
      } ${className}`}
    >
      {prefix && <span className="text-[0.8em] opacity-80 mr-0.5">{prefix}</span>}
      <span>{displayValue}</span>
      {suffix && <span className="text-[0.8em] opacity-80 ml-0.5">{suffix}</span>}
    </span>
  );
};

