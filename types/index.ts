export type EventStatus = "UPCOMING" | "LIVE" | "PAUSED" | "ENDED";

export interface Team {
  id: string;
  teamId: string; // e.g. "HT001"
  teamName: string;
  members: string[];
  // Per-review scores (set separately by admin)
  review1Score: number;
  review2Score: number;
  review3Score: number;
  // Total score = review1Score + review2Score + review3Score
  score: number;
  // Bonus points (manually adjustable)
  points: number;
  track?: string;
  avatar?: string;
  tagline?: string;
  updatedAt: number;
  rank?: number;
  prevRank?: number;
  rankDelta?: number;
  scoreDelta?: number;
}

export interface HackathonConfig {
  eventName: string;
  eventStatus: EventStatus;
  startTime: number | null;
  endTime: number | null;
  durationHours: number;
  currentRound?: string;
  updatedAt: number;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
