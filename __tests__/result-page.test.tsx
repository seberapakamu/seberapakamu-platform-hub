/**
 * Unit tests for Result Page (app/result/[hash]/page.tsx)
 * Requirements: 4.2, 4.6
 */
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import ResultPage from "../app/(wibu)/wibu/result/[hash]/page";

// ─── Supabase mock (prevents env var errors in test environment) ──────────────

jest.mock("../lib/supabase", () => ({
  supabase: {},
  createBrowserClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: "not found" } }),
        }),
      }),
    }),
  }),
  createAdminClient: () => ({}),
}));

// ─── ResultCardGenerator mock (prevents duplicate text from card preview) ────

jest.mock("../components/ResultCardGenerator", () => {
  const MockGenerator = () => <div data-testid="result-card-generator" />;
  MockGenerator.displayName = "ResultCardGenerator";
  return MockGenerator;
});

// ─── Next.js mocks ────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({ hash: "abc123" }),
}));

jest.mock("next/link", () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// ─── Zustand store mock ───────────────────────────────────────────────────────

jest.mock("../lib/store/quizStore", () => ({
  useQuizStore: () => ({
    sessionId: "",
    username: "",
    questions: [],
    currentIndex: 0,
    answers: {},
    startTime: 0,
    finished: false,
    hasPendingSession: false,
  }),
}));

// ─── Clipboard mock ───────────────────────────────────────────────────────────

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HASH = "abc123";

function setLocalStorage(hash: string, data: object, activeHash?: string) {
  localStorage.setItem(`wibu_result_${hash}`, JSON.stringify(data));
  if (activeHash !== undefined) {
    localStorage.setItem("wibu_active_result_hash", activeHash);
  }
}

function clearLocalStorage() {
  localStorage.clear();
}

// ─── Mock result data ─────────────────────────────────────────────────────────

const mockResult = {
  hash: HASH,
  username: "SepuhWibu99",
  score: 85,
  tier: 5,
  createdAt: "2024-06-01T10:00:00.000Z",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ResultPage - Requirement 4.2: Render skor, tier, dan username", () => {
  beforeEach(() => {
    clearLocalStorage();
    setLocalStorage(HASH, mockResult, HASH); // owner session
  });

  afterEach(() => {
    clearLocalStorage();
  });

  it("menampilkan username pengguna", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText("SepuhWibu99")).toBeInTheDocument();
  });

  it("menampilkan skor numerik", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    // Score is rendered inside the ScoreRing as a number
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("menampilkan nama tier yang sesuai dengan skor", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    // Score 85 → Tier 5 "Sepuh Wibu"
    expect(screen.getByText("Sepuh Wibu")).toBeInTheDocument();
  });

  it("menampilkan deskripsi tier yang humoris", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    expect(
      screen.getByText(/Kamu telah mencapai puncak kewibuan/i)
    ).toBeInTheDocument();
  });

  it("menampilkan emoji tier", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    // Tier 5 emoji is 👑
    const tierBadge = screen.getByText("👑");
    expect(tierBadge).toBeInTheDocument();
  });

  it("menampilkan tier yang benar untuk skor rendah (Tier 1 - Casual Viewer)", async () => {
    clearLocalStorage();
    setLocalStorage(HASH, { ...mockResult, score: 10, tier: 1 }, HASH);
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText("Casual Viewer")).toBeInTheDocument();
    expect(screen.getByText(/Kamu sesekali nonton anime/i)).toBeInTheDocument();
  });

  it("menampilkan tier yang benar untuk skor menengah (Tier 3 - Wibu Terlatih)", async () => {
    clearLocalStorage();
    setLocalStorage(HASH, { ...mockResult, score: 50, tier: 3 }, HASH);
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText("Wibu Terlatih")).toBeInTheDocument();
    expect(screen.getByText(/Kamu sudah melewati garis/i)).toBeInTheDocument();
  });
});

describe("ResultPage - Requirement 4.6: Mode read-only untuk pengguna lain", () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it("tidak menampilkan banner read-only saat hash milik sesi aktif (owner)", async () => {
    setLocalStorage(HASH, mockResult, HASH); // activeHash === hash → owner
    await act(async () => {
      render(<ResultPage />);
    });
    expect(
      screen.queryByText(/Kamu sedang melihat hasil milik orang lain/i)
    ).not.toBeInTheDocument();
  });

  it("menampilkan banner read-only saat hash bukan milik sesi aktif", async () => {
    setLocalStorage(HASH, mockResult, "different-hash"); // activeHash !== hash → viewer
    await act(async () => {
      render(<ResultPage />);
    });
    expect(
      screen.getByText(/Kamu sedang melihat hasil milik orang lain/i)
    ).toBeInTheDocument();
  });

  it("menampilkan badge 'Mode Lihat' di navbar saat read-only", async () => {
    setLocalStorage(HASH, mockResult, "different-hash");
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText(/Mode Lihat/i)).toBeInTheDocument();
  });

  it("tidak menampilkan badge 'Mode Lihat' saat owner", async () => {
    setLocalStorage(HASH, mockResult, HASH);
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.queryByText(/Mode Lihat/i)).not.toBeInTheDocument();
  });

  it("menampilkan tombol 'Ulangi Kuis' hanya untuk owner", async () => {
    setLocalStorage(HASH, mockResult, HASH);
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText(/Ulangi Kuis/i)).toBeInTheDocument();
  });

  it("tidak menampilkan tombol 'Ulangi Kuis' untuk pengguna lain", async () => {
    setLocalStorage(HASH, mockResult, "different-hash");
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.queryByText(/Ulangi Kuis/i)).not.toBeInTheDocument();
  });

  it("menampilkan tombol 'Coba Kuis Ini!' untuk pengguna lain (bukan owner)", async () => {
    setLocalStorage(HASH, mockResult, "different-hash");
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText(/Coba Kuis Ini!/i)).toBeInTheDocument();
  });

  it("menampilkan hasil kuis (username, skor, tier) dalam mode read-only", async () => {
    setLocalStorage(HASH, mockResult, "different-hash");
    await act(async () => {
      render(<ResultPage />);
    });
    // Data still visible in read-only mode
    expect(screen.getByText("SepuhWibu99")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("Sepuh Wibu")).toBeInTheDocument();
  });
});

describe("ResultPage - Halaman tidak ditemukan", () => {
  afterEach(() => {
    clearLocalStorage();
  });

  it("menampilkan pesan error saat hasil tidak ada di localStorage", async () => {
    // localStorage is empty
    await act(async () => {
      render(<ResultPage />);
    });
    expect(screen.getByText(/Hasil tidak ditemukan/i)).toBeInTheDocument();
  });

  it("menampilkan link kembali ke beranda saat hasil tidak ditemukan", async () => {
    await act(async () => {
      render(<ResultPage />);
    });
    const homeLink = screen.getByRole("link", { name: /Kembali ke Beranda/i });
    expect(homeLink).toHaveAttribute("href", "/wibu");
  });
});
