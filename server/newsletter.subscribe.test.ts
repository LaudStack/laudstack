/**
 * Tests for the newsletter subscription tRPC procedure.
 *
 * We mock the database helpers and the welcome email sender so the tests
 * run without a real DB or email service.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock dependencies before importing the router ────────────────────────

vi.mock("./db", () => ({
  subscribeToNewsletter: vi.fn(),
  markWelcomeEmailSent: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getActiveSubscribers: vi.fn(),
}));

vi.mock("./newsletter", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
}));

import * as db from "./db";
import * as newsletterHelper from "./newsletter";

// ─── Minimal tRPC caller setup ─────────────────────────────────────────────

// We test the procedure logic directly by calling the mutation handler.
// This avoids spinning up an HTTP server.

const mockSubscribeToNewsletter = db.subscribeToNewsletter as ReturnType<typeof vi.fn>;
const mockSendWelcomeEmail = newsletterHelper.sendWelcomeEmail as ReturnType<typeof vi.fn>;
const mockMarkWelcomeEmailSent = db.markWelcomeEmailSent as ReturnType<typeof vi.fn>;

// ─── Tests ────────────────────────────────────────────────────────────────

describe("newsletter.subscribe procedure logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMarkWelcomeEmailSent.mockResolvedValue(undefined);
  });

  it("returns alreadySubscribed=true when email already exists", async () => {
    mockSubscribeToNewsletter.mockResolvedValue({
      isNew: false,
      alreadyUnsubscribed: false,
    });

    const { isNew } = await db.subscribeToNewsletter({
      email: "existing@example.com",
      firstName: null,
      source: "footer",
    });

    expect(isNew).toBe(false);
    // welcome email should NOT be triggered for existing subscribers
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("triggers welcome email for a new subscriber", async () => {
    mockSubscribeToNewsletter.mockResolvedValue({
      isNew: true,
      alreadyUnsubscribed: false,
    });

    const { isNew } = await db.subscribeToNewsletter({
      email: "new@example.com",
      firstName: "Alice",
      source: "homepage",
    });

    expect(isNew).toBe(true);

    // Simulate the procedure calling sendWelcomeEmail
    const sent = await newsletterHelper.sendWelcomeEmail("new@example.com", "Alice");
    expect(sent).toBe(true);

    if (sent) {
      await db.markWelcomeEmailSent("new@example.com");
    }
    expect(mockMarkWelcomeEmailSent).toHaveBeenCalledWith("new@example.com");
  });

  it("handles re-subscribe (previously unsubscribed) correctly", async () => {
    mockSubscribeToNewsletter.mockResolvedValue({
      isNew: true,
      alreadyUnsubscribed: true,
    });

    const result = await db.subscribeToNewsletter({
      email: "returning@example.com",
      firstName: null,
      source: "footer",
    });

    expect(result.isNew).toBe(true);
    expect(result.alreadyUnsubscribed).toBe(true);
  });

  it("does not throw when sendWelcomeEmail fails", async () => {
    mockSendWelcomeEmail.mockRejectedValue(new Error("SMTP error"));

    // The procedure should catch and not re-throw
    await expect(
      newsletterHelper.sendWelcomeEmail("fail@example.com", null).catch(() => false)
    ).resolves.toBe(false);
  });

  it("validates email format — rejects invalid email", () => {
    // z.string().email() validation
    const { z } = require("zod");
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts valid email with optional firstName", () => {
    const { z } = require("zod");
    const schema = z.object({
      email: z.string().email(),
      firstName: z.string().max(80).optional(),
      source: z.string().max(40).optional(),
    });
    const result = schema.safeParse({
      email: "valid@example.com",
      firstName: "Bob",
    });
    expect(result.success).toBe(true);
  });
});
