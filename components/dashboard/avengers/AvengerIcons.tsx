"use client";

import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export const ArcReactorIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#f59e0b" strokeWidth="2.5" strokeOpacity="0.4" />
    <circle cx="50" cy="50" r="41" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6 3" />
    <circle cx="50" cy="50" r="32" stroke="#dc2626" strokeWidth="2" strokeOpacity="0.8" />
    <polygon
      points="50,24 72,64 28,64"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="50" r="14" fill="#fbbf24" fillOpacity="0.25" stroke="#fef08a" strokeWidth="2" />
    <circle cx="50" cy="50" r="6" fill="#ffffff" />
    {/* Micro Nodes */}
    <circle cx="50" cy="24" r="2.5" fill="#fef08a" />
    <circle cx="72" cy="64" r="2.5" fill="#fef08a" />
    <circle cx="28" cy="64" r="2.5" fill="#fef08a" />
  </svg>
);

export const VibraniumShieldIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#94a3b8" strokeWidth="2" strokeOpacity="0.4" />
    {/* Outer Red Ring */}
    <circle cx="50" cy="50" r="43" stroke="#dc2626" strokeWidth="6" />
    {/* Middle Silver Ring */}
    <circle cx="50" cy="50" r="35" stroke="#cbd5e1" strokeWidth="6" />
    {/* Inner Red Ring */}
    <circle cx="50" cy="50" r="27" stroke="#dc2626" strokeWidth="6" />
    {/* Blue Center */}
    <circle cx="50" cy="50" r="19" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
    {/* Five-point Star */}
    <polygon
      points="50,33 54,44 65,44 56,51 59,62 50,55 41,62 44,51 35,44 46,44"
      fill="#ffffff"
    />
  </svg>
);

export const MjolnirLightningIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
    {/* Lightning arcs in background */}
    <path
      d="M30 20 L40 45 L32 50 L52 82 L44 56 L54 50 Z"
      fill="#38bdf8"
      fillOpacity="0.2"
      stroke="#7dd3fc"
      strokeWidth="1.5"
    />
    {/* Mjolnir Head */}
    <rect
      x="34"
      y="30"
      width="32"
      height="22"
      rx="3"
      fill="#475569"
      stroke="#94a3b8"
      strokeWidth="2.5"
    />
    <rect x="36" y="32" width="28" height="18" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.7" />
    {/* Nordic carved groove */}
    <line x1="38" y1="41" x2="62" y2="41" stroke="#cbd5e1" strokeWidth="1.5" />
    {/* Handle */}
    <rect x="47" y="52" width="6" height="28" rx="1.5" fill="#78350f" stroke="#b45309" strokeWidth="1.5" />
    {/* Leather wrap ridges */}
    <line x1="47" y1="58" x2="53" y2="60" stroke="#f59e0b" strokeWidth="1" />
    <line x1="47" y1="65" x2="53" y2="67" stroke="#f59e0b" strokeWidth="1" />
    <line x1="47" y1="72" x2="53" y2="74" stroke="#f59e0b" strokeWidth="1" />
  </svg>
);

export const GammaPowerIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#10b981" strokeWidth="2" strokeOpacity="0.4" />
    {/* Radiation Tri-foil Blades */}
    <circle cx="50" cy="50" r="38" stroke="#059669" strokeWidth="2" strokeDasharray="8 6" />
    {/* Top blade */}
    <path
      d="M50 50 L42 22 C47 20 53 20 58 22 Z"
      fill="#10b981"
      fillOpacity="0.8"
      stroke="#34d399"
      strokeWidth="1.5"
    />
    {/* Bottom right blade */}
    <path
      d="M50 50 L68 62 C65 67 60 71 54 73 Z"
      fill="#10b981"
      fillOpacity="0.8"
      stroke="#34d399"
      strokeWidth="1.5"
    />
    {/* Bottom left blade */}
    <path
      d="M50 50 L46 73 C40 71 35 67 32 62 Z"
      fill="#10b981"
      fillOpacity="0.8"
      stroke="#34d399"
      strokeWidth="1.5"
    />
    {/* Central Core */}
    <circle cx="50" cy="50" r="11" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
    <circle cx="50" cy="50" r="5" fill="#34d399" />
  </svg>
);

export const WebInsigniaIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.4" />
    {/* Concentric Web Rings */}
    <circle cx="50" cy="50" r="36" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="22" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 3" />
    {/* Radial Web Struts */}
    <line x1="50" y1="14" x2="50" y2="86" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.6" />
    <line x1="14" y1="50" x2="86" y2="50" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.6" />
    <line x1="24" y1="24" x2="76" y2="76" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5" />
    <line x1="24" y1="76" x2="76" y2="24" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5" />
    {/* Stylized Spider Icon Body */}
    <ellipse cx="50" cy="46" rx="5" ry="7" fill="#f43f5e" />
    <ellipse cx="50" cy="57" rx="7" ry="9" fill="#f43f5e" />
    {/* Spider Legs */}
    <path d="M48 44 Q36 34 32 40" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 44 Q64 34 68 40" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 48 Q32 44 28 54" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 48 Q68 44 72 54" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 56 Q34 62 34 72" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <path d="M52 56 Q66 62 66 72" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const StealthHourglassIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#e11d48" strokeWidth="2" strokeOpacity="0.4" />
    {/* Tactical Infiltration Reticle */}
    <circle cx="50" cy="50" r="38" stroke="#334155" strokeWidth="2" />
    <circle cx="50" cy="50" r="32" stroke="#e11d48" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />
    {/* Black Widow Hourglass */}
    <polygon
      points="36,26 64,26 50,48"
      fill="#e11d48"
      stroke="#fda4af"
      strokeWidth="1.5"
    />
    <polygon
      points="50,52 64,74 36,74"
      fill="#e11d48"
      stroke="#fda4af"
      strokeWidth="1.5"
    />
    {/* Precision Target Brackets */}
    <path d="M22 36 L18 36 L18 64 L22 64" stroke="#e11d48" strokeWidth="2" />
    <path d="M78 36 L82 36 L82 64 L78 64" stroke="#e11d48" strokeWidth="2" />
  </svg>
);

export const TargetCrosshairIcon: React.FC<IconProps> = ({ className = "", size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="46" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.4" />
    {/* Dual Tactical Rings */}
    <circle cx="50" cy="50" r="38" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.7" />
    <circle cx="50" cy="50" r="26" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.8" />
    <circle cx="50" cy="50" r="14" stroke="#a855f7" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="3" fill="#f59e0b" />
    {/* Sniper Crosshairs with notch gaps */}
    <line x1="50" y1="12" x2="50" y2="34" stroke="#a855f7" strokeWidth="2" />
    <line x1="50" y1="66" x2="50" y2="88" stroke="#a855f7" strokeWidth="2" />
    <line x1="12" y1="50" x2="34" y2="50" stroke="#a855f7" strokeWidth="2" />
    <line x1="66" y1="50" x2="88" y2="50" stroke="#a855f7" strokeWidth="2" />
    {/* Arrow Tip Notch */}
    <path d="M50 18 L46 26 L54 26 Z" fill="#f59e0b" />
  </svg>
);

export const AvengerIcon: React.FC<{ type: string; className?: string; size?: number }> = ({
  type,
  className = "",
  size = 48,
}) => {
  switch (type) {
    case "arc-reactor":
      return <ArcReactorIcon className={className} size={size} />;
    case "shield":
      return <VibraniumShieldIcon className={className} size={size} />;
    case "lightning":
      return <MjolnirLightningIcon className={className} size={size} />;
    case "gamma":
      return <GammaPowerIcon className={className} size={size} />;
    case "web":
      return <WebInsigniaIcon className={className} size={size} />;
    case "stealth":
      return <StealthHourglassIcon className={className} size={size} />;
    case "crosshair":
      return <TargetCrosshairIcon className={className} size={size} />;
    default:
      return <ArcReactorIcon className={className} size={size} />;
  }
};
