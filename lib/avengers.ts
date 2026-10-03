export interface AvengerTrait {
  name: string;
  percentage: number;
}

export interface AvengerConfig {
  rank: number;
  heroName: string;
  codename: string;
  title: string;
  subtitle: string;
  badge: string;
  shortDescription: string;
  reason: string;
  coreTraits: string[];
  traitBars: AvengerTrait[];
  iconType: "arc-reactor" | "shield" | "lightning" | "gamma" | "web" | "stealth" | "crosshair";
  colors: {
    primary: string;       // main text/glow color
    secondary: string;     // accent/complementary
    badgeBg: string;       // badge background
    badgeBorder: string;   // badge border
    badgeText: string;     // badge text
    border: string;        // card border
    borderHover: string;   // card hover border
    glow: string;          // drop-shadow / box-shadow glow
    bgGradient: string;    // card background gradient
    ringColor: string;     // circular motif ring
  };
}

export const AVENGER_RANKS: Record<number, AvengerConfig> = {
  1: {
    rank: 1,
    heroName: "Iron Man",
    codename: "TONY STARK",
    title: "THE TECH VISIONARY",
    subtitle: "CHAMPION",
    badge: "#1 CHAMPION • THE TECH VISIONARY",
    shortDescription: "Architect of the impossible. Built to conquer any challenge through supreme engineering.",
    reason:
      "The #1 team represents the ultimate combination of innovation, engineering, architecture, execution, and presentation. They didn't simply build a project; they turned an idea into something powerful enough to stand above the rest.",
    coreTraits: ["Innovation", "Engineering Genius", "Product Vision", "Finishing Power"],
    traitBars: [
      { name: "Innovation", percentage: 99 },
      { name: "Engineering Architecture", percentage: 98 },
      { name: "Product Vision", percentage: 97 },
      { name: "Finishing Power", percentage: 99 },
    ],
    iconType: "arc-reactor",
    colors: {
      primary: "#fbbf24", // gold
      secondary: "#dc2626", // crimson
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "rgba(251, 191, 36, 0.6)",
      badgeText: "#fbbf24",
      border: "rgba(245, 158, 11, 0.45)",
      borderHover: "rgba(251, 191, 36, 0.85)",
      glow: "rgba(251, 191, 36, 0.35)",
      bgGradient: "linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(245, 158, 11, 0.1) 40%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#f59e0b",
    },
  },

  2: {
    rank: 2,
    heroName: "Captain America",
    codename: "STEVE ROGERS",
    title: "THE TACTICAL PILLAR",
    subtitle: "RUNNER-UP",
    badge: "#2 RUNNER-UP • THE TACTICAL PILLAR",
    shortDescription: "Unwavering resilience and rock-solid architecture. Standing firm against all odds.",
    reason:
      "This team represents disciplined execution. Their solution is reliable, their teamwork is strong, their architecture is stable, and they maintained peak performance under intense pressure. They proved they could stand against the strongest competition.",
    coreTraits: ["Reliability", "Teamwork", "Strategy", "Consistency"],
    traitBars: [
      { name: "Reliability & Stability", percentage: 97 },
      { name: "Team Strategy", percentage: 96 },
      { name: "Architectural Consistency", percentage: 95 },
      { name: "Resilience Under Pressure", percentage: 98 },
    ],
    iconType: "shield",
    colors: {
      primary: "#94a3b8", // silver
      secondary: "#1e3a8a", // deep navy
      badgeBg: "rgba(148, 163, 184, 0.15)",
      badgeBorder: "rgba(203, 213, 225, 0.5)",
      badgeText: "#f1f5f9",
      border: "rgba(148, 163, 184, 0.4)",
      borderHover: "rgba(226, 232, 240, 0.8)",
      glow: "rgba(148, 163, 184, 0.25)",
      bgGradient: "linear-gradient(135deg, rgba(30, 58, 138, 0.18) 0%, rgba(148, 163, 184, 0.08) 50%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#cbd5e1",
    },
  },

  3: {
    rank: 3,
    heroName: "Thor",
    codename: "ODINSON",
    title: "THE HIGH-VOLTAGE POWERHOUSE",
    subtitle: "PODIUM",
    badge: "#3 PODIUM • THE HIGH-VOLTAGE POWERHOUSE",
    shortDescription: "Thunderous execution with electrifying functionality and fearless technical force.",
    reason:
      "This team delivers thunderous impact. Their solution demonstrates strong technical execution, impressive functionality, and the ability to handle difficult challenges with force. They don't quietly enter the competition; they make an impact.",
    coreTraits: ["Impact", "Power", "Performance", "Bold Execution"],
    traitBars: [
      { name: "Thunderous Impact", percentage: 96 },
      { name: "System Power & Scale", percentage: 94 },
      { name: "Performance Speed", percentage: 95 },
      { name: "Bold Problem Solving", percentage: 93 },
    ],
    iconType: "lightning",
    colors: {
      primary: "#38bdf8", // electric cyan/blue
      secondary: "#b45309", // bronze
      badgeBg: "rgba(56, 189, 248, 0.15)",
      badgeBorder: "rgba(56, 189, 248, 0.5)",
      badgeText: "#7dd3fc",
      border: "rgba(56, 189, 248, 0.4)",
      borderHover: "rgba(56, 189, 248, 0.8)",
      glow: "rgba(56, 189, 248, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(180, 83, 9, 0.15) 0%, rgba(56, 189, 248, 0.1) 50%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#38bdf8",
    },
  },

  4: {
    rank: 4,
    heroName: "Hulk",
    codename: "BRUCE BANNER",
    title: "THE COMPUTE BEAST",
    subtitle: "BRAINS + MUSCLE",
    badge: "#4 • THE COMPUTE BEAST",
    shortDescription: "Brains, backend power, and relentless problem-solving for heavy-duty complexity.",
    reason:
      "This team represents raw technical strength combined with deep problem solving. Their project contains complex backend logic, heavy processing, and technically demanding functionality. They keep pushing even when the challenge becomes massive.",
    coreTraits: ["Complex Logic", "Computational Power", "Problem Solving", "Technical Depth"],
    traitBars: [
      { name: "Computational Muscle", percentage: 95 },
      { name: "Complex Logic & Algorithmic Depth", percentage: 94 },
      { name: "Backend Architecture", percentage: 93 },
      { name: "Relentless Persistence", percentage: 96 },
    ],
    iconType: "gamma",
    colors: {
      primary: "#10b981", // gamma emerald/green
      secondary: "#064e3b", // dark gamma
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.5)",
      badgeText: "#34d399",
      border: "rgba(16, 185, 129, 0.4)",
      borderHover: "rgba(52, 211, 153, 0.8)",
      glow: "rgba(16, 185, 129, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(6, 78, 59, 0.25) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#10b981",
    },
  },

  5: {
    rank: 5,
    heroName: "Spider-Man",
    codename: "PETER PARKER",
    title: "THE AGILE PRODIGY",
    subtitle: "RAPID INNOVATOR",
    badge: "#5 • THE AGILE PRODIGY",
    shortDescription: "Speed, agility, and rapid prototyping that outpaces complex problems.",
    reason:
      "This team represents speed and adaptability. They quickly turn ideas into working prototypes, adapt to changing requirements, and create intuitive user experiences. Their strength is not brute force; their strength is moving faster than the problem.",
    coreTraits: ["Agility", "Creativity", "Adaptability", "Rapid Prototyping"],
    traitBars: [
      { name: "Rapid Prototyping Speed", percentage: 95 },
      { name: "Creative Adaptability", percentage: 94 },
      { name: "UX Agility", percentage: 93 },
      { name: "Iterative Velocity", percentage: 96 },
    ],
    iconType: "web",
    colors: {
      primary: "#f43f5e", // web rose/red
      secondary: "#06b6d4", // web cyan
      badgeBg: "rgba(244, 63, 94, 0.15)",
      badgeBorder: "rgba(244, 63, 94, 0.5)",
      badgeText: "#fb7185",
      border: "rgba(244, 63, 94, 0.4)",
      borderHover: "rgba(6, 182, 212, 0.8)",
      glow: "rgba(244, 63, 94, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#f43f5e",
    },
  },

  6: {
    rank: 6,
    heroName: "Black Widow",
    codename: "NATASHA ROMANOFF",
    title: "THE STEALTH STRATEGIST",
    subtitle: "SURGICAL PRECISION",
    badge: "#6 • THE STEALTH STRATEGIST",
    shortDescription: "Surgical execution, clean architecture, and total elimination of edge-case bugs.",
    reason:
      "This team doesn't need excessive spectacle. Their strength comes from careful engineering, clean implementation, security awareness, and handling the small details other teams miss. Quiet execution. Precise decisions. No unnecessary noise.",
    coreTraits: ["Precision", "Security", "Clean Architecture", "Edge Cases"],
    traitBars: [
      { name: "Surgical Precision", percentage: 94 },
      { name: "Security & Clean Code", percentage: 95 },
      { name: "Edge-Case Handling", percentage: 93 },
      { name: "Stealth Efficiency", percentage: 92 },
    ],
    iconType: "stealth",
    colors: {
      primary: "#e11d48", // crimson
      secondary: "#334155", // charcoal
      badgeBg: "rgba(225, 29, 72, 0.15)",
      badgeBorder: "rgba(225, 29, 72, 0.5)",
      badgeText: "#fda4af",
      border: "rgba(225, 29, 72, 0.4)",
      borderHover: "rgba(244, 63, 94, 0.8)",
      glow: "rgba(225, 29, 72, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#e11d48",
    },
  },

  7: {
    rank: 7,
    heroName: "Hawkeye",
    codename: "CLINT BARTON",
    title: "THE PRECISION ANCHOR",
    subtitle: "TOP 7 GATEKEEPER",
    badge: "#7 TOP 7 • THE PRECISION ANCHOR",
    shortDescription: "100% targeting accuracy under pressure. Hitting the bullseye to make the elite cutoff.",
    reason:
      "The #7 position represents the final team to break into the elite Top 7. Every single point mattered. Every review mattered. Every small improvement could have changed the standings. This team hit the target when the margin for error was extremely small.",
    coreTraits: ["Accuracy", "Consistency", "Precision", "Clutch Execution"],
    traitBars: [
      { name: "Target Accuracy", percentage: 95 },
      { name: "Clutch Scoring Execution", percentage: 93 },
      { name: "Under-Pressure Focus", percentage: 94 },
      { name: "Consistency", percentage: 92 },
    ],
    iconType: "crosshair",
    colors: {
      primary: "#a855f7", // violet
      secondary: "#f59e0b", // amber
      badgeBg: "rgba(168, 85, 247, 0.15)",
      badgeBorder: "rgba(168, 85, 247, 0.5)",
      badgeText: "#d8b4fe",
      border: "rgba(168, 85, 247, 0.4)",
      borderHover: "rgba(168, 85, 247, 0.8)",
      glow: "rgba(168, 85, 247, 0.3)",
      bgGradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.16) 0%, rgba(245, 158, 11, 0.08) 50%, rgba(10, 14, 24, 0.95) 100%)",
      ringColor: "#a855f7",
    },
  },
};

/**
 * Returns the Avenger identity dynamically based on current rank (1–7 only).
 * If unranked or rank > 7, returns null.
 */
export function getAvengerByRank(rank: number | undefined | null): AvengerConfig | null {
  if (!rank || rank < 1 || rank > 7) return null;
  return AVENGER_RANKS[rank] || null;
}
