// 習慣英雄 — 打卡日曆熱力圖
import { useState } from 'react';
import { formatDate, getScore } from '../hooks/useHabitData';
import type { HabitData, DayRecord } from '../hooks/useHabitData';

interface HabitCalendarProps {
  data: HabitData;
  onDayEdit: (key: string) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SCORE_STYLES = [
  { bg: '#EDF2F7', text: '#A0AEC0', border: '#E2E8F0' },
  { bg: '#FFF0EB', text: '#FF6B35', border: '#FFCBB8' },
  { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7' },
];

export function HabitCalendar({ data, onDayEdit }: HabitCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const todayKey = formatDate(today);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="font-black text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
            打卡日曆
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-sm font-bold">‹</button>
          <span className="font-bold text-sm text-gray-600 min-w-[80px] text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {viewYear} / {MONTHS[viewMonth]}
          </span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-sm font-bold">›</button>
        </div>
      </div>

      {/* 圖例 */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {['未打卡', '1 項', '2 項', '全勤'].map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: SCORE_STYLES[i].bg, border: `1.5px solid ${SCORE_STYLES[i].border}` }} />
            <span className="text-xs text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 星期標題 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-bold py-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{d}</div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateObj = new Date(viewYear, viewMonth, day);
          const key = formatDate(dateObj);
          const isFuture = dateObj > today;
          const isToday = key === todayKey;
          const score = getScore(data[key]);
          const style = SCORE_STYLES[score];

          return (
            <button
              key={day}
              onClick={() => !isFuture && onDayEdit(key)}
              disabled={isFuture}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed relative"
              style={{
                backgroundColor: isFuture ? '#F7FAFC' : style.bg,
                color: isFuture ? '#CBD5E0' : style.text,
                border: isToday ? '2px solid #FF6B35' : `1.5px solid ${isFuture ? '#EDF2F7' : style.border}`,
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              {day}
              {score === 3 && !isFuture && (
                <span className="absolute -top-1 -right-1 text-xs">⭐</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 補打卡彈窗
interface DayEditModalProps {
  dateKey: string | null;
  data: HabitData;
  onSave: (key: string, rec: DayRecord) => void;
  onClose: () => void;
}

export function DayEditModal({ dateKey, data, onSave, onClose }: DayEditModalProps) {
  if (!dateKey) return null;

  const rec = data[dateKey] || { ai: false, exercise: false, diet: false };
  const [ai, setAi] = useState(rec.ai);
  const [exercise, setExercise] = useState(rec.exercise);
  const [diet, setDiet] = useState(rec.diet);

  const parts = dateKey.split('-');
  const displayDate = `${parts[0]} 年 ${parseInt(parts[1])} 月 ${parseInt(parts[2])} 日`;

  const habits = [
    { key: 'ai' as const, label: '上 AI 堂', color: '#FF6B35', checked: ai, set: setAi },
    { key: 'exercise' as const, label: '做運動', color: '#00C896', checked: exercise, set: setExercise },
    { key: 'diet' as const, label: '16/8 飲食', color: '#4FACFE', checked: diet, set: setDiet },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl">
        <div className="font-black text-gray-700 mb-4 text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {displayDate}
        </div>
        <div className="flex flex-col gap-3 mb-5">
          {habits.map(h => (
            <label key={h.key} className="flex items-center gap-3 cursor-pointer">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
              <span className="flex-1 font-bold text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>{h.label}</span>
              <input
                type="checkbox"
                checked={h.checked}
                onChange={e => h.set(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
                style={{ accentColor: h.color }}
              />
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors" style={{ fontFamily: 'Nunito, sans-serif' }}>取消</button>
          <button
            onClick={() => onSave(dateKey, { ai, exercise, diet })}
            className="flex-1 py-2 rounded-xl text-white font-black text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FF6B35', fontFamily: 'Nunito, sans-serif' }}
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}
