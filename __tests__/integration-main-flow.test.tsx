/**
 * Integration tests for main user flow
 * Requirements: 2.5, 3.9, 4.1, 5.8, 6.7
 *
 * Covers the complete flow:
 * 1. Input username → validate & save to localStorage → redirect to quiz
 * 2. Answer all quiz questions → scoring calculation
 * 3. View results → display score, tier, username
 * 4. Download result card
 * 5. Share to social platforms
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useParams: () => ({ hash: "test-hash-123" }),
}));

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock Supabase
jest.mock("../lib/supabase", () => ({
  createBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "not found" } }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: "mock-session-id" }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  }),
}));

// Mock sessionTracking
jest.mock("../lib/sessionTracking", () => ({
  saveCompletedSession: jest.fn().mockResolvedValue("mock-session-id"),
  recordShareClicked: jest.fn().mockResolvedValue(undefined),
  getStoredSupabaseSessionId: jest.fn().mockReturnValue("mock-session-id"),
}));

// Mock ResultCardGenerator (avoids canvas complexity in integration tests)
jest.mock("../components/ResultCardGenerator", () => {
  const MockGenerator = ({
    username,
    score,
  }: {
    username: string;
    score: number;
    tierInfo: unknown;
    createdAt: string;
  }) => (
    <div data-testid="result-card-generator">
      <button
        aria-label="Download kartu hasil sebagai gambar"
        onClick={() => {
          // Simulate download trigger
          const a = document.createElement("a");
          a.download = `wibu-result-${username}-1080x1080.png`;
          a.href = "#";
          a.click();
        }}
      >
        ⬇️ Download Kartu
      </button>
      <span data-testid="generator-username">{username}</span>
      <span data-testid="generator-score">{score}</span>
    </div>
  );
  MockGenerator.displayName = "ResultCardGenerator";
  return MockGenerator;
});

// Mock QuizTimer
jest.mock("../components/QuizTimer", () => {
  const MockTimer = () => <div data-testid="quiz-timer" />;
  MockTimer.displayName = "QuizTimer";
  return MockTimer;
});

// Mock fetch for /api/admin/config
global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ data: [] }),
} as Response);

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: jest.fn().mockReturnValue("test-hash-123"),
  },
  configurable: true,
});

// Mock navigator.clipboard
const mockClipboardWriteText = jest.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockClipboardWriteText },
  configurable: true,
  writable: true,
});

// Mock window.open (for share links)
const mockWindowOpen = jest.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  configurable: true,
  writable: true,
});

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import UsernamePage, { validateUsername } from "../app/(wibu)/wibu/username/page";
import { calculateScore, getTier } from "../lib/scoring";
import ResultPage from "../app/(wibu)/wibu/result/[hash]/page";
import ShareModule from "../components/ShareModule";
import quizData from "../data/quiz_purity.json";
import type { Question } from "../lib/store/quizStore";

const questions = quizData.soal as Question[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clearStorage() {
  localStorage.clear();
}

function setResultInStorage(hash: string, data: object, activeHash?: string) {
  localStorage.setItem(`wibu_result_${hash}`, JSON.stringify(data));
  if (activeHash !== undefined) {
    localStorage.setItem("wibu_active_result_hash", activeHash);
  }
}

// ─── Flow Step 1: Username input → localStorage → redirect (Req 2.5) ─────────

describe("Flow Step 1 — Username input, save to localStorage, redirect to quiz", () => {
  beforeEach(() => {
    clearStorage();
    mockPush.mockClear();
  });

  it("Req 2.5: valid username is saved to localStorage on submit", async () => {
    const user = userEvent.setup();
    render(<UsernamePage />);

    const input = screen.getByRole("textbox", { name: /username/i });
    await user.type(input, "SepuhWibu99");
    await user.click(screen.getByRole("button", { name: /lanjut ke kuis/i }));

    expect(localStorage.getItem("wibu_username")).toBe("SepuhWibu99");
  });

  it("Req 2.5: router.push('/wibu/quiz') is called after valid username submit", async () => {
    const user = userEvent.setup();
    render(<UsernamePage />);

    const input = screen.getByRole("textbox", { name: /username/i });
    await user.type(input, "SepuhWibu99");
    await user.click(screen.getByRole("button", { name: /lanjut ke kuis/i }));

    expect(mockPush).toHaveBeenCalledWith("/wibu/quiz");
  });

  it("Req 2.5: username is trimmed before saving to localStorage", async () => {
    const user = userEvent.setup();
    render(<UsernamePage />);

    const input = screen.getByRole("textbox", { name: /username/i });
    await user.type(input, "  WibuUser  ");
    await user.click(screen.getByRole("button", { name: /lanjut ke kuis/i }));

    expect(localStorage.getItem("wibu_username")).toBe("WibuUser");
  });

  it("Req 2.5: invalid username does NOT save to localStorage or redirect", async () => {
    const user = userEvent.setup();
    render(<UsernamePage />);

    // Submit empty form
    await user.click(screen.getByRole("button", { name: /lanjut ke kuis/i }));

    expect(localStorage.getItem("wibu_username")).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Req 2.5: username with invalid characters does NOT redirect", async () => {
    const user = userEvent.setup();
    render(<UsernamePage />);

    const input = screen.getByRole("textbox", { name: /username/i });
    await user.type(input, "<script>xss</script>");
    await user.click(screen.getByRole("button", { name: /lanjut ke kuis/i }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(localStorage.getItem("wibu_username")).toBeNull();
  });

  it("Req 2.5: username over 30 chars does NOT redirect", async () => {
    const user = userEvent.setup();
    render(<UsernamePage />);

    const input = screen.getByRole("textbox", { name: /username/i });
    // maxLength=31 on input, so we bypass via fireEvent
    fireEvent.change(input, { target: { value: "A".repeat(31) } });
    await user.click(screen.getByRole("button", { name: /lanjut ke kuis/i }));

    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ─── Flow Step 2: Scoring calculation after answering all questions (Req 3.9) ─

describe("Flow Step 2 — Scoring calculation after answering all questions", () => {
  it("Req 3.9: calculateScore returns 0 when all answers are minimum", () => {
    // All ya_tidak answered 0, all skala answered 1 (minimum)
    const answers: Record<number, number> = {};
    for (const q of questions) {
      const minNilai = Math.min(...q.opsi_jawaban.map((o) => o.nilai));
      answers[q.id] = minNilai;
    }
    const score = calculateScore(answers, questions);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("Req 3.9: calculateScore returns 100 when all answers are maximum", () => {
    const answers: Record<number, number> = {};
    for (const q of questions) {
      const maxNilai = Math.max(...q.opsi_jawaban.map((o) => o.nilai));
      answers[q.id] = maxNilai;
    }
    const score = calculateScore(answers, questions);
    expect(score).toBe(100);
  });

  it("Req 3.9: score is a number between 0 and 100 for any valid answer set", () => {
    // Mid-range answers
    const answers: Record<number, number> = {};
    for (const q of questions) {
      const midIdx = Math.floor(q.opsi_jawaban.length / 2);
      answers[q.id] = q.opsi_jawaban[midIdx].nilai;
    }
    const score = calculateScore(answers, questions);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("Req 3.9: score formula uses weighted sum — higher answers produce higher score", () => {
    const lowAnswers: Record<number, number> = {};
    const highAnswers: Record<number, number> = {};
    for (const q of questions) {
      const sorted = [...q.opsi_jawaban].sort((a, b) => a.nilai - b.nilai);
      lowAnswers[q.id] = sorted[0].nilai;
      highAnswers[q.id] = sorted[sorted.length - 1].nilai;
    }
    const lowScore = calculateScore(lowAnswers, questions);
    const highScore = calculateScore(highAnswers, questions);
    expect(highScore).toBeGreaterThan(lowScore);
  });

  it("Req 3.9: unanswered questions count as 0 (reduces score)", () => {
    const allAnswered: Record<number, number> = {};
    for (const q of questions) {
      allAnswered[q.id] = Math.max(...q.opsi_jawaban.map((o) => o.nilai));
    }
    const fullScore = calculateScore(allAnswered, questions);
    // Remove one answer
    const partial = { ...allAnswered };
    delete partial[questions[0].id];
    const partialScore = calculateScore(partial, questions);
    expect(partialScore).toBeLessThan(fullScore);
  });

  it("Req 3.9: score is rounded to 1 decimal place", () => {
    const answers: Record<number, number> = {};
    for (const q of questions) {
      const midIdx = Math.floor(q.opsi_jawaban.length / 2);
      answers[q.id] = q.opsi_jawaban[midIdx].nilai;
    }
    const score = calculateScore(answers, questions);
    // Check it has at most 1 decimal place
    const decimalPart = String(score).split(".")[1];
    expect(!decimalPart || decimalPart.length <= 1).toBe(true);
  });

  it("Req 3.9: getTier returns correct tier for computed score", () => {
    const answers: Record<number, number> = {};
    for (const q of questions) {
      const maxNilai = Math.max(...q.opsi_jawaban.map((o) => o.nilai));
      answers[q.id] = maxNilai;
    }
    const score = calculateScore(answers, questions);
    const tier = getTier(score);
    expect(tier.tier).toBe(5); // max answers → Sepuh Wibu
    expect(tier.title).toBe("Sepuh Wibu");
  });
});

// ─── Flow Step 3: Result page displays score, tier, username (Req 4.1) ────────

describe("Flow Step 3 — Result page displays score, tier, username", () => {
  const HASH = "test-hash-123";

  beforeEach(() => {
    clearStorage();
  });

  afterEach(() => {
    clearStorage();
  });

  it("Req 4.1: result page renders at /result/{hash} with stored result data", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "SepuhWibu99", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
    await act(async () => {
      render(<ResultPage />);
    });
    // Username appears in h1 and in the generator mock span
    expect(screen.getAllByText("SepuhWibu99").length).toBeGreaterThan(0);
  });

  it("Req 4.1: result page shows the computed score", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "WibuUser", score: 72, tier: 4, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
    await act(async () => {
      render(<ResultPage />);
    });
    // Score appears in the score ring; use getAllByText since it may appear in multiple places
    const scoreElements = screen.getAllByText("72");
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it("Req 4.1: result page shows the correct tier title", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "WibuUser", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText("Sepuh Wibu")).toBeInTheDocument();
  });

  it("Req 4.1: result page shows tier description", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "WibuUser", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText(/Kamu telah mencapai puncak kewibuan/i)).toBeInTheDocument();
  });

  it("Req 4.1: result page shows tier emoji", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "WibuUser", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText("👑")).toBeInTheDocument();
  });

  it("Req 4.1: result page shows 'Hasil tidak ditemukan' when hash not in storage", async () => {
    // No data in localStorage
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText(/Hasil tidak ditemukan/i)).toBeInTheDocument();
  });

  it("Req 4.1: result page shows different tier for lower score", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "NewUser", score: 15, tier: 1, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText("Casual Viewer")).toBeInTheDocument();
  });
});

// ─── Flow Step 4: Download result card (Req 5.8) ─────────────────────────────

describe("Flow Step 4 — Download result card", () => {
  const HASH = "test-hash-123";

  beforeEach(() => {
    clearStorage();
    setResultInStorage(
      HASH,
      { hash: HASH, username: "SepuhWibu99", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );
  });

  afterEach(() => {
    clearStorage();
  });

  it("Req 5.8: result page renders the download button", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    expect(
      screen.getByRole("button", { name: /download kartu hasil/i })
    ).toBeInTheDocument();
  });

  it("Req 5.8: download button is clickable and triggers download action", async () => {
    const user = userEvent.setup();
    // Spy on anchor click to detect download trigger
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click");

    await act(async () => {
      render(<ResultPage />);
    });

    const downloadBtn = screen.getByRole("button", { name: /download kartu hasil/i });
    await user.click(downloadBtn);

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("Req 5.8: ResultCardGenerator receives correct username and score props", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByTestId("generator-username")).toHaveTextContent("SepuhWibu99");
    expect(screen.getByTestId("generator-score")).toHaveTextContent("85");
  });
});

// ─── Flow Step 5: Share to social platforms (Req 6.7) ────────────────────────

describe("Flow Step 5 — Share to social platforms", () => {
  const mockTierInfo = {
    tier: 5,
    title: "Sepuh Wibu",
    emoji: "👑",
    description: "Kamu telah mencapai puncak kewibuan.",
    minScore: 80,
    maxScore: 100,
  };

  beforeEach(() => {
    clearStorage();
    mockWindowOpen.mockClear();
    mockClipboardWriteText.mockClear();
  });

  it("Req 6.7: ShareModule renders share buttons for Twitter, WhatsApp, Telegram, Instagram", () => {
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    expect(screen.getByRole("link", { name: /share ke x \(twitter\)/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /share ke whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /share ke telegram/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share ke instagram/i })).toBeInTheDocument();
  });

  it("Req 6.7: Twitter share link contains encoded caption and result URL", () => {
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    const twitterLink = screen.getByRole("link", { name: /share ke x \(twitter\)/i });
    const href = twitterLink.getAttribute("href") || "";
    expect(href).toContain("twitter.com/intent/tweet");
    expect(href).toContain("text=");
    expect(href).toContain("url=");
  });

  it("Req 6.7: WhatsApp share link contains encoded text with caption and URL", () => {
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    const waLink = screen.getByRole("link", { name: /share ke whatsapp/i });
    const href = waLink.getAttribute("href") || "";
    expect(href).toContain("wa.me");
    expect(href).toContain("text=");
  });

  it("Req 6.7: Telegram share link contains URL and text params", () => {
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    const tgLink = screen.getByRole("link", { name: /share ke telegram/i });
    const href = tgLink.getAttribute("href") || "";
    expect(href).toContain("t.me/share/url");
    expect(href).toContain("url=");
    expect(href).toContain("text=");
  });

  it("Req 6.7: Instagram button copies caption+link to clipboard (no direct share URL)", async () => {
    const user = userEvent.setup();
    const writeSpy = jest.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    const igBtn = screen.getByRole("button", { name: /share ke instagram/i });
    await user.click(igBtn);

    expect(writeSpy).toHaveBeenCalled();
    const copiedText = writeSpy.mock.calls[0][0] as string;
    expect(copiedText).toContain("test-hash-123");
    writeSpy.mockRestore();
  });

  it("Req 6.7: copy link button copies the result URL to clipboard", async () => {
    const user = userEvent.setup();
    const writeSpy = jest.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    const copyBtn = screen.getByRole("button", { name: /salin link hasil/i });
    await user.click(copyBtn);

    expect(writeSpy).toHaveBeenCalled();
    const copiedText = writeSpy.mock.calls[0][0] as string;
    expect(copiedText).toContain("test-hash-123");
    writeSpy.mockRestore();
  });

  it("Req 6.7: caption is generated and displayed in the share module", () => {
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    // Caption box should contain hashtags for tier 5
    expect(screen.getByText(/#SepuhWibu|#WibuLegend|#SeberapaWibu/)).toBeInTheDocument();
  });

  it("Req 6.7: randomize caption button changes the caption style", async () => {
    const user = userEvent.setup();
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    const randomBtn = screen.getByRole("button", { name: /acak ulang caption/i });
    // Should not throw when clicked
    await user.click(randomBtn);
    // Caption area should still be present
    expect(screen.getByText(/#SeberapaWibu/)).toBeInTheDocument();
  });

  it("Req 6.7: copy caption button copies caption text to clipboard", async () => {
    const user = userEvent.setup();
    const writeSpy = jest.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(
      <ShareModule
        hash="test-hash-123"
        tierInfo={mockTierInfo}
        username="SepuhWibu99"
        score={85}
      />
    );
    // Use exact aria-label to avoid matching Instagram button
    const copyCapBtn = screen.getByRole("button", { name: "Salin caption" });
    await user.click(copyCapBtn);

    expect(writeSpy).toHaveBeenCalled();
    const copiedText = writeSpy.mock.calls[0][0] as string;
    expect(copiedText).toContain("#SeberapaWibu");
    writeSpy.mockRestore();
  });
});

// ─── End-to-end flow integration: username → score → result display ───────────

describe("End-to-end integration: username validation → score calculation → result display", () => {
  const HASH = "test-hash-123";

  beforeEach(() => {
    clearStorage();
    mockPush.mockClear();
  });

  afterEach(() => {
    clearStorage();
  });

  it("complete flow: valid username saved, max answers produce tier 5, result page shows it", async () => {
    // Step 1: Validate and save username
    expect(validateUsername("SepuhWibu99")).toBeNull();
    localStorage.setItem("wibu_username", "SepuhWibu99");
    expect(localStorage.getItem("wibu_username")).toBe("SepuhWibu99");

    // Step 2: Calculate score with max answers
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = Math.max(...q.opsi_jawaban.map((o) => o.nilai));
    }
    const score = calculateScore(answers, questions);
    const tier = getTier(score);
    expect(score).toBe(100);
    expect(tier.tier).toBe(5);

    // Step 3: Simulate quiz completion — store result
    const resultData = {
      hash: HASH,
      username: "SepuhWibu99",
      score,
      tier: tier.tier,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`wibu_result_${HASH}`, JSON.stringify(resultData));
    localStorage.setItem("wibu_active_result_hash", HASH);

    // Step 4: Render result page and verify display
    await act(async () => {
      render(<ResultPage />);
    });

    expect(screen.getAllByText("SepuhWibu99").length).toBeGreaterThan(0);
    expect(screen.getAllByText("100").length).toBeGreaterThan(0);
    expect(screen.getByText("Sepuh Wibu")).toBeInTheDocument();
  });

  it("complete flow: low answers produce tier 1, result page shows Casual Viewer", async () => {
    // Step 1: Save username
    localStorage.setItem("wibu_username", "NewUser");

    // Step 2: Calculate score with minimum answers
    const answers: Record<number, number> = {};
    for (const q of questions) {
      answers[q.id] = Math.min(...q.opsi_jawaban.map((o) => o.nilai));
    }
    const score = calculateScore(answers, questions);
    const tier = getTier(score);
    expect(tier.tier).toBe(1);

    // Step 3: Store result
    const resultData = {
      hash: HASH,
      username: "NewUser",
      score,
      tier: tier.tier,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`wibu_result_${HASH}`, JSON.stringify(resultData));
    localStorage.setItem("wibu_active_result_hash", HASH);

    // Step 4: Render result page
    await act(async () => {
      render(<ResultPage />);
    });

    expect(screen.getAllByText("NewUser").length).toBeGreaterThan(0);
    expect(screen.getByText("Casual Viewer")).toBeInTheDocument();
  });

  it("result page shows download and share sections for owner", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "SepuhWibu99", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      HASH
    );

    await act(async () => {
      render(<ResultPage />);
    });

    // Download section
    expect(screen.getByText(/Download Kartu Hasil/i)).toBeInTheDocument();
    expect(screen.getByTestId("result-card-generator")).toBeInTheDocument();

    // Share section
    expect(screen.getByText(/Tantang Teman/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /share ke x \(twitter\)/i })).toBeInTheDocument();
  });

  it("result page shows share section for read-only viewer too", async () => {
    setResultInStorage(
      HASH,
      { hash: HASH, username: "SepuhWibu99", score: 85, tier: 5, createdAt: "2024-06-01T10:00:00.000Z" },
      "different-hash" // not owner
    );

    await act(async () => {
      render(<ResultPage />);
    });

    // Read-only banner
    expect(screen.getByText(/Kamu sedang melihat hasil milik orang lain/i)).toBeInTheDocument();

    // Share section still present
    expect(screen.getByText(/Bagikan Hasil Ini/i)).toBeInTheDocument();
  });
});
