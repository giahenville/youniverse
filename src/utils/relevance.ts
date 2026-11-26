import type { Thought } from "../types/thought";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const RELEVANCE_HALF_LIFE_DAYS = 30;
export const MINIMUM_BRIGHTNESS = 0.4;

export function parseTimestamp(
  timestamp?: string | null
): number | null {
  if (!timestamp) return null;

  const normalized =
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)
      ? timestamp.replace(" ", "T") + "Z"
      : timestamp;

  const parsed = Date.parse(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function getLastActivity(
  thought: Thought
): number | null {
  const timestamps = [
    thought.createdAt,
    thought.updatedAt,
    thought.lastEngagedAt,
  ]
    .map(parseTimestamp)
    .filter((value): value is number => value !== null);

  return timestamps.length > 0
    ? Math.max(...timestamps)
    : null;
}

export function getTemporalRelevance(
  thought: Thought,
  now: number = Date.now()
): number {
  const lastActivity = getLastActivity(thought);

  if (lastActivity === null) return 1;

  const elapsedDays = Math.max(
    0,
    (now - lastActivity) / MILLISECONDS_PER_DAY
  );

  return Math.pow(
    2,
    -elapsedDays / RELEVANCE_HALF_LIFE_DAYS
  );
}

export function getThoughtBrightness(
  thought: Thought,
  now: number = Date.now()
): number {
  const relevance = getTemporalRelevance(thought, now);

  return MINIMUM_BRIGHTNESS +
    (1 - MINIMUM_BRIGHTNESS) * relevance;
}

export type ActivityStage =
  | "recent"
  | "cooling"
  | "inactive";

export function getActivityStage(
  thought: Thought,
  now: number = Date.now()
): ActivityStage {
  const lastActivity = getLastActivity(thought);

  if (lastActivity === null) return "recent";

  const elapsedDays = Math.max(
    0,
    (now - lastActivity) / MILLISECONDS_PER_DAY
  );

  if (elapsedDays < 30) return "recent";
  if (elapsedDays < 90) return "cooling";

  return "inactive";
}

export function getActivityBrightness(
  thought: Thought,
  now: number = Date.now()
): number {
  const brightnessByStage: Record<ActivityStage, number> = {
    recent: 1,
    cooling: 0.5,
    inactive: 0.2,
  };

  return brightnessByStage[getActivityStage(thought, now)];
}
