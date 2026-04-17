/**
 * Example-based test: Login redirect to `/admin`
 * Requirements: 1.1
 *
 * Verifies that after signInWithPassword succeeds,
 * router.push is called with '/admin' (not '/admin/dashboard').
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRouterPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockSignInWithPassword = jest.fn();

jest.mock("../lib/supabase", () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminLoginPage from "../app/admin/login/page";

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Login redirect — Requirement 1.1", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("Req 1.1: calls router.push('/admin') after successful login", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /masuk/i }).closest("form")!);
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/admin");
    });
  });

  it("Req 1.1: does NOT redirect to /admin/dashboard on successful login", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /masuk/i }).closest("form")!);
    });

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("Req 1.1: does NOT call router.push when login fails", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /masuk/i }).closest("form")!);
    });

    await waitFor(() => {
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  it("Req 1.1: router.push called exactly once with '/admin' on success", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.submit(screen.getByRole("button", { name: /masuk/i }).closest("form")!);
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith("/admin");
    });
  });
});
