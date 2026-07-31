// 習慣英雄 HabitHero — 主應用
// 設計：明亮活潑卡通風 + 運動 App 儀表板 + 可愛角色小勁
// 色彩：陽光白 #FFFBF0 / 珊瑚橙 #FF6B35 / 青草綠 #00C896 / 天空藍 #4FACFE / 金黃 #FFD700

import { useState, useRef, useCallback } from 'react';
import {
  loadData, saveData, getTodayKey, calcStreak, calcWeekRate,
  calcTotalCheckins, exportData, importData
} from './hooks/useHabitData';
import type { DayRecord } from './hooks/useHabitData';
import { MascotHero } from './components/MascotHero';
import { CheckInCard } from './components/CheckInCard';
import { HabitCalendar, DayEditModal } from './components/HabitCalendar';
import { WeeklyBarChart, StreakAreaChart, HabitTrendChart, HabitProgressBars } from './components/HabitCharts';
import { AnimatedNumber } from './components/AnimatedNumber';

const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function getGreeting(streak: number): string {
  if (streak >= 30) return '你是傳說級英雄！';
  if (streak >= 14) return '兩週連勤，超強的！';
  if (streak >= 7) return '連續 7 天，你是英雄！';
  if (streak >= 3) return '連續 3 天，繼續衝！';
  if (streak >= 1) return '今天也要贏！';
  return '開始你的英雄旅程！';
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [dancing, setDancing] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const todayKey = getTodayKey();
  const todayRec = data[todayKey] || { ai: false, exercise: false, diet: false };
  const streak = calcStreak(data);
  const weekRate = calcWeekRate(data);
  const totalCheckins = calcTotalCheckins(data);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} 週${WEEKDAYS_ZH[now.getDay()]}`;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const toggleHabit = useCallback((habit: keyof DayRecord) => {
    setData(prev => {
      const rec = prev[todayKey] || { ai: false, exercise: false, diet: false };
      const updated = { ...prev, [todayKey]: { ...rec, [habit]: !rec[habit] } };
      saveData(updated);
      return updated;
    });
  }, [todayKey]);

  const triggerDance = useCallback(() => {
    setDancing(false);
    setTimeout(() => setDancing(true), 10);
  }, []);

  const handleDayEdit = useCallback((key: string) => setEditKey(key), []);

  const handleDaySave = useCallback((key: string, rec: DayRecord) => {
    setData(prev => {
      const hasAny = rec.ai || rec.exercise || rec.diet;
      const updated = hasAny
        ? { ...prev, [key]: rec }
        : (() => { const d = { ...prev }; delete d[key]; return d; })();
      saveData(updated);
      return updated;
    });
    setEditKey(null);
    showToast('已儲存');
  }, [showToast]);

  const handleExport = () => { exportData(data); showToast('備份已匯出'); };

  const handleImport = async (file: File) => {
    try {
      const merged = await importData(file, data);
      setData(merged);
      saveData(merged);
      showToast(`已匯入 ${Object.keys(merged).length} 天記錄`);
    } catch (e: any) {
      showToast('匯入失敗：' + (e as Error).message);
    }
  };

  const todayDoneCount = (todayRec.ai ? 1 : 0) + (todayRec.exercise ? 1 : 0) + (todayRec.diet ? 1 : 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFBF0', fontFamily: 'Nunito, "Noto Sans TC", sans-serif' }}>

      {/* 頂部 Hero 區 */}
      <div
        className="relative overflow-hidden pb-6 pt-4 px-4"
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB347 100%)',
        }}
      >
        {/* 裝飾圓圈 */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-15" style={{ backgroundColor: 'white', transform: 'translate(-30%, 30%)' }} />

        {/* 導航 */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-base">⭐</span>
            </div>
            <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>習慣英雄</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontFamily: 'Nunito, sans-serif' }}
            >
              ↓ 備份
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontFamily: 'Nunito, sans-serif' }}
            >
              ↑ 匯入
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                if (e.target.files?.[0]) {
                  handleImport(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>

        {/* 角色 + 問候 */}
        <div className="flex items-end justify-between relative z-10">
          <div className="flex-1">
            <div className="text-white text-xs opacity-80 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>{dateStr}</div>
            <div className="text-white font-black text-xl leading-tight mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {getGreeting(streak)}
            </div>
            {/* 今日進度點 */}
            <div className="flex items-center gap-1.5">
              {(['ai', 'exercise', 'diet'] as const).map((h) => (
                <div
                  key={h}
                  className="w-3 h-3 rounded-full border-2 border-white transition-all duration-300"
                  style={{
                    backgroundColor: todayRec[h] ? 'white' : 'transparent',
                    transform: todayRec[h] ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
              <span className="text-white text-xs opacity-80 ml-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {todayDoneCount}/3 完成
              </span>
            </div>
          </div>
          <MascotHero dancing={dancing} streak={streak} />
        </div>
      </div>

      {/* 主內容 */}
      <div className="px-4 pb-8 max-w-lg mx-auto">

        {/* 統計儀表板 */}
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-4 relative z-10">
          {/* 連續天數 */}
          <div
            className="col-span-1 rounded-2xl p-3 flex flex-col items-center justify-center shadow-md"
            style={{ backgroundColor: '#FFD700', minHeight: 80 }}
          >
            <div className="text-2xl mb-0.5">🔥</div>
            <AnimatedNumber
              value={streak}
              className="font-black text-2xl leading-none"
              style={{ color: '#2D3748', fontFamily: 'Nunito, sans-serif' }}
            />
            <div className="text-xs font-bold mt-0.5" style={{ color: '#92400E', fontFamily: 'Nunito, sans-serif' }}>連續天數</div>
          </div>

          {/* 本週完成率 */}
          <div className="rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm bg-white" style={{ minHeight: 80 }}>
            <div className="text-xl mb-0.5">📅</div>
            <AnimatedNumber
              value={weekRate}
              suffix="%"
              className="font-black text-xl leading-none"
              style={{ color: '#FF6B35', fontFamily: 'Nunito, sans-serif' }}
            />
            <div className="text-xs font-bold mt-0.5 text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>本週完成</div>
          </div>

          {/* 累計打卡 */}
          <div className="rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm bg-white" style={{ minHeight: 80 }}>
            <div className="text-xl mb-0.5">✅</div>
            <AnimatedNumber
              value={totalCheckins}
              className="font-black text-xl leading-none"
              style={{ color: '#00C896', fontFamily: 'Nunito, sans-serif' }}
            />
            <div className="text-xs font-bold mt-0.5 text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>累計打卡</div>
          </div>
        </div>

        {/* 今日打卡 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
            <span className="font-black text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>今日訓練</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <CheckInCard
              id="ai"
              label="上 AI 堂"
              sublabel="學習成長"
              done={todayRec.ai}
              color="#FF6B35"
              bgColor="#FFF0EB"
              icon={<span className="text-2xl">🤖</span>}
              onToggle={() => toggleHabit('ai')}
              onDance={triggerDance}
            />
            <CheckInCard
              id="exercise"
              label="做運動"
              sublabel="強健體魄"
              done={todayRec.exercise}
              color="#00C896"
              bgColor="#ECFDF5"
              icon={<span className="text-2xl">💪</span>}
              onToggle={() => toggleHabit('exercise')}
              onDance={triggerDance}
            />
            <CheckInCard
              id="diet"
              label="16/8 飲食"
              sublabel="7點後不食"
              done={todayRec.diet}
              color="#4FACFE"
              bgColor="#EFF6FF"
              icon={<span className="text-2xl">⏰</span>}
              onToggle={() => toggleHabit('diet')}
              onDance={triggerDance}
            />
          </div>
        </div>

        {/* 全勤提示 */}
        {todayDoneCount === 3 && (
          <div
            className="mb-4 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 100%)' }}
          >
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-black text-white text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>今日全勤！太厲害了！</div>
              <div className="text-white text-xs opacity-80" style={{ fontFamily: 'Nunito, sans-serif' }}>三個習慣全部完成，繼續保持！</div>
            </div>
          </div>
        )}

        {/* 打卡日曆 */}
        <div className="mb-4">
          <HabitCalendar data={data} onDayEdit={handleDayEdit} />
        </div>

        {/* 累計生長線條 */}
        <div className="mb-4">
          <StreakAreaChart data={data} />
        </div>

        {/* 每週完成率 */}
        <div className="mb-4">
          <WeeklyBarChart data={data} />
        </div>

        {/* 習慣進度條 */}
        <div className="mb-4">
          <HabitProgressBars data={data} />
        </div>

        {/* 各習慣趨勢 */}
        <div className="mb-4">
          <HabitTrendChart data={data} />
        </div>

        {/* 底部說明 */}
        <div className="text-center text-xs text-gray-400 mt-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          資料儲存於本機 · 定期備份以防遺失
        </div>
      </div>

      {/* 補打卡彈窗 */}
      <DayEditModal dateKey={editKey} data={data} onSave={handleDaySave} onClose={() => setEditKey(null)} />

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl shadow-lg text-white text-sm font-bold z-50 pointer-events-none"
          style={{ backgroundColor: '#2D3748', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
