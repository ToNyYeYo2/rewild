import { fmtDate, dateNDaysAgo, getTodayStr, getEffectiveDate } from './storage';
import { PILLAR_KEYS } from '../constants/pillars';

// Derived from pillar count so thresholds stay correct when pillars are added.
const PILLAR_MAX   = 3;
export const DAILY_MAX = PILLAR_KEYS.length * PILLAR_MAX;

// Returns true when the user is still in their first 7 days of use.
function isFirstWeek(firstOpenDate) {
  if (!firstOpenDate) return true;
  const open = new Date(firstOpenDate + 'T00:00:00'); // local midnight
  const now  = getEffectiveDate();
  now.setHours(0, 0, 0, 0);
  return Math.round((now - open) / 86400000) < 7;
}

export function getDailyScore(log) {
  if (!log) return 0;
  return PILLAR_KEYS.reduce((sum, k) => sum + (log[k] || 0), 0);
}

export function getStreakBonus(streak) {
  if (streak >= 30) return 3;
  if (streak >= 14) return 2;
  if (streak >= 7) return 1;
  return 0;
}

export function calculateStreak(logs) {
  const today = getEffectiveDate();
  const todayStr = getTodayStr();
  const todayLog = logs[todayStr];
  let streak = 0;

  // If today is logged, start counting from today; otherwise from yesterday
  const startOffset = (todayLog && getDailyScore(todayLog) > 0) ? 0 : 1;

  for (let i = startOffset; i < 400; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = fmtDate(d);
    const score = getDailyScore(logs[ds]);
    if (score === 0) break;
    streak++;
  }

  return streak;
}

// Collect one capped score per day — the array length is the logged-day count.
// Unlogged days are not pushed, so they contribute 0 to the total in all modes.
//
// Standard (week 2+): total / 7       — missed days pull average down.
// Early-user (week 1): total / logged — each logged day counts at full weight.
//
// Test (standard mode, no caps, perfect score daily):
//   Day 1: 21/7=3.0  →14%→ Domesticated
//   Day 2: 42/7=6.0  →29%→ Domesticated
//   Day 3: 63/7=9.0  →43%→ Awakening
//   Day 4: 84/7=12.0 →57%→ Primal
//   Day 5: 105/7=15.0→71%→ Primal
//   Day 6: 126/7=18.0→86%→ Apex
//   Day 7: 147/7=21.0→100%→ Apex  ✓
export function getSevenDayAverage(logs, streak, earlyUser = false) {
  const bonus  = getStreakBonus(streak);
  const scored = [];                       // one entry per logged day, no more

  for (let i = 0; i < 7; i++) {
    const dateStr = fmtDate(dateNDaysAgo(i));
    const raw = getDailyScore(logs[dateStr]);
    if (raw > 0) {
      scored.push(Math.min(raw + bonus, DAILY_MAX));
    }
  }

  if (scored.length === 0) return 0;

  const total = scored.reduce((sum, s) => sum + s, 0);
  return total / (earlyUser ? scored.length : 7);
}

// Thresholds are percentage-based so adding pillars doesn't shift the states.
// Domesticated <40% | Awakening 40–55% | Primal 55–80% | Apex ≥80%
// 40% chosen so all-1s logging (7/21 = 33%) stays visibly in Domesticated;
// crossing into Awakening requires genuine effort (avg ≥ 8.4/21 per day).
export function getWorldState(avg) {
  const pct = avg / DAILY_MAX;
  if (pct >= 0.80) return 'apex';
  if (pct >= 0.55) return 'primal';
  if (pct >= 0.40) return 'awakening';
  return 'domesticated';
}

export function getPillarAverages(logs) {
  const totals = Object.fromEntries(PILLAR_KEYS.map(k => [k, 0]));
  let counted = 0;

  for (let i = 0; i < 7; i++) {
    const ds = fmtDate(dateNDaysAgo(i));
    const log = logs[ds];
    if (log) {
      counted++;
      PILLAR_KEYS.forEach(k => { totals[k] += log[k] || 0; });
    }
  }

  if (counted === 0) return Object.fromEntries(PILLAR_KEYS.map(k => [k, 0]));
  return Object.fromEntries(PILLAR_KEYS.map(k => [k, totals[k] / counted]));
}

export function getWeakestPillar(pillarAvgs, pillarDefs) {
  let min = Infinity;
  let weakest = null;
  for (const p of pillarDefs) {
    if (pillarAvgs[p.key] < min) {
      min = pillarAvgs[p.key];
      weakest = p;
    }
  }
  return weakest;
}

export function computeAppState(data) {
  const logs = data.logs || {};
  const streak = calculateStreak(logs);
  const longestStreak = Math.max(streak, data.longestStreak || 0);
  const earlyUser = isFirstWeek(data.firstOpenDate);
  const rollingAverage = getSevenDayAverage(logs, streak, earlyUser);
  let worldState = getWorldState(rollingAverage);

  if (earlyUser) {
    const daysLogged = Object.values(logs).filter(log => getDailyScore(log) > 0).length;
    if (daysLogged <= 1) {
      // Day 1: cap at Awakening — a perfect first day earns encouragement, not the top
      if (worldState === 'primal' || worldState === 'apex') worldState = 'awakening';
    } else {
      // Days 2-7: cap at Primal — Apex must be earned over time
      if (worldState === 'apex') worldState = 'primal';
    }
  }
  const pillarAverages = getPillarAverages(logs);
  const todayStr = getTodayStr();
  const todayLog = logs[todayStr] || null;
  const todayScore = getDailyScore(todayLog);

  return { streak, longestStreak, rollingAverage, worldState, todayLog, todayScore, earlyUser, pillarAverages };
}
