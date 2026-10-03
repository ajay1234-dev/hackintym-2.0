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
  profileLocked?: boolean;
  updatedAt: number;
  rank?: number;
  prevRank?: number;
  rankDelta?: number;
  scoreDelta?: number;
}

export interface PublishingSession {
  id: string;
  reviewNum: 1 | 2 | 3;
  startedAt: number;
  status: "IN_PROGRESS" | "COMPLETED";
  scores: Record<string, number>; // teamId -> review score
  sequence: string[]; // teamIds ordered from lowest projected total to highest (Rank 1)
  lockedTeamIds: string[]; // teamIds that have finished flipping and locked in
  activeTeamId?: string | null; // teamId currently active / locking in
}

export interface HackathonConfig {
  eventName: string;
  eventStatus: EventStatus;
  startTime: number | null;
  endTime: number | null;
  durationHours: number;
  currentRound?: string;
  pausedRemainingMs?: number | null;
  updatedAt: number;
  publishingSession?: PublishingSession | null;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}
