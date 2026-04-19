'use client';

export interface ResumeModalProps {
  username: string;
  currentSoal: number; // 1-based
  totalSoal: number;
  onResume: () => void;
  onStartNew: () => void;
}

export default function ResumeModal({
  username,
  currentSoal,
  totalSoal,
  onResume,
  onStartNew,
}: ResumeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(90,90,122,0.4)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-xl p-8 text-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="text-4xl mb-3" aria-hidden="true">💾</div>

        <h2
          id="resume-modal-title"
          className="text-xl font-black mb-2"
          style={{ color: 'var(--color-text-bold)' }}
        >
          Sesi Sebelumnya Ditemukan!
        </h2>

        <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Hei{' '}
          <strong style={{ color: 'var(--color-primary)' }}>{username}</strong>!
        </p>

        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Kamu sudah di soal{' '}
          <strong style={{ color: 'var(--color-accent)' }}>
            {currentSoal}/{totalSoal}
          </strong>
          . Lanjutkan?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl font-black text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            ▶️ Lanjutkan Sesi
          </button>

          <button
            onClick={onStartNew}
            className="w-full py-3 rounded-2xl font-bold transition-colors"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            🔄 Mulai Baru
          </button>
        </div>
      </div>
    </div>
  );
}
