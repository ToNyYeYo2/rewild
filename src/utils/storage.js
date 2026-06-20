const KEY = 'rewild_v1';

const DEFAULTS = {
  logs: {},
  currentStreak: 0,
  longestStreak: 0,
  unlockedElements: [],
  firstOpenDate: null,
  hasOnboarded: false,
};

export function getData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('rewild: localStorage write failed', e);
  }
}

export function exportData() {
  const data = getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `rewild-backup-${getTodayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Validates and writes an imported JSON string to localStorage.
// Throws a user-readable string on failure.
export function importData(json) {
  let parsed;
  try { parsed = JSON.parse(json); } catch { throw new Error('Not a valid JSON file.'); }
  if (!parsed || typeof parsed.logs !== 'object') {
    throw new Error('This doesn\'t look like a Rewild backup.');
  }
  saveData({ ...DEFAULTS, ...parsed });
}

// Logs made between midnight and 3:59am local time count toward the previous
// calendar day. All "what day is it" logic must go through this function.
export function getEffectiveDate() {
  const now = new Date();
  if (now.getHours() < 4) {
    now.setDate(now.getDate() - 1);
  }
  return now;
}

export function getTodayStr() {
  return fmtDate(getEffectiveDate());
}

export function fmtDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dateNDaysAgo(n) {
  const d = getEffectiveDate();
  d.setDate(d.getDate() - n);
  return d;
}
