/**
 * Newsletter welcome email helper.
 *
 * Uses the Manus built-in Forge API (OpenAI-compatible) to generate a
 * personalised welcome email body, then dispatches it via the platform's
 * SendEmail endpoint.  If the email service is unavailable the function
 * returns false so callers can log and continue without crashing.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createPatchedFetch } from "./_core/patchedFetch";
import { ENV } from "./_core/env";

// ─── LLM client ────────────────────────────────────────────────────────────

function getOpenAI() {
  return createOpenAI({
    apiKey: ENV.forgeApiKey,
    baseURL: `${ENV.forgeApiUrl}/v1`,
    fetch: createPatchedFetch(fetch),
  });
}

// ─── Email dispatch via Forge API ──────────────────────────────────────────

async function sendEmailViaForge(opts: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Newsletter] Forge API not configured – skipping email send");
    return false;
  }

  const baseUrl = ENV.forgeApiUrl.endsWith("/")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/`;
  const endpoint = new URL(
    "webdevtoken.v1.WebDevService/SendEmail",
    baseUrl
  ).toString();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: opts.to,
        subject: opts.subject,
        html: opts.htmlBody,
        text: opts.textBody,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Newsletter] SendEmail failed (${response.status})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.warn("[Newsletter] Error calling SendEmail endpoint:", err);
    return false;
  }
}

// ─── Welcome email content generation ─────────────────────────────────────

async function generateWelcomeEmailContent(
  firstName: string | null
): Promise<{ subject: string; htmlBody: string; textBody: string }> {
  const greeting = firstName ? `Hi ${firstName}` : "Hi there";

  // Fallback static content in case LLM is unavailable
  const staticSubject = "Welcome to LaudStack — Your AI & SaaS Tool Hub";
  const staticText = `${greeting},

Welcome to LaudStack! We're thrilled to have you join our community of 12,000+ professionals who rely on us to discover, compare, and review the best AI & SaaS tools.

Here's what you can do on LaudStack:
• Discover 95+ AI and SaaS tools across 12 categories
• Read verified reviews from real users
• Track trending tools and fresh launches
• Submit your own tool via LaunchPad

Stay tuned — we'll send you curated picks, trending tools, and exclusive insights straight to your inbox.

Happy exploring,
The LaudStack Team
https://laudstack.manus.space`;

  const staticHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Inter',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#171717;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:900;color:#FFFFFF;letter-spacing:-0.03em;">Laud<span style="color:#F59E0B;">Stack</span></span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#171717;letter-spacing:-0.02em;">You're in! 🎉</h1>
            <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">${greeting},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">Welcome to <strong style="color:#171717;">LaudStack</strong> — the trusted source for discovering, comparing, and reviewing the best AI &amp; SaaS tools. You're joining 12,000+ professionals who rely on us every week.</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;width:100%;">
              <tr>
                <td style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#D97706;letter-spacing:0.08em;text-transform:uppercase;">What you can do</p>
                  <ul style="margin:0;padding:0 0 0 20px;color:#475569;font-size:14px;line-height:2;">
                    <li>Discover 95+ AI &amp; SaaS tools across 12 categories</li>
                    <li>Read verified reviews from real users</li>
                    <li>Track trending tools and fresh launches</li>
                    <li>Submit your own tool via LaunchPad</li>
                  </ul>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#F59E0B;border-radius:10px;">
                  <a href="https://laudstack.manus.space" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em;">Explore Tools →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94A3B8;">You're receiving this because you subscribed at LaudStack. <a href="#" style="color:#F59E0B;text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Try to enhance the text body with LLM if available
  if (!ENV.forgeApiKey || !ENV.forgeApiUrl) {
    return { subject: staticSubject, htmlBody: staticHtml, textBody: staticText };
  }

  try {
    const openai = getOpenAI();
    const model = openai.chat("gemini-2.5-flash");

    const { text: generatedText } = await generateText({
      model,
      maxOutputTokens: 400,
      prompt: `Write a brief, warm, professional welcome email plain-text body for a new LaudStack newsletter subscriber.
${firstName ? `Their first name is ${firstName}.` : "Address them as 'Hi there'."}

LaudStack is a platform where professionals discover, compare, and review AI & SaaS tools. Key features: 95+ tools, 12 categories, verified reviews, trending rankings, LaunchPad for founders.

Keep it under 150 words. Friendly but professional tone. No markdown. End with "The LaudStack Team".`,
    });

    return {
      subject: staticSubject,
      htmlBody: staticHtml,
      textBody: generatedText.trim() || staticText,
    };
  } catch (err) {
    console.warn("[Newsletter] LLM generation failed, using static content:", err);
    return { subject: staticSubject, htmlBody: staticHtml, textBody: staticText };
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Send a welcome email to a new newsletter subscriber.
 * Returns true if the email was dispatched successfully, false otherwise.
 * Never throws — callers should treat false as a soft failure.
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string | null
): Promise<boolean> {
  try {
    const { subject, htmlBody, textBody } =
      await generateWelcomeEmailContent(firstName);

    const sent = await sendEmailViaForge({
      to: email,
      subject,
      htmlBody,
      textBody,
    });

    if (sent) {
      console.info(`[Newsletter] Welcome email sent to ${email}`);
    } else {
      console.warn(`[Newsletter] Welcome email NOT sent to ${email}`);
    }

    return sent;
  } catch (err) {
    console.error("[Newsletter] Unexpected error sending welcome email:", err);
    return false;
  }
}
