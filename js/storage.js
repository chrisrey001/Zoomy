// storage.js — all persistence: daily limit, lifetime stats, event log, settings.
// Everything lives in localStorage; no backend.

const K_DAILY = "zoomy_daily";
const K_STATS = "zoomy_stats";
const K_LOG = "zoomy_log";
const K_SETTINGS = "zoomy_settings";

export const DAILY_LIMIT = 5;

// ---- date helpers ----------------------------------------------------------
export function todayKey(d = new Date()) {
  // local YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled — game still playable in-memory this session */
  }
}

// ---- daily state -----------------------------------------------------------
// { date, results: [{word, category, correct, tier, points, scale}], done }
export function getDaily() {
  const today = todayKey();
  let daily = read(K_DAILY, null);
  if (!daily || daily.date !== today) {
    daily = { date: today, results: [], done: false };
    write(K_DAILY, daily);
  }
  return daily;
}

export function roundsPlayed() {
  return getDaily().results.length;
}
export function roundsLeft() {
  return Math.max(0, DAILY_LIMIT - roundsPlayed());
}
export function canPlay() {
  return roundsLeft() > 0;
}
export function dailyScore() {
  return getDaily().results.reduce((s, r) => s + r.points, 0);
}
export function dailyCorrect() {
  return getDaily().results.filter((r) => r.correct).length;
}

// Record a finished round and update lifetime stats. Returns updated daily.
export function recordRound(result) {
  const daily = getDaily();
  daily.results.push(result);
  if (daily.results.length >= DAILY_LIMIT) daily.done = true;
  write(K_DAILY, daily);
  updateStatsForDay(daily);
  logEvent("round_end", result);
  return daily;
}

// ---- lifetime stats --------------------------------------------------------
// { bestDay, totalScore, gamesFinished, streak, lastPlayedDate, history:[{date,score,correct}] }
export function getStats() {
  return read(K_STATS, {
    bestDay: 0,
    totalScore: 0,
    gamesFinished: 0,
    streak: 0,
    lastPlayedDate: null,
    history: [],
  });
}

function isYesterday(prev, curr) {
  if (!prev) return false;
  const p = new Date(prev + "T00:00:00");
  const c = new Date(curr + "T00:00:00");
  return (c - p) === 86400000;
}

function updateStatsForDay(daily) {
  const stats = getStats();
  const dayScore = daily.results.reduce((s, r) => s + r.points, 0);
  const dayCorrect = daily.results.filter((r) => r.correct).length;

  // upsert today's history entry
  const idx = stats.history.findIndex((h) => h.date === daily.date);
  const entry = { date: daily.date, score: dayScore, correct: dayCorrect, rounds: daily.results.length };
  if (idx >= 0) stats.history[idx] = entry;
  else stats.history.push(entry);
  stats.history = stats.history.slice(-60); // keep last ~60 days

  stats.bestDay = Math.max(stats.bestDay, dayScore);
  stats.totalScore = stats.history.reduce((s, h) => s + h.score, 0);

  // streak: increment when a new day is played, resetting if a day was skipped
  if (stats.lastPlayedDate !== daily.date) {
    if (isYesterday(stats.lastPlayedDate, daily.date)) stats.streak += 1;
    else stats.streak = 1;
    stats.lastPlayedDate = daily.date;
  }
  if (daily.done) stats.gamesFinished += 1;

  write(K_STATS, stats);
}

// ---- append-only event log -------------------------------------------------
export function logEvent(type, data = {}) {
  const log = read(K_LOG, []);
  log.push({ t: type, ...data, at: new Date().toISOString() });
  write(K_LOG, log.slice(-500)); // cap size
}
export function getLog() {
  return read(K_LOG, []);
}

// ---- settings --------------------------------------------------------------
export function getSettings() {
  return read(K_SETTINGS, { category: null });
}
export function setSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  write(K_SETTINGS, s);
}
