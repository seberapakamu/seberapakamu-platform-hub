'use client';

export interface TebakStreakDisplayProps {
  streak: number;
  bestStreak: number;
}

export default function TebakStreakDisplay({ streak, bestStreak }: TebakStreakDisplayProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
      }}
      aria-label={`Streak saat ini: ${streak}, streak terbaik: ${bestStreak}`}
    >
      <span className="text-lg" aria-hidden="true">
        {streak >= 3 ? '🔥' : streak >= 1 ? '✨' : '💤'}
      </span>
      <div className="flex flex-col leading-none">
        <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
          Streak
        </span>
        <span className="text-base font-black" style={{ color: 'var(--color-accent)' }}>
          {streak}
          {bestStreak > 0 && (
            <span
              className="text-xs font-semibold ml-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              (best: {bestStreak})
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
