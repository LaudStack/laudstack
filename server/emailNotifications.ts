/**
 * Email Notification Service — Powered by Resend
 *
 * Handles all transactional email notifications:
 *  - "Someone reviewed your tool" → sent to tool founder
 *  - "Your tool was lauded" → sent to tool founder (batched)
 *  - "Founder replied to your review" → sent to reviewer
 *  - Weekly digest of new tools → sent to subscribers
 *
 * Uses Resend API directly. Falls back gracefully if API key is missing.
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'LaudStack <notifications@laudstack.com>';
const SITE_URL = process.env.VITE_SITE_URL ?? 'https://laudstack.com';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('[EmailNotifications] RESEND_API_KEY not configured — skipping email');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#171717;padding:20px 32px;text-align:center;">
            <span style="font-size:20px;font-weight:900;color:#FFFFFF;letter-spacing:-0.03em;">Laud<span style="color:#F59E0B;">Stack</span></span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94A3B8;">You're receiving this because of your activity on <a href="${SITE_URL}" style="color:#F59E0B;text-decoration:none;">LaudStack</a>. <a href="${SITE_URL}/dashboard" style="color:#F59E0B;text-decoration:none;">Manage preferences</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Notification Types ──────────────────────────────────────────────────────

/**
 * Notify a founder that someone reviewed their tool.
 */
export async function notifyNewReview(opts: {
  founderEmail: string;
  founderName: string;
  toolName: string;
  toolSlug: string;
  reviewerName: string;
  rating: number;
  reviewTitle: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const stars = '★'.repeat(Math.round(opts.rating)) + '☆'.repeat(5 - Math.round(opts.rating));
  const toolUrl = `${SITE_URL}/tools/${opts.toolSlug}`;

  const html = baseTemplate(`
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#171717;letter-spacing:-0.02em;">New Review on ${opts.toolName}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Hi ${opts.founderName}, someone just reviewed your product on LaudStack.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
      <tr>
        <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#B45309;">${opts.reviewerName}</p>
          <p style="margin:0 0 8px;font-size:16px;color:#F59E0B;letter-spacing:2px;">${stars}</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#171717;">"${opts.reviewTitle}"</p>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#F59E0B;border-radius:10px;">
          <a href="${toolUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;">View Review & Reply →</a>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0;font-size:12px;color:#94A3B8;">Responding to reviews builds trust and improves your ranking on LaudStack.</p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.founderEmail,
      subject: `New ${Math.round(opts.rating)}-star review on ${opts.toolName}`,
      html,
    });
    console.info(`[EmailNotifications] New review notification sent to ${opts.founderEmail}`);
    return true;
  } catch (err) {
    console.warn('[EmailNotifications] Failed to send new review notification:', err);
    return false;
  }
}

/**
 * Notify a founder that their tool was lauded (upvoted).
 */
export async function notifyToolLauded(opts: {
  founderEmail: string;
  founderName: string;
  toolName: string;
  toolSlug: string;
  lauderName: string;
  totalLauds: number;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const toolUrl = `${SITE_URL}/tools/${opts.toolSlug}`;

  const html = baseTemplate(`
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#171717;letter-spacing:-0.02em;">${opts.toolName} was lauded!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Hi ${opts.founderName}, <strong style="color:#171717;">${opts.lauderName}</strong> just lauded your product on LaudStack.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
      <tr>
        <td style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:32px;font-weight:900;color:#16A34A;">${opts.totalLauds.toLocaleString()}</p>
          <p style="margin:0;font-size:12px;font-weight:700;color:#15803D;text-transform:uppercase;letter-spacing:0.08em;">Total Lauds</p>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#F59E0B;border-radius:10px;">
          <a href="${toolUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;">View Your Product →</a>
        </td>
      </tr>
    </table>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.founderEmail,
      subject: `${opts.lauderName} lauded ${opts.toolName} — now at ${opts.totalLauds.toLocaleString()} lauds`,
      html,
    });
    console.info(`[EmailNotifications] Laud notification sent to ${opts.founderEmail}`);
    return true;
  } catch (err) {
    console.warn('[EmailNotifications] Failed to send laud notification:', err);
    return false;
  }
}

/**
 * Notify a reviewer that a founder replied to their review.
 */
export async function notifyFounderReply(opts: {
  reviewerEmail: string;
  reviewerName: string;
  founderName: string;
  toolName: string;
  toolSlug: string;
  replyPreview: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const toolUrl = `${SITE_URL}/tools/${opts.toolSlug}`;
  const preview = opts.replyPreview.length > 150 ? opts.replyPreview.slice(0, 150) + '…' : opts.replyPreview;

  const html = baseTemplate(`
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#171717;letter-spacing:-0.02em;">Founder Reply on ${opts.toolName}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">Hi ${opts.reviewerName}, the founder of <strong style="color:#171717;">${opts.toolName}</strong> replied to your review.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
      <tr>
        <td style="background:#FFFBEB;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:0 12px 12px 0;padding:20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#B45309;text-transform:uppercase;letter-spacing:0.06em;">Founder Reply</p>
          <p style="margin:0;font-size:14px;color:#78350F;line-height:1.6;">"${preview}"</p>
          <p style="margin:8px 0 0;font-size:12px;color:#92400E;font-weight:600;">— ${opts.founderName}</p>
        </td>
      </tr>
    </table>
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#F59E0B;border-radius:10px;">
          <a href="${toolUrl}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;">View Full Thread →</a>
        </td>
      </tr>
    </table>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.reviewerEmail,
      subject: `${opts.founderName} replied to your review on ${opts.toolName}`,
      html,
    });
    console.info(`[EmailNotifications] Founder reply notification sent to ${opts.reviewerEmail}`);
    return true;
  } catch (err) {
    console.warn('[EmailNotifications] Failed to send founder reply notification:', err);
    return false;
  }
}

/**
 * Send a weekly digest of new tools to a subscriber.
 */
export async function sendWeeklyDigest(opts: {
  subscriberEmail: string;
  subscriberName: string | null;
  newTools: Array<{ name: string; slug: string; tagline: string; category: string; rating: number }>;
  trendingTools: Array<{ name: string; slug: string; laudCount: number }>;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const greeting = opts.subscriberName ? `Hi ${opts.subscriberName}` : 'Hi there';

  const toolRows = opts.newTools.slice(0, 5).map(t => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #F1F5F9;">
        <a href="${SITE_URL}/tools/${t.slug}" style="text-decoration:none;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#171717;">${t.name}</p>
          <p style="margin:0;font-size:12px;color:#64748B;">${t.tagline}</p>
        </a>
        <div style="margin-top:4px;">
          <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;background:#F8FAFC;color:#475569;border:1px solid #E2E8F0;">${t.category}</span>
          <span style="font-size:11px;color:#F59E0B;margin-left:8px;">${'★'.repeat(Math.round(t.rating))}</span>
        </div>
      </td>
    </tr>
  `).join('');

  const trendingRows = opts.trendingTools.slice(0, 3).map((t, i) => `
    <div style="display:inline-block;margin-right:12px;margin-bottom:8px;">
      <a href="${SITE_URL}/tools/${t.slug}" style="text-decoration:none;font-size:13px;font-weight:600;color:#171717;">
        ${i + 1}. ${t.name}
        <span style="color:#94A3B8;font-weight:400;">(${t.laudCount.toLocaleString()} lauds)</span>
      </a>
    </div>
  `).join('');

  const html = baseTemplate(`
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#171717;letter-spacing:-0.02em;">Your Weekly Stack Digest</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">${greeting}, here's what's new on LaudStack this week.</p>

    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#B45309;text-transform:uppercase;letter-spacing:0.08em;">New This Week</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      ${toolRows}
    </table>

    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#B45309;text-transform:uppercase;letter-spacing:0.08em;">Trending Stacks</p>
    <div style="margin:0 0 24px;">
      ${trendingRows}
    </div>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#F59E0B;border-radius:10px;">
          <a href="${SITE_URL}" style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;">Explore All Stacks →</a>
        </td>
      </tr>
    </table>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.subscriberEmail,
      subject: `Weekly Stack Digest — ${opts.newTools.length} new stacks this week`,
      html,
    });
    console.info(`[EmailNotifications] Weekly digest sent to ${opts.subscriberEmail}`);
    return true;
  } catch (err) {
    console.warn('[EmailNotifications] Failed to send weekly digest:', err);
    return false;
  }
}
