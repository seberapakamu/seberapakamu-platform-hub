'use client';

export interface TebakProgressBarProps {
  current: number; // 1-based soal saat ini
  total: number;
}

export default function TebakProgressBar({ current, total }: TebakProgressBarProps) {
  const pct = total > 0 ? Math.round(((current - 1) / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
          📋 Progress
        </span>
        <span className="text-xs font-black" style={{ color: 'var(--color-accent)' }}>
          Soal {current} dari {total}
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
        }}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Soal ${current} dari ${total}`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          }}
        />
      </div>
    </div>
  );
}
