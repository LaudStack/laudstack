/**
 * Email Notification Service — Unit Tests
 *
 * Tests the email notification functions with mocked Resend client.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSend = vi.fn().mockResolvedValue({ id: 'test-id' });

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: { send: mockSend },
  })),
}));

describe('Email Notifications', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.RESEND_FROM_EMAIL = 'LaudStack <test@laudstack.com>';
    process.env.VITE_SITE_URL = 'https://laudstack.com';
    mockSend.mockClear();
    // Reset the module so the resendClient singleton is re-created
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('notifyNewReview', () => {
    it('should send email with correct parameters when API key is set', async () => {
      // Re-mock after resetModules
      vi.doMock('resend', () => ({
        Resend: vi.fn(() => ({
          emails: { send: mockSend },
        })),
      }));
      const { notifyNewReview } = await import('./emailNotifications');

      const result = await notifyNewReview({
        founderEmail: 'founder@example.com',
        founderName: 'John',
        toolName: 'TestTool',
        toolSlug: 'test-tool',
        reviewerName: 'Jane',
        rating: 4.5,
        reviewTitle: 'Great tool!',
      });

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'founder@example.com',
          subject: expect.stringContaining('TestTool'),
        })
      );
    });

    it('should return false when RESEND_API_KEY is missing', async () => {
      delete process.env.RESEND_API_KEY;
      vi.doMock('resend', () => ({
        Resend: vi.fn(() => ({
          emails: { send: mockSend },
        })),
      }));
      const { notifyNewReview } = await import('./emailNotifications');

      const result = await notifyNewReview({
        founderEmail: 'founder@example.com',
        founderName: 'John',
        toolName: 'TestTool',
        toolSlug: 'test-tool',
        reviewerName: 'Jane',
        rating: 4.5,
        reviewTitle: 'Great tool!',
      });

      expect(result).toBe(false);
    });
  });

  describe('notifyToolLauded', () => {
    it('should send laud notification email', async () => {
      vi.doMock('resend', () => ({
        Resend: vi.fn(() => ({
          emails: { send: mockSend },
        })),
      }));
      const { notifyToolLauded } = await import('./emailNotifications');

      const result = await notifyToolLauded({
        founderEmail: 'founder@example.com',
        founderName: 'John',
        toolName: 'TestTool',
        toolSlug: 'test-tool',
        lauderName: 'Jane',
        totalLauds: 150,
      });

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'founder@example.com',
          subject: expect.stringContaining('lauded'),
        })
      );
    });
  });

  describe('notifyFounderReply', () => {
    it('should send founder reply notification email', async () => {
      vi.doMock('resend', () => ({
        Resend: vi.fn(() => ({
          emails: { send: mockSend },
        })),
      }));
      const { notifyFounderReply } = await import('./emailNotifications');

      const result = await notifyFounderReply({
        reviewerEmail: 'reviewer@example.com',
        reviewerName: 'Jane',
        founderName: 'John',
        toolName: 'TestTool',
        toolSlug: 'test-tool',
        replyPreview: 'Thank you for your review!',
      });

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'reviewer@example.com',
          subject: expect.stringContaining('replied'),
        })
      );
    });
  });

  describe('sendWeeklyDigest', () => {
    it('should send weekly digest with tool listings', async () => {
      vi.doMock('resend', () => ({
        Resend: vi.fn(() => ({
          emails: { send: mockSend },
        })),
      }));
      const { sendWeeklyDigest } = await import('./emailNotifications');

      const result = await sendWeeklyDigest({
        subscriberEmail: 'user@example.com',
        subscriberName: 'Jane',
        newTools: [
          { name: 'Tool1', slug: 'tool-1', tagline: 'Great tool', category: 'AI Writing', rating: 4.5 },
          { name: 'Tool2', slug: 'tool-2', tagline: 'Another tool', category: 'AI Code', rating: 4.2 },
        ],
        trendingTools: [
          { name: 'TrendTool', slug: 'trend-tool', laudCount: 500 },
        ],
      });

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Weekly Stack Digest'),
        })
      );
    });

    it('should handle null subscriber name', async () => {
      vi.doMock('resend', () => ({
        Resend: vi.fn(() => ({
          emails: { send: mockSend },
        })),
      }));
      const { sendWeeklyDigest } = await import('./emailNotifications');

      const result = await sendWeeklyDigest({
        subscriberEmail: 'user@example.com',
        subscriberName: null,
        newTools: [],
        trendingTools: [],
      });

      expect(result).toBe(true);
    });
  });
});
