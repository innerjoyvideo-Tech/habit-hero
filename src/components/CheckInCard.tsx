// 習慣英雄 — 打卡卡片組件
// 點擊後：彈跳動畫 + 彩紙爆炸 + 觸發角色跳舞

import { useRef, useState } from 'react';
import confetti from 'canvas-confetti';

interface CheckInCardProps {
  id: string;
  label: string;
  sublabel?: string;
  done: boolean;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  onToggle: () => void;
  onDance: () => void;
}

export function CheckInCard({ label, sublabel, done, color, bgColor, icon, onToggle, onDance }: CheckInCardProps) {
  const [bouncing, setBouncing] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);

    if (!done) {
      // 彩紙爆炸
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { x, y },
          colors: [color, '#FFD700', '#FF6B35', '#00C896', '#4FACFE'],
          scalar: 0.9,
          gravity: 1.2,
        });
      }
      onDance();
    }

    onToggle();
  };

  return (
    <button
      ref={cardRef}
      onClick={handleClick}
      className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 w-full cursor-pointer"
      style={{
        backgroundColor: done ? bgColor : 'white',
        borderColor: done ? color : '#E2E8F0',
        transform: bouncing ? 'scale(0.92)' : 'scale(1)',
        boxShadow: done
          ? `0 4px 20px ${color}40`
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* 完成標記 */}
      {done && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
          style={{ backgroundColor: color }}
        >
          ✓
        </div>
      )}

      {/* 圖示 */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: done ? `${color}20` : '#F7FAFC' }}
      >
        {icon}
      </div>

      {/* 標籤 */}
      <div className="text-center">
        <div
          className="font-black text-sm leading-tight"
          style={{ color: done ? color : '#2D3748', fontFamily: 'Nunito, sans-serif' }}
        >
          {label}
        </div>
        {sublabel && (
          <div className="text-xs mt-0.5" style={{ color: '#718096' }}>
            {sublabel}
          </div>
        )}
      </div>

      {/* 狀態文字 */}
      <div
        className="text-xs font-bold px-3 py-1 rounded-full"
        style={{
          backgroundColor: done ? color : '#EDF2F7',
          color: done ? 'white' : '#A0AEC0',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        {done ? '完成！' : '點擊打卡'}
      </div>
    </button>
  );
}
