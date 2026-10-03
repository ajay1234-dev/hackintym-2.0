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
  const [displayValue, setDisplayValue] = useState<number>(value);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const prevValueRef = useRef<number>(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (value === prev) return;

    prevValueRef.current = value;
    setIsRolling(true);

    if (playSound) {
      soundManager.playScoreUpdate();
    }

    const startValue = displayValue;
    const diff = value - startValue;
    const duration = 750; // ms
    const startTime = performance.now();

    const animateRoll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out expo for arcade mechanical feel
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + diff * ease);

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateRoll);
      } else {
        setDisplayValue(value);
        setIsRolling(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateRoll);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, displayValue, playSound]);

  return (
    <span
      className={`inline-flex items-baseline font-mono-numbers font-black tabular-nums transition-all ${
        isRolling
          ? "vintage-score-rolling scale-110 text-cyan-300"
          : isChampion
          ? "vintage-score-champion text-amber-300"
          : ""
      } ${className}`}
    >
      {prefix && <span className="text-[0.8em] opacity-80 mr-0.5">{prefix}</span>}
      <span>{displayValue.toLocaleString()}</span>
      {suffix && <span className="text-[0.8em] opacity-80 ml-0.5">{suffix}</span>}
    </span>
  );
};
