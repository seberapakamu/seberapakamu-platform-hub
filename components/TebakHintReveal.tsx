'use client';

import type { AnimeCharacter } from '@/lib/types/tebak';
import CroppedImage from '@/components/CroppedImage';

export interface TebakHintRevealProps {
  character: AnimeCharacter;
  hintsRevealed: number; // 1 = gambar crop saja, 2 = +kutipan, 3 = +kekuatan, 4 = +asal anime
  onRequestHint: () => void;
  maxHints: number; // 4
}

const HINT_LABELS = ['Gambar Petunjuk', 'Kutipan Ikonik', 'Kekuatan/Kemampuan', 'Asal Anime'];

export default function TebakHintReveal({
  character,
  hintsRevealed,
  onRequestHint,
  maxHints,
}: TebakHintRevealProps) {
  const allRevealed = hintsRevealed >= maxHints;

  return (
    <div className="flex flex-col gap-4">
      {/* Hint 1: Gambar Crop */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <CroppedImage
            imageUrl={character.image_url ?? (character as AnimeCharacter & { siluet_url?: string }).siluet_url ?? ""}
            cropX={character.crop_x ?? 0}
            cropY={character.crop_y ?? 0}
            cropWidth={character.crop_width > 0 ? character.crop_width : 100}
            cropHeight={character.crop_height > 0 ? character.crop_height : 100}
            alt="Petunjuk gambar — tebak siapa karakter ini!"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Hint 2: Kutipan Ikonik */}
      {hintsRevealed >= 2 && (
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: 'var(--color-primary)' }}
          >
            💬 {HINT_LABELS[1]}
          </p>
          <p
            className="text-sm font-semibold italic leading-relaxed"
            style={{ color: 'var(--color-text-bold)' }}
          >
            &ldquo;{character.kutipan}&rdquo;
          </p>
        </div>
      )}

      {/* Hint 3: Kekuatan/Kemampuan */}
      {hintsRevealed >= 3 && (
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: 'var(--color-accent)' }}
          >
            ⚡ {HINT_LABELS[2]}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {character.kekuatan}
          </p>
        </div>
      )}

      {/* Hint 4: Asal Anime */}
      {hintsRevealed >= 4 && (
        <div
          className="rounded-2xl p-4"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: 'var(--color-secondary, #b5a0e8)' }}
          >
            🎌 {HINT_LABELS[3]}
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--color-text-bold)' }}
          >
            {character.asal_anime}
          </p>
        </div>
      )}

      {/* Hint counter + request button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5" aria-label={`${hintsRevealed} dari ${maxHints} petunjuk terungkap`}>
          {Array.from({ length: maxHints }).map((_, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  i < hintsRevealed ? 'var(--color-primary)' : 'var(--color-border)',
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        <button
          onClick={onRequestHint}
          disabled={allRevealed}
          className="px-4 py-2 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: allRevealed ? 'var(--color-border)' : 'var(--color-primary)',
            color: allRevealed ? 'var(--color-text-muted)' : '#fff',
          }}
          aria-disabled={allRevealed}
        >
          {allRevealed ? '✅ Semua Petunjuk Terungkap' : `💡 Minta Petunjuk (${hintsRevealed}/${maxHints})`}
        </button>
      </div>
    </div>
  );
}
