import { fmtDate } from './storage';
import { PILLARS } from '../constants/pillars';

export function checkAndUpdateUnlocks(logs, streak, longestStreak, existing = []) {
  const unlocked = new Set(existing);
  const today = new Date();

  for (const pillar of PILLARS) {
    let c14 = 0;
    let c60 = 0;

    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const log = logs[fmtDate(d)];
      const val = log ? (log[pillar.key] || 0) : 0;
      if (val >= 2) {
        if (i < 14) c14++;
        c60++;
      }
    }

    if (c14 >= 7) unlocked.add(pillar.unlockElement);
    if (c60 >= 30) unlocked.add(pillar.upgradeElement);
  }

  const maxStreak = Math.max(streak, longestStreak);
  if (maxStreak >= 21) unlocked.add('mountain');
  if (maxStreak >= 90) unlocked.add('apex_crown');

  return Array.from(unlocked);
}

export function getPillarProgress(logs, pillar) {
  const today = new Date();
  let c14 = 0, c60 = 0;

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const log = logs[fmtDate(d)];
    const val = log ? (log[pillar.key] || 0) : 0;
    if (val >= 2) {
      if (i < 14) c14++;
      c60++;
    }
  }

  return {
    unlocked: c14 >= 7,
    upgraded: c60 >= 30,
    c14,
    c60,
    toUnlock: Math.max(0, 7 - c14),
    toUpgrade: Math.max(0, 30 - c60),
  };
}

export const TOTAL_ELEMENTS = 16; // 7 unlocks + 7 upgrades + mountain + apex_crown
