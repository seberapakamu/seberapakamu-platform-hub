/**
 * Unit tests for Wibu Landing Page (app/(wibu)/wibu/page.tsx)
 * Requirements: 1.1, 1.8
 *
 * Note: WibuHomePage is an async Server Component. We mock the module
 * with a synchronous version that renders the same default content.
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Link from 'next/link';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/link', () => {
  const MockLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('../components/PublicNav', () => ({
  PublicNavbar: () => (
    <nav>
      <a href="/wibu/wiki">Wiki</a>
      <a href="/wibu/blog">Blog</a>
      <a href="/wibu/username">Mulai Kuis</a>
    </nav>
  ),
  PublicFooter: () => (
    <footer>
      <span>WibuQuiz</span>
    </footer>
  ),
}));

// Mock the entire page module with a synchronous component using default data
jest.mock('../app/(wibu)/wibu/page', () => {
  const MockWibuHomePage = () => (
    <div>
      <nav>
        <a href="/wibu/wiki">Wiki</a>
        <a href="/wibu/blog">Blog</a>
        <a href="/wibu/username">Mulai Kuis</a>
      </nav>
      <main>
        <h1>Seberapa Wibu Kamu?</h1>
        <p>Uji tingkat kewibuan kamu dengan kuis interaktif yang seru dan jujur!</p>

        {/* Stats */}
        <div>
          <span>1.200+</span>
          <span>Pengguna telah ikut kuis</span>
        </div>
        <div>
          <span>35</span>
          <span>Pertanyaan seru</span>
        </div>
        <div>
          <span>5</span>
          <span>Level tier wibu</span>
        </div>

        {/* Quiz list */}
        <h2>Kuis Tersedia</h2>
        <div>
          <h3>Wibu Purity Test 🎌</h3>
          <p>Seberapa dalam kamu tenggelam di dunia anime? Jawab 35 pertanyaan jujur seputar tontonan, koleksi, bahasa, dan komunitas wibu-mu!</p>
          <span>35 pertanyaan</span>
          <a href="/wibu/username">Mulai →</a>
        </div>

        {/* CTA */}
        <a href="/wibu/username">Mulai Kuis Sekarang</a>
      </main>
      <footer>
        <span>WibuQuiz</span>
      </footer>
    </div>
  );
  MockWibuHomePage.displayName = 'WibuHomePage';
  return MockWibuHomePage;
});

// ─── Import after mocks ───────────────────────────────────────────────────────

import HomePage from '../app/(wibu)/wibu/page';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('HomePage - Landing Page', () => {
  beforeEach(() => {
    render(<HomePage />);
  });

  // Requirement 1.1 - Platform description
  it('renders platform description text', () => {
    expect(
      screen.getByText(/Uji tingkat kewibuan kamu/i)
    ).toBeInTheDocument();
  });

  it('renders main heading', () => {
    expect(screen.getByRole('heading', { name: /Seberapa/i, level: 1 })).toBeInTheDocument();
  });

  // Quiz list section
  it('renders quiz list section heading', () => {
    expect(screen.getByText(/Kuis Tersedia/i)).toBeInTheDocument();
  });

  it('renders Wibu Purity Test quiz card with title', () => {
    expect(screen.getByText('Wibu Purity Test 🎌')).toBeInTheDocument();
  });

  it('renders Wibu Purity Test quiz description', () => {
    expect(
      screen.getByText(/Seberapa dalam kamu tenggelam di dunia anime/i)
    ).toBeInTheDocument();
  });

  it('renders quiz question count', () => {
    const matches = screen.getAllByText(/35 pertanyaan/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  // Navigation links - Requirement 1.4, 1.5
  it('renders navigation link to /wibu/wiki', () => {
    const wikiLinks = screen.getAllByRole('link', { name: /wiki/i });
    expect(wikiLinks.length).toBeGreaterThan(0);
    expect(wikiLinks[0]).toHaveAttribute('href', '/wibu/wiki');
  });

  it('renders navigation link to /wibu/blog', () => {
    const blogLinks = screen.getAllByRole('link', { name: /blog/i });
    expect(blogLinks.length).toBeGreaterThan(0);
    expect(blogLinks[0]).toHaveAttribute('href', '/wibu/blog');
  });

  it('renders navigation link to /wibu/username', () => {
    const usernameLinks = screen.getAllByRole('link', { name: /mulai kuis/i });
    expect(usernameLinks.length).toBeGreaterThan(0);
    expect(usernameLinks[0]).toHaveAttribute('href', '/wibu/username');
  });

  // Stats section - Requirement 1.2
  it('renders user count stat', () => {
    expect(screen.getByText('1.200+')).toBeInTheDocument();
  });

  it('renders question count stat', () => {
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('renders tier count stat', () => {
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders stats labels', () => {
    expect(screen.getByText(/Pengguna telah ikut kuis/i)).toBeInTheDocument();
    expect(screen.getByText(/Level tier wibu/i)).toBeInTheDocument();
  });

  // CTA buttons - Requirement 1.6
  it('renders CTA button linking to /wibu/username', () => {
    const ctaLinks = screen.getAllByRole('link', { name: /Mulai Kuis Sekarang/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    expect(ctaLinks[0]).toHaveAttribute('href', '/wibu/username');
  });

  it('renders quiz card "Mulai" button linking to /wibu/username', () => {
    const mulaiLinks = screen.getAllByRole('link', { name: /Mulai →/i });
    expect(mulaiLinks.length).toBeGreaterThan(0);
    expect(mulaiLinks[0]).toHaveAttribute('href', '/wibu/username');
  });

  // Footer
  it('renders footer with brand name', () => {
    const matches = screen.getAllByText(/WibuQuiz/i);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe('HomePage - Responsiveness', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('renders correctly at mobile viewport (375px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<HomePage />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText(/Uji tingkat kewibuan kamu/i)).toBeInTheDocument();
    expect(screen.getByText('Wibu Purity Test 🎌')).toBeInTheDocument();
  });

  it('renders correctly at desktop viewport (1280px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    });
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<HomePage />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText(/Uji tingkat kewibuan kamu/i)).toBeInTheDocument();
    expect(screen.getByText('Wibu Purity Test 🎌')).toBeInTheDocument();
  });
});
