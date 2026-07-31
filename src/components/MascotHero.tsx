// 小勁 — 習慣英雄吉祥物
// 打卡後觸發跳舞動畫

import { useEffect, useState } from 'react';

interface MascotHeroProps {
  dancing: boolean;
  streak: number;
}

export function MascotHero({ dancing, streak }: MascotHeroProps) {
  const [frame, setFrame] = useState(0);
  const [showStar, setShowStar] = useState(false);

  useEffect(() => {
    if (!dancing) { setFrame(0); return; }
    setShowStar(true);
    let f = 0;
    const interval = setInterval(() => {
      f = (f + 1) % 4;
      setFrame(f);
    }, 180);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setFrame(0);
      setShowStar(false);
    }, 2200);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [dancing]);

  // 身體偏移：跳舞幀
  const bodyY = dancing ? [0, -8, -14, -8][frame] : 0;
  const armAngle = dancing ? [0, 20, -20, 20][frame] : 0;
  const eyeSquint = dancing && frame % 2 === 0;

  const moodColor = streak >= 7 ? '#FFD700' : streak >= 3 ? '#FF6B35' : '#00C896';

  return (
    <div className="relative flex flex-col items-center select-none" style={{ height: 120 }}>
      {/* 星星特效 */}
      {showStar && (
        <>
          <span className="absolute text-yellow-400 text-lg animate-bounce" style={{ top: -8, left: 10 }}>★</span>
          <span className="absolute text-pink-400 text-sm animate-ping" style={{ top: 0, right: 8 }}>✦</span>
          <span className="absolute text-orange-400 text-base animate-bounce" style={{ top: 4, left: 50 }}>✦</span>
        </>
      )}

      <svg
        width="90"
        height="110"
        viewBox="0 0 90 110"
        style={{ transform: `translateY(${bodyY}px)`, transition: dancing ? 'none' : 'transform 0.3s ease-out' }}
      >
        {/* 陰影 */}
        <ellipse cx="45" cy="105" rx="22" ry="5" fill="rgba(0,0,0,0.08)" />

        {/* 身體 */}
        <rect x="27" y="60" width="36" height="34" rx="14" fill={moodColor} />

        {/* 左臂 */}
        <g transform={`rotate(${-armAngle}, 27, 72)`}>
          <rect x="12" y="65" width="16" height="10" rx="5" fill={moodColor} />
          {/* 左手 */}
          <circle cx="13" cy="70" r="6" fill="#FFDBB5" />
        </g>

        {/* 右臂 */}
        <g transform={`rotate(${armAngle}, 63, 72)`}>
          <rect x="62" y="65" width="16" height="10" rx="5" fill={moodColor} />
          {/* 右手 */}
          <circle cx="77" cy="70" r="6" fill="#FFDBB5" />
        </g>

        {/* 腿 */}
        <rect x="32" y="90" width="11" height="16" rx="5" fill={moodColor} />
        <rect x="47" y="90" width="11" height="16" rx="5" fill={moodColor} />
        {/* 鞋子 */}
        <ellipse cx="37" cy="106" rx="9" ry="5" fill="#2D3748" />
        <ellipse cx="53" cy="106" rx="9" ry="5" fill="#2D3748" />

        {/* 頭 */}
        <circle cx="45" cy="44" r="26" fill="#FFDBB5" />

        {/* 頭髮 */}
        <path d="M22 38 Q25 16 45 18 Q65 16 68 38" fill="#2D3748" />
        <circle cx="30" cy="28" r="5" fill="#2D3748" />
        <circle cx="60" cy="28" r="5" fill="#2D3748" />

        {/* 眼睛 */}
        {eyeSquint ? (
          <>
            <path d="M33 44 Q37 40 41 44" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M49 44 Q53 40 57 44" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="37" cy="44" r="5" fill="white" />
            <circle cx="53" cy="44" r="5" fill="white" />
            <circle cx="38" cy="44" r="3" fill="#2D3748" />
            <circle cx="54" cy="44" r="3" fill="#2D3748" />
            <circle cx="39" cy="43" r="1" fill="white" />
            <circle cx="55" cy="43" r="1" fill="white" />
          </>
        )}

        {/* 臉頰紅暈 */}
        <ellipse cx="30" cy="50" rx="6" ry="4" fill="#FFB3B3" opacity="0.5" />
        <ellipse cx="60" cy="50" rx="6" ry="4" fill="#FFB3B3" opacity="0.5" />

        {/* 嘴巴 */}
        {dancing ? (
          <path d="M38 55 Q45 62 52 55" stroke="#FF6B35" strokeWidth="2.5" fill="#FF6B35" opacity="0.8" strokeLinecap="round" />
        ) : (
          <path d="M39 55 Q45 60 51 55" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* 連續天數徽章 */}
        {streak > 0 && (
          <g>
            <circle cx="68" cy="22" r="12" fill="#FFD700" stroke="white" strokeWidth="2" />
            <text x="68" y="27" textAnchor="middle" fontSize="10" fontWeight="900" fill="#2D3748" fontFamily="Nunito, sans-serif">
              {streak > 99 ? '99+' : streak}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
