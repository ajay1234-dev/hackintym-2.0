import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { Team, HackathonConfig, EventStatus, PublishingSession } from "@/types";
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
  // A team is evaluated strictly if they have review scores > 0 or total score > 0
  const isEvaluated = (t: Team) => {
    const reviewSum =
      (Number(t.review1Score) || 0) +
      (Number(t.review2Score) || 0) +
      (Number(t.review3Score) || 0);
    const scoreVal = Number(t.score) || 0;
    return reviewSum > 0 || scoreVal > 0;
  };

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

    const aScore = a.score || 0;
    const bScore = b.score || 0;
    if (bScore !== aScore) return bScore - aScore;
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
    (Number(team.review1Score) || 0) +
    (Number(team.review2Score) || 0) +
    (Number(team.review3Score) || 0)
  );
}

export async function updateTeamAvatar(teamId: string, avatarUrl: string) {
  return updateTeam(teamId, { avatar: avatarUrl, profileLocked: true });
}

export async function updateTeamProfile(
  teamId: string,
  profile: { avatar?: string; tagline?: string; profileLocked?: boolean }
) {
  return updateTeam(teamId, {
    ...profile,
    profileLocked: true,
  });
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
              profileLocked: Boolean(data.profileLocked) || Boolean(data.avatar && data.avatar.trim()),
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
              pausedRemainingMs: data.pausedRemainingMs != null ? Number(data.pausedRemainingMs) : null,
              updatedAt: data.updatedAt || Date.now(),
              publishingSession: (data.publishingSession as PublishingSession) || null,
              cinematicIntroTriggeredAt: data.cinematicIntroTriggeredAt || null,
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
      for (const [keyId, reviewScore] of Object.entries(scores)) {
        const existing = updated.find((t) => t.id === keyId || t.teamId === keyId);
        const actualDocId = existing?.id || keyId;
        const teamRef = doc(db, "teams", actualDocId);
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

/**
 * Starts a live score publishing ceremony on the leaderboard.
 * scores: { [teamId]: number } - raw review scores entered by admin
 * sequence: array of team IDs sorted ascending from lowest projected total score up to Rank 1 (highest)
 */
export async function startLivePublishingSession(
  reviewNum: 1 | 2 | 3,
  scores: Record<string, number>,
  sequence: string[]
): Promise<PublishingSession> {
  const session: PublishingSession = {
    id: `pub_${Date.now()}`,
    reviewNum,
    startedAt: Date.now(),
    status: "IN_PROGRESS",
    scores,
    sequence,
    lockedTeamIds: [],
    activeTeamId: sequence.length > 0 ? sequence[0] : null,
  };

  const cur = getLocalConfig();
  const updatedConfig: HackathonConfig = {
    ...cur,
    publishingSession: session,
    updatedAt: Date.now(),
  };
  saveLocalConfig(updatedConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "hackathon", "config"), updatedConfig, { merge: true });
    } catch (err) {
      console.error("Firestore startLivePublishingSession error:", err);
    }
  }

  return session;
}

/**
 * Locks in one team's review score during the live publishing ceremony.
 * Updates the team's review score and total score in Firestore & local storage,
 * and advances the active team in the publishing session.
 */
export async function advanceLivePublishingSession(
  teamId: string,
  reviewNum: 1 | 2 | 3,
  reviewScore: number
): Promise<void> {
  const key = `review${reviewNum}Score` as "review1Score" | "review2Score" | "review3Score";

  // 1. Update the team in local storage & Firestore
  await updateTeam(teamId, { [key]: reviewScore });

  // 2. Update the session state
  const cur = getLocalConfig();
  if (!cur.publishingSession) return;

  const currentLocked = cur.publishingSession.lockedTeamIds || [];
  const nextLocked = Array.from(new Set([...currentLocked, teamId]));
  const seq = cur.publishingSession.sequence || [];
  const currentIndex = seq.indexOf(teamId);
  const nextTeamId = currentIndex >= 0 && currentIndex + 1 < seq.length ? seq[currentIndex + 1] : null;
  const isFinished = nextLocked.length >= seq.length;

  const updatedSession: PublishingSession = {
    ...cur.publishingSession,
    lockedTeamIds: nextLocked,
    activeTeamId: isFinished ? null : nextTeamId,
    status: isFinished ? "COMPLETED" : "IN_PROGRESS",
  };

  const updatedConfig: HackathonConfig = {
    ...cur,
    publishingSession: updatedSession,
    updatedAt: Date.now(),
  };
  saveLocalConfig(updatedConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "hackathon", "config"), updatedConfig, { merge: true });
    } catch (err) {
      console.error("Firestore advanceLivePublishingSession error:", err);
    }
  }
}

/**
 * Fast-forward / complete all remaining teams in the publishing session immediately.
 */
export async function fastForwardLivePublishingSession(): Promise<void> {
  const cur = getLocalConfig();
  if (!cur.publishingSession) return;

  const { reviewNum, scores, sequence } = cur.publishingSession;
  await bulkPublishReviewScores(reviewNum, scores);

  const updatedSession: PublishingSession = {
    ...cur.publishingSession,
    lockedTeamIds: sequence,
    activeTeamId: null,
    status: "COMPLETED",
  };

  const updatedConfig: HackathonConfig = {
    ...cur,
    publishingSession: updatedSession,
    updatedAt: Date.now(),
  };
  saveLocalConfig(updatedConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "hackathon", "config"), updatedConfig, { merge: true });
    } catch (err) {
      console.error("Firestore fastForwardLivePublishingSession error:", err);
    }
  }
}

/**
 * Cancel or clear the active publishing session.
 */
export async function cancelLivePublishingSession(): Promise<void> {
  const cur = getLocalConfig();
  const updatedConfig: HackathonConfig = {
    ...cur,
    publishingSession: null,
    updatedAt: Date.now(),
  };
  saveLocalConfig(updatedConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "hackathon", "config"), { publishingSession: null, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.error("Firestore cancelLivePublishingSession error:", err);
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
  const target = teams.find((t) => t.id === teamId || t.teamId === teamId);
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
      const actualDocId = target?.id || teamId;
      const teamRef = doc(db, "teams", actualDocId);
      await setDoc(teamRef, { ...data, updatedAt: Date.now() }, { merge: true });
    } catch (err) {
      console.error("Firestore updateTeam error:", err);
    }
  }
}

export async function deleteTeam(teamId: string) {
  const teams = getLocalTeams();
  const target = teams.find((t) => t.id === teamId || t.teamId === teamId);
  const updated = teams.filter((t) => t.id !== teamId && t.teamId !== teamId);
  saveLocalTeams(updated);

  if (isFirebaseConfigured && db) {
    try {
      const actualDocId = target?.id || teamId;
      await deleteDoc(doc(db, "teams", actualDocId));
    } catch (err) {
      console.error("Firestore deleteTeam error:", err);
    }
  }
}

export async function removeTeamPhoto(
  teamId: string,
  avatarUrl?: string
): Promise<{ success: boolean; cloudDeleted: boolean; message: string }> {
  let cloudDeleted = false;
  let message = "Team photo removed successfully.";

  // 1. If an avatarUrl exists, call backend destroy endpoint to remove from cloud storage
  if (avatarUrl) {
    try {
      const res = await fetch("/api/admin/remove-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, avatarUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        cloudDeleted = !!data.cloudDeleted;
        if (data.message) message = data.message;
      }
    } catch (err) {
      console.warn("Could not call /api/admin/remove-photo:", err);
    }
  }

  // 2. Update local storage for immediate zero-latency UI update
  const teams = getLocalTeams();
  const target = teams.find((t) => t.id === teamId || t.teamId === teamId);
  const updated = teams.map((t) => {
    if (t.id === teamId || t.teamId === teamId) {
      return {
        ...t,
        avatar: "",
        profileLocked: false,
        updatedAt: Date.now(),
      };
    }
    return t;
  });
  saveLocalTeams(updated);

  // 3. Persist update to Cloud Firestore
  if (isFirebaseConfigured && db) {
    try {
      const actualDocId = target?.id || teamId;
      const teamRef = doc(db, "teams", actualDocId);
      await setDoc(
        teamRef,
        {
          avatar: "",
          profileLocked: false,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore removeTeamPhoto error:", err);
    }
  }

  return { success: true, cloudDeleted, message };
}

export async function setHackathonStatus(status: EventStatus, durationHours: number = 30) {
  const now = Date.now();
  const cur = getLocalConfig();
  let startTime: number | null = null;
  let endTime: number | null = null;
  let pausedRemainingMs: number | null = null;

  if (status === "LIVE") {
    // If resuming from PAUSED, restore remaining time
    if (cur.eventStatus === "PAUSED" && cur.pausedRemainingMs != null && cur.pausedRemainingMs > 0) {
      startTime = now;
      endTime = now + cur.pausedRemainingMs;
      pausedRemainingMs = null;
    } else {
      startTime = now;
      endTime = now + durationHours * 3600 * 1000;
      pausedRemainingMs = null;
    }
  } else if (status === "ENDED") {
    startTime = now - durationHours * 3600 * 1000;
    endTime = now;
    pausedRemainingMs = 0;
  } else if (status === "UPCOMING") {
    startTime = null;
    endTime = null;
    pausedRemainingMs = null;
  } else if (status === "PAUSED") {
    startTime = cur.startTime;
    endTime = cur.endTime;
    // Calculate exact ms remaining at moment of pause
    const rem = cur.endTime ? Math.max(0, cur.endTime - now) : durationHours * 3600 * 1000;
    pausedRemainingMs = rem;
  }

  const newConfig: HackathonConfig = {
    eventName: "HackinTym'26 2.0",
    eventStatus: status,
    startTime,
    endTime,
    durationHours,
    pausedRemainingMs,
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

/**
 * Custom Timer Settings API:
 * Supports setting custom duration (hours + mins), live quick extensions (+/- mins),
 * setting exact remaining countdown time, and setting target end timestamp.
 */
export async function updateCustomTimer(options: {
  durationHours?: number;
  minutesDelta?: number;
  exactRemainingMinutes?: number;
  targetEndTime?: number;
}): Promise<HackathonConfig> {
  const now = Date.now();
  const cur = getLocalConfig();
  const updatedConfig: HackathonConfig = { ...cur, updatedAt: now };

  if (options.durationHours != null && options.durationHours > 0) {
    updatedConfig.durationHours = options.durationHours;
    if (cur.eventStatus === "UPCOMING" || !cur.startTime) {
      updatedConfig.startTime = null;
      updatedConfig.endTime = null;
      updatedConfig.pausedRemainingMs = null;
    }
  }

  if (options.minutesDelta != null) {
    const deltaMs = options.minutesDelta * 60 * 1000;
    if (cur.eventStatus === "LIVE") {
      const currentEnd = cur.endTime || (now + (cur.durationHours || 30) * 3600 * 1000);
      updatedConfig.endTime = Math.max(now, currentEnd + deltaMs);
    } else if (cur.eventStatus === "PAUSED") {
      const curRem =
        cur.pausedRemainingMs ??
        (cur.endTime ? Math.max(0, cur.endTime - now) : (cur.durationHours || 30) * 3600 * 1000);
      const newRem = Math.max(0, curRem + deltaMs);
      updatedConfig.pausedRemainingMs = newRem;
      updatedConfig.endTime = now + newRem;
    } else if (cur.eventStatus === "UPCOMING") {
      const newDuration = Math.max(0.25, (cur.durationHours || 30) + options.minutesDelta / 60);
      updatedConfig.durationHours = Number(newDuration.toFixed(2));
    }
  }

  if (options.exactRemainingMinutes != null && options.exactRemainingMinutes >= 0) {
    const totalMs = options.exactRemainingMinutes * 60 * 1000;
    if (cur.eventStatus === "LIVE") {
      updatedConfig.endTime = now + totalMs;
    } else if (cur.eventStatus === "PAUSED") {
      updatedConfig.pausedRemainingMs = totalMs;
      updatedConfig.endTime = now + totalMs;
    } else {
      updatedConfig.durationHours = Number((options.exactRemainingMinutes / 60).toFixed(2));
    }
  }

  if (options.targetEndTime != null && options.targetEndTime > now) {
    updatedConfig.endTime = options.targetEndTime;
    if (cur.eventStatus === "UPCOMING" || !cur.startTime) {
      updatedConfig.startTime = now;
      updatedConfig.eventStatus = "LIVE";
    }
    const totalDurationHours = Math.max(
      0.25,
      (options.targetEndTime - (updatedConfig.startTime || now)) / (3600 * 1000)
    );
    updatedConfig.durationHours = Number(totalDurationHours.toFixed(2));
  }

  saveLocalConfig(updatedConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, "hackathon", "config"), updatedConfig);
    } catch (err) {
      console.error("Firestore updateCustomTimer error:", err);
    }
  }

  return updatedConfig;
}

export async function triggerCinematicIntroBroadcast(): Promise<void> {
  const now = Date.now();
  const cur = getLocalConfig();
  const updatedConfig: HackathonConfig = {
    ...cur,
    cinematicIntroTriggeredAt: now,
    updatedAt: now,
  };
  saveLocalConfig(updatedConfig);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(
        doc(db, "hackathon", "config"),
        { cinematicIntroTriggeredAt: now, updatedAt: now },
        { merge: true }
      );
    } catch (err) {
      console.error("Firestore triggerCinematicIntroBroadcast error:", err);
    }
  }
}

