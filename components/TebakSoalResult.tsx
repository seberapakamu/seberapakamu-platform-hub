'use client';

import type { SoalResult } from '@/lib/types/tebak';

export interface TebakSoalResultProps {
  result: SoalResult;
  onNext: () => void;
  isLast: boolean;
}

export default function TebakSoalResult({ result, onNext, isLast }: TebakSoalResultProps) {
  const { character, correct, hints_used, score } = result;

  return (
    <div
      className="rounded-3xl p-6 flex flex-col gap-4 text-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `2px solid ${correct ? 'var(--color-success, #4ade80)' : 'var(--color-error, #f87171)'}`,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Result icon + label */}
      <div>
        <div className="text-5xl mb-2" aria-hidden="true">
          {correct ? '🎉' : '😢'}
        </div>
        <h3
          className="text-xl font-black"
          style={{
            color: correct ? 'var(--color-success, #4ade80)' : 'var(--color-error, #f87171)',
          }}
        >
          {correct ? 'Benar!' : 'Salah!'}
        </h3>
      </div>

      {/* Character info */}
      <div
        className="rounded-2xl p-4 text-left"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Karakter
        </p>
        <p className="text-lg font-black mb-1" style={{ color: 'var(--color-text-bold)' }}>
          {character.nama}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          🎌 {character.asal_anime}
        </p>
        {character.deskripsi && (
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {character.deskripsi}
          </p>
        )}
      </div>

      {/* Score info */}
      <div className="flex justify-center gap-6">
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
            Petunjuk Digunakan
          </p>
          <p className="text-xl font-black" style={{ color: 'var(--color-accent)' }}>
            {hints_used}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
            Skor Soal
          </p>
          <p className="text-xl font-black" style={{ color: 'var(--color-primary)' }}>
            +{score}
          </p>
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full py-3 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {isLast ? '🏁 Lihat Hasil Akhir' : '➡️ Soal Berikutnya'}
      </button>
    </div>
  );
}
