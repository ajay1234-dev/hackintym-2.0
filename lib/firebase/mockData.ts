import { Team, HackathonConfig } from "@/types";

export const INITIAL_HACKATHON_CONFIG: HackathonConfig = {
  eventName: "HackinTym'26 2.0",
  eventStatus: "UPCOMING",
  startTime: null,
  endTime: null,
  durationHours: 30,
  updatedAt: Date.now(),
};

// Empty — all real data comes from Firebase
export const INITIAL_TEAMS: Team[] = [];
