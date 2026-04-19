'use client';

export interface TebakScoreDisplayProps {
  totalScore: number;
}

export default function TebakScoreDisplay({ totalScore }: TebakScoreDisplayProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
      }}
      aria-label={`Skor total: ${totalScore}`}
    >
      <span className="text-lg" aria-hidden="true">⭐</span>
      <div className="flex flex-col leading-none">
        <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
          Skor
        </span>
        <span className="text-base font-black" style={{ color: 'var(--color-primary)' }}>
          {totalScore}
        </span>
      </div>
    </div>
  );
}
