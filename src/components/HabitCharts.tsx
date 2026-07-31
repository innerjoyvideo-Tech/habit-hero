// 習慣英雄 — 圖表組件
// 1. 每週完成率長條圖
// 2. 連續打卡生長線條（Recharts AreaChart）
// 3. 各習慣進度條

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import { calcHabitStats, getWeeklyRates, getLast30Days } from '../hooks/useHabitData';
import type { HabitData } from '../hooks/useHabitData';
import { AnimatedNumber } from './AnimatedNumber';

interface ChartsProps {
  data: HabitData;
}

// 自訂 Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 text-xs font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
      <div className="text-gray-500 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value !== null ? `${p.value}${p.unit || ''}` : '無記錄'}</div>
      ))}
    </div>
  );
};

export function WeeklyBarChart({ data }: ChartsProps) {
  const weeklyData = getWeeklyRates(data, 8).map(w => ({
    ...w,
    fill: w.rate === null ? '#EDF2F7' : w.rate >= 90 ? '#00C896' : w.rate >= 60 ? '#FF6B35' : '#FC8181',
  }));

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📊</span>
        <span className="font-black text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>每週完成率</span>
        <span className="ml-auto text-xs text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>過去 8 週</span>
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'Nunito, sans-serif', fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'Nunito, sans-serif', fill: '#A0AEC0' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" name="完成率" unit="%" radius={[6, 6, 0, 0]}
              fill="#FF6B35"
              label={false}
            >
              {weeklyData.map((entry, index) => (
                <rect key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StreakAreaChart({ data }: ChartsProps) {
  // 計算每天的累計完成次數（生長線條）
  const last30 = getLast30Days(data);
  let cumulative = 0;
  const chartData = last30.map(d => {
    const score = (d.ai ?? 0) + (d.exercise ?? 0) + (d.diet ?? 0);
    cumulative += score;
    return {
      label: d.label,
      total: cumulative,
      daily: score,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📈</span>
        <span className="font-black text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>累計打卡生長線</span>
        <span className="ml-auto text-xs text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>過去 30 天</span>
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'Nunito, sans-serif', fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'Nunito, sans-serif', fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              name="累計次數"
              stroke="#FF6B35"
              strokeWidth={2.5}
              fill="url(#growthGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#FF6B35', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HabitTrendChart({ data }: ChartsProps) {
  const last30 = getLast30Days(data);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <span className="font-black text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>各習慣趨勢</span>
        <span className="ml-auto text-xs text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>30 天</span>
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last30} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'Nunito, sans-serif', fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <YAxis domain={[-0.1, 1.1]} ticks={[0, 1]} tickFormatter={v => v === 1 ? '✓' : '○'} tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Nunito, sans-serif', paddingTop: 4 }} />
            <Line type="stepAfter" dataKey="ai" name="AI堂" stroke="#FF6B35" strokeWidth={2} dot={false} connectNulls={false} />
            <Line type="stepAfter" dataKey="exercise" name="運動" stroke="#00C896" strokeWidth={2} dot={false} connectNulls={false} />
            <Line type="stepAfter" dataKey="diet" name="飲食" stroke="#4FACFE" strokeWidth={2} dot={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HabitProgressBars({ data }: ChartsProps) {
  const habits = [
    { key: 'ai' as const, label: '上 AI 堂', icon: '🤖', color: '#FF6B35', bg: '#FFF0EB' },
    { key: 'exercise' as const, label: '做運動', icon: '💪', color: '#00C896', bg: '#ECFDF5' },
    { key: 'diet' as const, label: '16/8 飲食', icon: '⏰', color: '#4FACFE', bg: '#EFF6FF' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏆</span>
        <span className="font-black text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>習慣進度</span>
      </div>
      <div className="flex flex-col gap-4">
        {habits.map(h => {
          const { cnt, total, pct } = calcHabitStats(data, h.key);
          return (
            <div key={h.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{h.icon}</span>
                  <span className="font-bold text-gray-700 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>{h.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400" style={{ fontFamily: 'Nunito, sans-serif' }}>{cnt}/{total} 天</span>
                  <AnimatedNumber
                    value={pct}
                    suffix="%"
                    className="font-black text-sm"
                    style={{ color: h.color, fontFamily: 'Nunito, sans-serif' }}
                  />
                </div>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: h.bg }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: h.color,
                    transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
