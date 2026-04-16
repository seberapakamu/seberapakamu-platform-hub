/**
 * Unit tests for ResultCard component
 * Requirements: 5.4, 5.6
 *
 * Tests:
 * - All required fields (score, tier, username, date, watermark) are rendered
 * - Random template selection produces one of the available templates
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResultCard, { CARD_TEMPLATES } from "../components/ResultCard";
import type { TierInfo } from "../lib/scoring";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockTierInfo: TierInfo = {
  tier: 3,
  title: "Wibu Terlatih",
  emoji: "⚔️",
  description: "Kamu sudah melewati garis. Koleksi mulai menumpuk.",
  minScore: 40,
  maxScore: 59.99,
};

const defaultProps = {
  username: "TestUser",
  score: 75,
  tierInfo: mockTierInfo,
  createdAt: "2026-04-16T10:00:00.000Z",
};

// ─── Field presence tests (Requirement 5.4) ───────────────────────────────────

describe("ResultCard - required fields are rendered", () => {
  it("renders the username", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    expect(screen.getByTestId("card-username")).toHaveTextContent("TestUser");
  });

  it("renders the score", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    expect(screen.getByTestId("card-score")).toHaveTextContent("75");
  });

  it("renders the tier title", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    expect(screen.getByTestId("card-tier")).toHaveTextContent("Wibu Terlatih");
  });

  it("renders the formatted date", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    const dateEl = screen.getByTestId("card-date");
    // Should contain year 2026 at minimum
    expect(dateEl.textContent).toMatch(/2026/);
  });

  it("renders the platform watermark", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    expect(screen.getByTestId("card-watermark")).toHaveTextContent("SeberapaWibu.id");
  });

  it("renders a humoris quote", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    const quoteEl = screen.getByTestId("card-quote");
    expect(quoteEl.textContent?.length).toBeGreaterThan(0);
  });

  it("renders the result card container", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
  });
});

// ─── Template selection tests (Requirement 5.6) ───────────────────────────────

describe("ResultCard - template selection", () => {
  it("renders template 0 (Sertifikat Sepuh) when templateIndex=0", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    expect(screen.getByTestId("result-card")).toBeInTheDocument();
    // Header title for template 0
    expect(screen.getByText("SERTIFIKAT SEPUH")).toBeInTheDocument();
  });

  it("renders template 1 (Surat Izin Binge) when templateIndex=1", () => {
    render(<ResultCard {...defaultProps} templateIndex={1} />);
    expect(screen.getByText("SURAT IZIN BINGE")).toBeInTheDocument();
  });

  it("renders template 2 (Lulus Akademi Waifu) when templateIndex=2", () => {
    render(<ResultCard {...defaultProps} templateIndex={2} />);
    expect(screen.getByText("LULUS AKADEMI WAIFU")).toBeInTheDocument();
  });

  it("CARD_TEMPLATES contains exactly 3 templates", () => {
    expect(CARD_TEMPLATES).toHaveLength(3);
  });

  it("all templates have required fields: id, name, bgGradient, accentColor, headerEmoji, headerTitle, footerLabel", () => {
    for (const tpl of CARD_TEMPLATES) {
      expect(typeof tpl.id).toBe("string");
      expect(typeof tpl.name).toBe("string");
      expect(typeof tpl.bgGradient).toBe("string");
      expect(typeof tpl.accentColor).toBe("string");
      expect(typeof tpl.headerEmoji).toBe("string");
      expect(typeof tpl.headerTitle).toBe("string");
      expect(typeof tpl.footerLabel).toBe("string");
    }
  });

  it("auto-selected template (no templateIndex) is one of the available templates", () => {
    // Without templateIndex, the component picks one deterministically from seed
    render(<ResultCard {...defaultProps} />);
    const card = screen.getByTestId("result-card");
    expect(card).toBeInTheDocument();

    // The rendered header title must match one of the known templates
    const renderedTitles = CARD_TEMPLATES.map((t) => t.headerTitle);
    const matchedTitle = renderedTitles.find((title) =>
      screen.queryByText(title)
    );
    expect(matchedTitle).toBeDefined();
  });

  it("deterministic seed produces consistent template selection across renders", () => {
    const { unmount } = render(<ResultCard {...defaultProps} />);
    const firstRender = screen.getByTestId("result-card").innerHTML;
    unmount();

    render(<ResultCard {...defaultProps} />);
    const secondRender = screen.getByTestId("result-card").innerHTML;

    expect(firstRender).toBe(secondRender);
  });

  it("different usernames produce potentially different template selections", () => {
    // username.length + score determines seed; different lengths → different seeds
    const propsA = { ...defaultProps, username: "A" }; // seed = 1 + 75 = 76 → 76 % 3 = 1
    const propsB = { ...defaultProps, username: "ABCDE" }; // seed = 5 + 75 = 80 → 80 % 3 = 2

    const { unmount } = render(<ResultCard {...propsA} />);
    const titleA = CARD_TEMPLATES.find((t) => screen.queryByText(t.headerTitle))?.id;
    unmount();

    render(<ResultCard {...propsB} />);
    const titleB = CARD_TEMPLATES.find((t) => screen.queryByText(t.headerTitle))?.id;

    // Both should be valid templates
    expect(CARD_TEMPLATES.map((t) => t.id)).toContain(titleA);
    expect(CARD_TEMPLATES.map((t) => t.id)).toContain(titleB);
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("ResultCard - edge cases", () => {
  it("renders score of 0 correctly", () => {
    render(<ResultCard {...defaultProps} score={0} templateIndex={0} />);
    expect(screen.getByTestId("card-score")).toHaveTextContent("0");
  });

  it("renders score of 100 correctly", () => {
    render(<ResultCard {...defaultProps} score={100} templateIndex={0} />);
    expect(screen.getByTestId("card-score")).toHaveTextContent("100");
  });

  it("renders long username without crashing", () => {
    const longUsername = "A".repeat(30);
    render(<ResultCard {...defaultProps} username={longUsername} templateIndex={0} />);
    expect(screen.getByTestId("card-username")).toHaveTextContent(longUsername);
  });

  it("renders tier emoji from tierInfo", () => {
    render(<ResultCard {...defaultProps} templateIndex={0} />);
    // The tier emoji is rendered inside the tier box
    const card = screen.getByTestId("result-card");
    expect(card.textContent).toContain(mockTierInfo.emoji);
  });
});
