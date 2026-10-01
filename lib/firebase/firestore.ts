import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { Team, HackathonConfig, EventStatus } from "@/types";
import { INITIAL_HACKATHON_CONFIG } from "./mockData";

const TEAMS_KEY = "hackintime_teams_data";
const CONFIG_KEY = "hackintime_config_data";

let localChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  localChannel = new BroadcastChannel("hackintime_sync_channel");
}

function broadcastLocalUpdate(type: "teams" | "config") {
  if (localChannel) {
    localChannel.postMessage({ type, timestamp: Date.now() });
  }
}

function getLocalTeams(): Team[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalTeams(teams: Team[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  broadcastLocalUpdate("teams");
}

function getLocalConfig(): HackathonConfig {
  if (typeof window === "undefined") return INITIAL_HACKATHON_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return INITIAL_HACKATHON_CONFIG;
    return JSON.parse(raw);
  } catch {
    return INITIAL_HACKATHON_CONFIG;
  }
}

function saveLocalConfig(config: HackathonConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  broadcastLocalUpdate("config");
}

export function processAndRankTeams(teams: Team[]): Team[] {
  // A team is evaluated if they have any review score > 0 or a total score > 0
  const isEvaluated = (t: Team) =>
    (t.score != null && t.score > 0) ||
    (t.review1Score != null && t.review1Score > 0) ||
    (t.review2Score != null && t.review2Score > 0) ||
    (t.review3Score != null && t.review3Score > 0);

  // Check if at least one team in the competition has been evaluated
  const anyEvaluated = teams.some(isEvaluated);

  // If no team has been evaluated yet, ALL teams remain unranked (rank: undefined)
  if (!anyEvaluated) {
    return teams.map((team) => ({
      ...team,
      rank: undefined,
      prevRank: undefined,
      rankDelta: 0,
    }));
  }

  // Sort: evaluated teams first by score DESC, then bonus points DESC.
  // Unevaluated teams placed at the bottom.
  const sorted = [...teams].sort((a, b) => {
    const aEval = isEvaluated(a);
    const bEval = isEvaluated(b);
    if (aEval && !bEval) return -1;
    if (!aEval && bEval) return 1;

    if (b.score !== a.score) return b.score - a.score;
    if (b.points !== a.points) return b.points - a.points;
    return a.teamName.localeCompare(b.teamName);
  });

  let currentRank = 1;
  return sorted.map((team) => {
    if (!isEvaluated(team)) {
      return {
        ...team,
        rank: undefined,
        prevRank: undefined,
        rankDelta: 0,
      };
    }

    const rank = currentRank++;
    const prevRank = team.prevRank || team.rank || rank;
    const rankDelta = prevRank ? prevRank - rank : 0;
    return { ...team, rank, prevRank, rankDelta };
  });
}

// Helper to compute total score from reviews
function computeTotalScore(team: Partial<Team>): number {
  return (
    (team.review1Score || 0) +
    (team.review2Score || 0) +
    (team.review3Score || 0)
  );
}

export async function updateTeamAvatar(teamId: string, avatarUrl: string) {
  return updateTeam(teamId, { avatar: avatarUrl });
}

export async function updateTeamProfile(
  teamId: string,
  profile: { avatar?: string; tagline?: string }
) {
  return updateTeam(teamId, profile);
}

// ─────────────────────────────────────────────
// REALTIME LISTENERS
// ─────────────────────────────────────────────

export function subscribeToTeams(callback: (teams: Team[]) => void): () => void {
  callback(processAndRankTeams(getLocalTeams()));

  const handleStorage = (e: StorageEvent) => {
    if (e.key === TEAMS_KEY) callback(processAndRankTeams(getLocalTeams()));
  };
  const handleMessage = (e: MessageEvent) => {
    if (e.data?.type === "teams") callback(processAndRankTeams(getLocalTeams()));
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
    if (localChannel) localChannel.addEventListener("message", handleMessage);
  }

  let unsubFirestore: (() => void) | null = null;

  if (isFirebaseConfigured && db) {
    try {
      const teamsRef = collection(db, "teams");
      unsubFirestore = onSnapshot(
        teamsRef,
        (snapshot) => {
          if (snapshot.empty) {
            saveLocalTeams([]);
            callback([]);
            return;
          }
          const rawTeams: Team[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            const r1 = Number(data.review1Score) || 0;
            const r2 = Number(data.review2Score) || 0;
            const r3 = Number(data.review3Score) || 0;
            return {
              id: docSnap.id,
              teamId: data.teamId || docSnap.id,
              teamName: data.teamName || "Unnamed Team",
              members: Array.isArray(data.members) ? data.members : [],
              review1Score: r1,
              review2Score: r2,
              review3Score: r3,
              score: r1 + r2 + r3,
              points: Number(data.points) || 0,
              track: data.track || "General Track",
              avatar: data.avatar || "",
              tagline: data.tagline || "",
              updatedAt: data.updatedAt?.toMillis
                ? data.updatedAt.toMillis()
                : (data.updatedAt || Date.now()),
              prevRank: data.prevRank,
            };
          });
          const processed = processAndRankTeams(rawTeams);
          saveLocalTeams(processed);
          callback(processed);
        },
        (error) => {
          console.error("Firestore teams subscription error, falling back to local:", error);
          callback(processAndRankTeams(getLocalTeams()));
        }
      );
    } catch (err) {
      console.warn("Firestore subscription failed, fallback to local:", err);
    }
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
      if (localChannel) localChannel.removeEventListener("message", handleMessage);
    }
  };
}

export function subscribeToHackathonConfig(
  callback: (config: HackathonConfig) => void
): () => void {
  callback(getLocalConfig());

  const handleStorage = (e: StorageEvent) => {
    if (e.key === CONFIG_KEY) callback(getLocalConfig());
  };
  const handleMessage = (e: MessageEvent) => {
    if (e.data?.type === "config") callback(getLocalConfig());
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
    if (localChannel) localChannel.addEventListener("message", handleMessage);
  }

  let unsubFirestore: (() => void) | null = null;

  if (isFirebaseConfigured && db) {
    try {
      const configDocRef = doc(db, "hackathon", "config");
      unsubFirestore = onSnapshot(
        configDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const configObj: HackathonConfig = {
              eventName: data.eventName || "HackinTym'26 2.0",
              eventStatus: (data.eventStatus as EventStatus) || "UPCOMING",
              startTime: data.startTime || null,
              endTime: data.endTime || null,
              durationHours: Number(data.durationHours) || 30,
              currentRound: data.currentRound || "",
              updatedAt: data.updatedAt || Date.now(),
            };
            saveLocalConfig(configObj);
            callback(configObj);
          } else {
            callback(INITIAL_HACKATHON_CONFIG);
          }
        },
        (error) => {
          console.error("Firestore config subscription error:", error);
          callback(getLocalConfig());
        }
      );
    } catch (err) {
      console.warn("Config listener fallback:", err);
    }
  }

  return () => {
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
      if (localChannel) localChannel.removeEventListener("message", handleMessage);
    }
  };
}

// ─────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────

/**
 * Bulk-publish scores for a single review round to ALL teams simultaneously.
 * scores: { [teamId]: scoreValue }
 * reviewNumber: 1 | 2 | 3
 */
export async function bulkPublishReviewScores(
  reviewNumber: 1 | 2 | 3,
  scores: Record<string, number>   // teamId (or id) → score for that review
): Promise<void> {
  const key = `review${reviewNumber}Score` as "review1Score" | "review2Score" | "review3Score";

  // 1. Instant local update across all tabs/panels
  const teams = getLocalTeams();
  const updated = teams.map((t) => {
    const id = t.id || t.teamId;
    if (id in scores || t.teamId in scores) {
      const newReviewScore = scores[id] ?? scores[t.teamId] ?? 0;
      const patchedTeam = { ...t, [key]: newReviewScore, updatedAt: Date.now() };
      patchedTeam.score = computeTotalScore(patchedTeam);
      return patchedTeam;
    }
    return t;
  });
  saveLocalTeams(updated);

  // 2. Firestore batch write (all teams updated atomically)
  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const [teamDocId, reviewScore] of Object.entries(scores)) {
        const teamRef = doc(db, "teams", teamDocId);
        // We need to recompute total from existing + this review
        const existing = updated.find((t) => t.id === teamDocId || t.teamId === teamDocId);
        const totalScore = existing ? existing.score : reviewScore;
        batch.set(
          teamRef,
          { [key]: reviewScore, score: totalScore, updatedAt: Date.now() },
          { merge: true }
        );
      }
      await batch.commit();
    } catch (err) {
      console.error("Firestore bulkPublishReviewScores error:", err);
    }
  }
}

export async function updateTeamScore(
  idOrTeamId: string,
  newScore: number,
  newPoints: number,
  note?: string
) {
  void note;
  const teams = getLocalTeams();
  const target = teams.find((t) => t.id === idOrTeamId || t.teamId === idOrTeamId);
  if (target) {
    const scoreDiff = newScore - target.score;
    const updated = teams.map((t) => {
      if (t.id === target.id || t.teamId === target.teamId) {
        return { ...t, score: newScore, points: newPoints, scoreDelta: scoreDiff, updatedAt: Date.now() };
      }
      return t;
    });
    saveLocalTeams(updated);
  }

  if (isFirebaseConfigured && db) {
    try {
      const targetId = target?.id || idOrTeamId;
      const teamRef = doc(db, "teams", targetId);
      await setDoc(teamRef, { score: newScore, points: newPoints, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.error("Firestore updateTeamScore error:", err);
    }
  }
}

export async function createTeam(data: Omit<Team, "id" | "updatedAt">) {
  const docId = data.teamId ? data.teamId.toUpperCase().trim() : `team_${Date.now()}`;
  const newTeam: Team = {
    ...data,
    id: docId,
    teamId: docId,
    review1Score: data.review1Score || 0,
    review2Score: data.review2Score || 0,
    review3Score: data.review3Score || 0,
    score: (data.review1Score || 0) + (data.review2Score || 0) + (data.review3Score || 0),
    updatedAt: Date.now(),
  };

  const local = getLocalTeams();
  const filtered = local.filter((t) => t.id !== newTeam.id && t.teamId !== newTeam.teamId);
  saveLocalTeams([...filtered, newTeam]);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "teams", newTeam.id), newTeam);
    } catch (err) {
      console.error("Firestore createTeam error:", err);
    }
  }

  return newTeam;
}

export async function updateTeam(teamId: string, data: Partial<Team>) {
  const teams = getLocalTeams();
  const updated = teams.map((t) => {
    if (t.id === teamId || t.teamId === teamId) {
      const patched = { ...t, ...data, updatedAt: Date.now() };
      patched.score = computeTotalScore(patched);
      return patched;
    }
    return t;
  });
  saveLocalTeams(updated);

  if (isFirebaseConfigured && db) {
    try {
      const teamRef = doc(db, "teams", teamId);
      await setDoc(teamRef, { ...data, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.error("Firestore updateTeam error:", err);
    }
  }
}

export async function deleteTeam(teamId: string) {
  const teams = getLocalTeams();
  const updated = teams.filter((t) => t.id !== teamId && t.teamId !== teamId);
  saveLocalTeams(updated);

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "teams", teamId));
    } catch (err) {
      console.error("Firestore deleteTeam error:", err);
    }
  }
}

export async function setHackathonStatus(status: EventStatus, durationHours: number = 30) {
  const now = Date.now();
  let startTime: number | null = null;
  let endTime: number | null = null;

  if (status === "LIVE") {
    startTime = now;
    endTime = now + durationHours * 3600 * 1000;
  } else if (status === "ENDED") {
    startTime = now - durationHours * 3600 * 1000;
    endTime = now;
  } else if (status === "UPCOMING") {
    startTime = null;
    endTime = null;
  } else if (status === "PAUSED") {
    const cur = getLocalConfig();
    startTime = cur.startTime;
    endTime = cur.endTime;
  }

  const newConfig: HackathonConfig = {
    eventName: "HackinTym'26 2.0",
    eventStatus: status,
    startTime,
    endTime,
    durationHours,
    updatedAt: now,
  };

  saveLocalConfig(newConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "hackathon", "config"), newConfig);
    } catch (err) {
      console.error("Firestore setHackathonStatus error:", err);
    }
  }
}

export async function resetHackathon(durationHours: number = 30) {
  await setHackathonStatus("UPCOMING", durationHours);
}
