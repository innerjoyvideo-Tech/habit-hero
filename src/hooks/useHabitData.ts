// 習慣英雄 — 資料管理 Hook
// 資料結構：{ "YYYY-MM-DD": { ai: boolean, exercise: boolean, diet: boolean } }

export interface DayRecord {
  ai: boolean;
  exercise: boolean;
  diet: boolean;
}

export type HabitData = Record<string, DayRecord>;

const STORAGE_KEY = 'habit_hero_data_v1';

export function loadData(): HabitData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveData(data: HabitData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodayKey(): string {
  return formatDate(new Date());
}

export function getScore(rec?: DayRecord): number {
  if (!rec) return 0;
  return (rec.ai ? 1 : 0) + (rec.exercise ? 1 : 0) + (rec.diet ? 1 : 0);
}

export function calcStreak(data: HabitData): number {
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = formatDate(d);
    const rec = data[key];
    if (rec && rec.ai && rec.exercise && rec.diet) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function calcWeekRate(data: HabitData): number {
  const now = new Date();
  let total = 0, done = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    if (d <= now) {
      total += 3;
      done += getScore(data[formatDate(d)]);
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

export function calcHabitStats(data: HabitData, habit: keyof DayRecord) {
  const keys = Object.keys(data).sort();
  const cnt = keys.filter(k => data[k][habit]).length;
  const total = keys.length;
  return { cnt, total, pct: total > 0 ? Math.round((cnt / total) * 100) : 0 };
}

export function calcTotalCheckins(data: HabitData): number {
  return Object.values(data).reduce((sum, rec) => sum + getScore(rec), 0);
}

// 過去 N 週的完成率
export function getWeeklyRates(data: HabitData, weeks = 8): { label: string; rate: number | null }[] {
  const result = [];
  const now = new Date();
  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - w * 7);
    let total = 0, done = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      if (day > now) continue;
      total += 3;
      done += getScore(data[formatDate(day)]);
    }
    const m = weekStart.getMonth() + 1;
    const dd = weekStart.getDate();
    result.push({ label: `${m}/${dd}`, rate: total > 0 ? Math.round((done / total) * 100) : null });
  }
  return result;
}

// 過去 30 天每日各習慣
export function getLast30Days(data: HabitData): {
  label: string;
  key: string;
  ai: number | null;
  exercise: number | null;
  diet: number | null;
}[] {
  const result = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = formatDate(d);
    const rec = data[key];
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    result.push({
      label: dd % 5 === 0 || i === 0 ? `${m}/${dd}` : '',
      key,
      ai: rec != null ? (rec.ai ? 1 : 0) : null,
      exercise: rec != null ? (rec.exercise ? 1 : 0) : null,
      diet: rec != null ? (rec.diet ? 1 : 0) : null,
    });
  }
  return result;
}

export function exportData(data: HabitData): void {
  const obj = { version: 2, exported_at: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habit_hero_backup_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File, existing: HabitData): Promise<HabitData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const imported: HabitData = parsed.version === 2 ? parsed.data : parsed;
        for (const [key, val] of Object.entries(imported)) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('日期格式錯誤');
          if (typeof val !== 'object') throw new Error('記錄格式錯誤');
        }
        resolve({ ...existing, ...imported });
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}
