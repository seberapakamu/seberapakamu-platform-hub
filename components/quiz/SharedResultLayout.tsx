"use client";

import Link from "next/link";
import ResultCardGenerator from "@/components/ResultCardGenerator";
import type { TierInfo } from "@/lib/scoring";
import type { CardTemplate } from "@/components/ResultCard";
import { ReactNode } from "react";

export interface SharedResultLayoutProps {
  // Navigation
  navTitle: string;
  navHref: string;
  
  // State
  isOwner: boolean;
  
  // Data
  username: string;
  score: number;
  tierInfo: TierInfo;
  createdAt: string;
  
  // URLs for actions
  retryUrl: string;
  leaderboardUrl: string;
  tryQuizUrl: string;
  
  // Card Generator Config
  templates?: CardTemplate[];
  watermarkText?: string;
  quotes?: string[];
  downloadFilenamePrefix?: string;
  
  // Custom Share Component
  shareComponent?: ReactNode;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90" aria-hidden="true">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div
          className="text-3xl font-black"
          style={{ color: "var(--color-text-bold)" }}
        >
          {score}
        </div>
        <div className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
          / 100
        </div>
      </div>
    </div>
  );
}

export default function SharedResultLayout({
  navTitle,
  navHref,
  isOwner,
  username,
  score,
  tierInfo,
  createdAt,
  retryUrl,
  leaderboardUrl,
  tryQuizUrl,
  templates,
  watermarkText,
  quotes,
  downloadFilenamePrefix,
  shareComponent,
}: SharedResultLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed -top-24 -left-24 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-24 -right-24 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--color-accent)" }}
        aria-hidden="true"
      />

      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={navHref}
            className="text-xl font-black"
            style={{ color: "var(--color-primary)" }}
          >
            {navTitle}
          </Link>
          {!isOwner && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                color: "var(--color-text-muted)",
              }}
            >
              👁️ Mode Lihat
            </span>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-10">
        <div
          className="w-full max-w-lg rounded-3xl shadow-lg p-6 sm:p-10"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Read-only banner */}
          {!isOwner && (
            <div
              className="mb-6 px-4 py-3 rounded-2xl text-sm font-semibold text-center"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
              role="status"
            >
              📖 Kamu sedang melihat hasil milik orang lain
            </div>
          )}

          {/* Username */}
          <p
            className="text-center text-sm font-bold mb-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            Hasil kuis untuk
          </p>
          <h1
            className="text-center text-2xl font-black mb-6"
            style={{ color: "var(--color-primary)" }}
          >
            {username}
          </h1>

          {/* Score ring */}
          <div className="flex justify-center mb-6">
            <ScoreRing score={score} />
          </div>

          {/* Tier badge */}
          <div
            className="text-center mb-4 px-6 py-4 rounded-2xl"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="text-4xl mb-1" aria-hidden="true">
              {tierInfo.emoji}
            </div>
            <div
              className="text-xl font-black mb-2"
              style={{ color: "var(--color-text-bold)" }}
            >
              {tierInfo.title}
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              {tierInfo.description}
            </p>
          </div>

          {/* Date */}
          <p
            className="text-center text-xs mb-8"
            style={{ color: "var(--color-text-muted)" }}
          >
            Diselesaikan pada{" "}
            {new Date(createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 mb-8">
            {isOwner && (
              <Link
                href={retryUrl}
                className="w-full py-3 rounded-2xl font-black text-center text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                🔄 Ulangi Kuis
              </Link>
            )}
            <Link
              href={leaderboardUrl}
              className="w-full py-3 rounded-2xl font-bold text-center transition-colors"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-bold)",
                border: "1px solid var(--color-border)",
              }}
            >
              🏆 Lihat Leaderboard
            </Link>
            {!isOwner && (
              <Link
                href={tryQuizUrl}
                className="w-full py-3 rounded-2xl font-black text-center text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                🎮 Coba Kuis Ini!
              </Link>
            )}
          </div>

          {/* Result Card Generator */}
          <div
            className="pt-6 mb-6"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <p
              className="text-center text-sm font-bold mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              🖼️ Download Kartu Hasil
            </p>
            <ResultCardGenerator
              username={username}
              score={score}
              tierInfo={tierInfo}
              createdAt={createdAt}
              templates={templates}
              watermarkText={watermarkText}
              quotes={quotes}
              downloadFilenamePrefix={downloadFilenamePrefix}
            />
          </div>

          {/* Share section */}
          {shareComponent && (
            <div
              className="pt-6"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <p
                className="text-center text-sm font-bold mb-4"
                style={{ color: "var(--color-text-bold)" }}
              >
                {isOwner ? "🎉 Tantang Teman!" : "🔗 Bagikan Hasil Ini"}
              </p>
              {shareComponent}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
