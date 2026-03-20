import { Resend } from "resend";

// Lazy singleton — only instantiated at runtime, not during build
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "LaudStack <noreply@laudstack.com>";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://laudstack.com";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663413324407/3XGasP8CcX57JRU5Ai2Hv7/logo_dark_transparent_47bd35ed.png";

// ─── HTML escaping to prevent XSS in email templates ─────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Shared email shell ───────────────────────────────────────────────────────

function emailShell(body: string, preheaderText?: string): string {
  const year = new Date().getFullYear();
  const preheader = preheaderText ?? "LaudStack — The Trusted Source for SaaS &amp; AI Stacks";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>LaudStack</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Arial, sans-serif; }
    a { text-decoration: none; }
  </style>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-body { padding: 24px 20px !important; }
      .email-header { padding: 24px 20px !important; }
      .email-footer { padding: 24px 20px !important; }
      .otp-cell { width: 36px !important; height: 44px !important; }
      .otp-digit { font-size: 22px !important; line-height: 44px !important; }
      .otp-spacer { width: 4px !important; }
      .cta-btn { padding: 12px 28px !important; font-size: 13px !important; }
      .heading-lg { font-size: 22px !important; }
      .heading-md { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter','Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Preheader text (hidden) -->
        <div style="display:none;font-size:1px;color:#F1F5F9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
          ${preheader}
          ${"&zwnj;&nbsp;".repeat(30)}
        </div>

        <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background-color:#0F172A;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0F172A;"><tr><td style="padding:32px 40px;text-align:center;"><![endif]-->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}" style="text-decoration:none;">
                      <img src="${LOGO_URL}" alt="LaudStack" width="160" height="40" style="display:block;max-width:160px;height:auto;border:0;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:1px;background-color:#D97706;"></td>
                        <td style="padding:0 12px;">
                          <span style="font-size:11px;color:#94A3B8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">The Trusted Source for SaaS &amp; AI Stacks</span>
                        </td>
                        <td style="width:40px;height:1px;background-color:#D97706;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!--[if mso]></td></tr></table><![endif]-->
            </td>
          </tr>

          <!-- Amber accent line -->
          <tr>
            <td style="height:3px;background-color:#F59E0B;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="background-color:#FFFFFF;padding:40px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color:#0F172A;border-radius:0 0 16px 16px;padding:32px 40px;">
              <!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0F172A;"><tr><td style="padding:32px 40px;"><![endif]-->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Social proof -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <span style="font-size:12px;color:#64748B;">42+ Verified Stacks</span>
                        </td>
                        <td style="color:#334155;font-size:12px;">&middot;</td>
                        <td style="padding:0 8px;">
                          <span style="font-size:12px;color:#64748B;">100% Verified Reviews</span>
                        </td>
                        <td style="color:#334155;font-size:12px;">&middot;</td>
                        <td style="padding:0 8px;">
                          <span style="font-size:12px;color:#64748B;">Free to List</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <div style="height:1px;background-color:#1E293B;"></div>
                  </td>
                </tr>
                <!-- Links -->
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-size:13px;font-weight:700;">laudstack.com</a>
                    <span style="color:#334155;margin:0 10px;">&middot;</span>
                    <a href="${APP_URL}/privacy" style="color:#64748B;text-decoration:none;font-size:13px;">Privacy</a>
                    <span style="color:#334155;margin:0 10px;">&middot;</span>
                    <a href="${APP_URL}/terms" style="color:#64748B;text-decoration:none;font-size:13px;">Terms</a>
                    <span style="color:#334155;margin:0 10px;">&middot;</span>
                    <a href="${APP_URL}/contact" style="color:#64748B;text-decoration:none;font-size:13px;">Help</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="font-size:11px;color:#475569;margin:0;line-height:1.6;">
                      &copy; ${year} LaudStack, Inc. All rights reserved.<br />
                      Discover &middot; Review &middot; Launch
                    </p>
                  </td>
                </tr>
              </table>
              <!--[if mso]></td></tr></table><![endif]-->
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Shared CTA button helper (Outlook VML fallback) ─────────────────────────

function ctaButton(text: string, href: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="25%" strokecolor="#D97706" fillcolor="#F59E0B">
            <w:anchorlock/>
            <center style="color:#0F172A;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${text}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${href}" class="cta-btn" style="display:inline-block;background-color:#F59E0B;color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">
            ${text}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

// ─── Shared icon block helper ────────────────────────────────────────────────

function iconBlock(emoji: string, bgColor: string, borderColor: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <!--[if mso]>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:72px;height:72px;background-color:${bgColor};border:2px solid ${borderColor};text-align:center;vertical-align:middle;">
            <span style="font-size:32px;">${emoji}</span>
          </td></tr></table>
          <![endif]-->
          <!--[if !mso]><!-->
          <div style="width:72px;height:72px;background-color:${bgColor};border:2px solid ${borderColor};border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">${emoji}</span>
          </div>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
}

// ─── Shared info box helper ──────────────────────────────────────────────────

function infoBox(title: string, content: string, bgColor?: string, borderColor?: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgColor ?? "#F8FAFC"};border-radius:14px;border:1px solid ${borderColor ?? "#E2E8F0"};margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">${title}</p>
          ${content}
        </td>
      </tr>
    </table>`;
}

// ─── Shared footer note helper ───────────────────────────────────────────────

function footerNote(text: string): string {
  return `<p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">${text}</p>`;
}

// ─── Verification email (6-digit OTP) ────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const digits = code.split("");
  const digitCells = digits.map(d =>
    `<td class="otp-cell" style="width:48px;height:56px;background-color:#FFFBEB;border:2px solid #F59E0B;border-radius:12px;text-align:center;vertical-align:middle;">
      <span class="otp-digit" style="font-size:28px;font-weight:900;color:#0F172A;font-family:'Courier New',Courier,monospace;line-height:56px;">${d}</span>
    </td>`
  ).join('<td class="otp-spacer" style="width:8px;"></td>');

  const body = `
    ${iconBlock("&#9993;", "#FFFBEB", "#FDE68A")}

    <h1 class="heading-lg" style="font-size:26px;font-weight:900;color:#0F172A;margin:0 0 10px;text-align:center;letter-spacing:-0.03em;">
      Verify your email address
    </h1>
    <p style="font-size:15px;color:#64748B;text-align:center;margin:0 0 32px;line-height:1.7;">
      Enter the 6-digit code below to complete your<br />
      <strong style="color:#0F172A;">LaudStack</strong> account setup.
    </p>

    <!-- OTP Code Block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              ${digitCells}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Expiry notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <span style="font-size:13px;color:#94A3B8;font-weight:500;">
            This code expires in <strong style="color:#0F172A;">15 minutes</strong>
          </span>
        </td>
      </tr>
    </table>

    ${infoBox("How to verify", `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:22px;height:22px;background-color:#FEF3C7;border:1px solid #FDE68A;border-radius:50%;text-align:center;line-height:22px;">
              <span style="font-size:11px;font-weight:800;color:#D97706;">1</span>
            </td></tr></table>
          </td>
          <td style="padding:6px 0;padding-left:10px;">
            <span style="font-size:14px;color:#475569;line-height:1.5;">Return to the LaudStack sign-up page</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:22px;height:22px;background-color:#FEF3C7;border:1px solid #FDE68A;border-radius:50%;text-align:center;line-height:22px;">
              <span style="font-size:11px;font-weight:800;color:#D97706;">2</span>
            </td></tr></table>
          </td>
          <td style="padding:6px 0;padding-left:10px;">
            <span style="font-size:14px;color:#475569;line-height:1.5;">Enter the 6-digit code shown above</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;vertical-align:top;width:28px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:22px;height:22px;background-color:#DCFCE7;border:1px solid #BBF7D0;border-radius:50%;text-align:center;line-height:22px;">
              <span style="font-size:11px;font-weight:800;color:#16A34A;">&#10003;</span>
            </td></tr></table>
          </td>
          <td style="padding:6px 0;padding-left:10px;">
            <span style="font-size:14px;color:#475569;line-height:1.5;">Your account will be instantly activated</span>
          </td>
        </tr>
      </table>
    `)}

    <!-- Security note -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border-radius:12px;border:1px solid #BFDBFE;margin-bottom:8px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:top;width:20px;padding-right:10px;">
                <span style="font-size:14px;">&#128274;</span>
              </td>
              <td>
                <p style="font-size:12px;color:#1E40AF;margin:0;line-height:1.7;">
                  <strong>Security notice:</strong> LaudStack will never ask for your password via email.
                  If you did not create a LaudStack account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${code} — Your LaudStack verification code`,
      html: emailShell(body, `${code} is your LaudStack verification code. It expires in 15 minutes.`),
    });

    if (error) {
      console.error("[Resend] Failed to send verification email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending verification email:", err);
    return false;
  }
}

// ─── Welcome email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  firstName: string | null
): Promise<boolean> {
  const name = firstName ? escapeHtml(firstName) : "there";

  const body = `
    ${iconBlock("&#128075;", "#FFFBEB", "#FDE68A")}

    <h2 class="heading-lg" style="font-size:24px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Welcome to LaudStack, ${name}!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 18px;text-align:center;">
      You&rsquo;re now part of a growing community of professionals who rely on LaudStack to discover the right SaaS &amp; AI stacks.
    </p>

    ${infoBox("What you can do now", `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x2728; Browse curated SaaS &amp; AI stacks</span></td></tr>
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x2B50; Write verified reviews and help the community</span></td></tr>
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F525; Discover rising stacks and exclusive deals</span></td></tr>
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F4CA; Compare stacks side-by-side with real data</span></td></tr>
      </table>
    `)}

    ${ctaButton("Start Exploring Stacks &rarr;", APP_URL)}

    ${footerNote(`You&rsquo;re receiving this because you created an account at LaudStack.<br /><a href="${APP_URL}/unsubscribe" style="color:#94A3B8;text-decoration:underline;">Unsubscribe</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to LaudStack — Your SaaS & AI discovery hub",
      html: emailShell(body, `Welcome to LaudStack, ${firstName ?? "there"}! Start discovering the best SaaS &amp; AI stacks.`),
      headers: {
        "List-Unsubscribe": `<${APP_URL}/unsubscribe>`,
      },
    });

    if (error) {
      console.error("[Resend] Failed to send welcome email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending welcome email:", err);
    return false;
  }
}

// ─── Tool submission confirmation ─────────────────────────────────────────────

export async function sendToolSubmissionEmail(
  email: string,
  toolName: string,
  toolSlug: string
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);

  const body = `
    ${iconBlock("&#x1F680;", "#FFFBEB", "#FDE68A")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Your stack has been submitted!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">
      <strong style="color:#0F172A;">${safeToolName}</strong> has been submitted to LaudStack and is now under review.
      We typically review submissions within 1&ndash;2 business days.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      Once approved, your stack will be live and discoverable by professionals on LaudStack.
    </p>

    ${infoBox("What happens next", `
      <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">
        Our editorial team will review your submission for quality, accuracy, and completeness.
        You&rsquo;ll receive an email notification once a decision has been made.
      </p>
    `)}

    ${footerNote(`Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your stack "${escapeHtml(toolName)}" has been submitted to LaudStack`,
      html: emailShell(body, `${toolName} has been submitted to LaudStack and is under review.`),
    });

    if (error) {
      console.error("[Resend] Failed to send tool submission email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending tool submission email:", err);
    return false;
  }
}

// ─── Claim approval email ─────────────────────────────────────────────────────

export async function sendClaimApprovedEmail(
  email: string,
  toolName: string,
  toolSlug: string
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);

  const body = `
    ${iconBlock("&#x2705;", "#ECFDF5", "#6EE7B7")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Your claim has been approved!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">
      Congratulations! Your ownership claim for <strong style="color:#0F172A;">${safeToolName}</strong> has been verified and approved by the LaudStack team.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      You now have full founder access to manage your stack&rsquo;s listing, respond to reviews, update details, and track analytics.
    </p>

    ${infoBox("What you can do now", `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x270F;&#xFE0F; Edit your stack&rsquo;s description, screenshots, and pricing</span></td></tr>
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F4AC; Reply to user reviews and engage your community</span></td></tr>
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F4CA; Track views, clicks, saves, and Lauds from your dashboard</span></td></tr>
        <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F680; Request spotlight placement or promotion</span></td></tr>
      </table>
    `)}

    ${ctaButton("Go to Founder Dashboard &rarr;", `${APP_URL}/dashboard/founder`)}

    ${footerNote(`Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Claim approved — You now manage "${escapeHtml(toolName)}" on LaudStack`,
      html: emailShell(body, `Your ownership claim for ${toolName} has been approved! You now have full founder access.`),
    });
    if (error) {
      console.error("[Resend] Failed to send claim approved email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending claim approved email:", err);
    return false;
  }
}

// ─── Claim rejection email ────────────────────────────────────────────────────

export async function sendClaimRejectedEmail(
  email: string,
  toolName: string,
  reason?: string
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);
  const reasonBlock = reason
    ? infoBox("Reason", `<p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">${escapeHtml(reason)}</p>`, "#FFF7ED", "#FED7AA")
    : "";

  const body = `
    ${iconBlock("&#x1F4CB;", "#FFF1F2", "#FECACA")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Claim update for ${safeToolName}
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">
      After reviewing your ownership claim for <strong style="color:#0F172A;">${safeToolName}</strong>, we were unable to verify it at this time.
    </p>
    ${reasonBlock}
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      You can submit a new claim with additional proof of ownership.
    </p>

    ${ctaButton("Submit New Claim &rarr;", `${APP_URL}/claim`)}

    ${footerNote(`Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Claim update for "${escapeHtml(toolName)}" on LaudStack`,
      html: emailShell(body, `We have an update about your ownership claim for ${toolName} on LaudStack.`),
    });
    if (error) {
      console.error("[Resend] Failed to send claim rejected email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending claim rejected email:", err);
    return false;
  }
}

// ─── Verification request outcome email ───────────────────────────────────────

export async function sendVerificationOutcomeEmail(
  email: string,
  toolName: string,
  toolSlug: string,
  approved: boolean
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);
  const icon = approved ? "&#x2705;" : "&#x1F50D;";
  const bgColor = approved ? "#ECFDF5" : "#FFFBEB";
  const borderColor = approved ? "#6EE7B7" : "#FDE68A";
  const headline = approved
    ? `${safeToolName} is now verified!`
    : `Verification update for ${safeToolName}`;
  const message = approved
    ? `Great news! <strong style="color:#0F172A;">${safeToolName}</strong> has been reviewed and awarded the <strong style="color:#059669;">Verified</strong> badge on LaudStack.`
    : `After reviewing your verification request for <strong style="color:#0F172A;">${safeToolName}</strong>, we need additional information before we can award the Verified badge.`;
  const preheader = approved
    ? `${toolName} has been verified on LaudStack!`
    : `We have an update about your verification request for ${toolName}.`;

  const body = `
    ${iconBlock(icon, bgColor, borderColor)}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">${headline}</h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">${message}</p>

    ${ctaButton("View Your Stack &rarr;", `${APP_URL}/tools/${toolSlug}`)}

    ${footerNote(`Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: approved ? `${escapeHtml(toolName)} is now verified on LaudStack` : `Verification update for "${escapeHtml(toolName)}" on LaudStack`,
      html: emailShell(body, preheader),
    });
    if (error) {
      console.error("[Resend] Failed to send verification outcome email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending verification outcome email:", err);
    return false;
  }
}

// ─── Promotion request outcome email ──────────────────────────────────────────

export async function sendPromotionOutcomeEmail(
  email: string,
  toolName: string,
  toolSlug: string,
  promotionType: string,
  approved: boolean,
  notes?: string
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);
  const typeLabel =
    promotionType === "featured" ? "Spotlight Placement" :
    promotionType === "sponsored" ? "Sponsored Listing" :
    promotionType === "newsletter" ? "Newsletter Feature" :
    escapeHtml(promotionType);
  const icon = approved ? "&#x1F31F;" : "&#x1F4DD;";
  const bgColor = approved ? "#FFFBEB" : "#F8FAFC";
  const borderColor = approved ? "#FDE68A" : "#E2E8F0";
  const headline = approved
    ? `${safeToolName} — Promotion approved!`
    : `Promotion update for ${safeToolName}`;
  const message = approved
    ? `Your <strong style="color:#D97706;">${typeLabel}</strong> request for <strong style="color:#0F172A;">${safeToolName}</strong> has been approved. Your stack will receive enhanced visibility on LaudStack.`
    : `We&rsquo;ve reviewed your <strong style="color:#475569;">${typeLabel}</strong> request for <strong style="color:#0F172A;">${safeToolName}</strong>. Unfortunately, we&rsquo;re unable to approve it at this time.`;
  const notesBlock = notes
    ? infoBox("Notes from our team", `<p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">${escapeHtml(notes)}</p>`)
    : "";
  const preheader = approved
    ? `Your ${typeLabel} request for ${toolName} has been approved!`
    : `We have an update about your ${typeLabel} request for ${toolName}.`;

  const body = `
    ${iconBlock(icon, bgColor, borderColor)}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">${headline}</h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">${message}</p>
    ${notesBlock}

    ${ctaButton(approved ? "View Dashboard &rarr;" : "Try Again &rarr;", `${APP_URL}/dashboard/founder`)}

    ${footerNote(`Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: approved ? `Promotion approved for "${escapeHtml(toolName)}" on LaudStack` : `Promotion update for "${escapeHtml(toolName)}" on LaudStack`,
      html: emailShell(body, preheader),
    });
    if (error) {
      console.error("[Resend] Failed to send promotion outcome email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending promotion outcome email:", err);
    return false;
  }
}


// ─── Launch Day Notification Email ──────────────────────────────────────────

export async function sendLaunchNotificationEmail(
  email: string,
  toolName: string,
  toolSlug: string | null,
  toolTagline: string,
  toolLogo: string | null
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);
  const toolUrl = toolSlug ? `${APP_URL}/tools/${toolSlug}` : APP_URL;
  const logoHtml = toolLogo
    ? `<img src="${escapeHtml(toolLogo)}" alt="${safeToolName}" width="48" height="48" style="display:block;border-radius:12px;border:1px solid #E2E8F0;" />`
    : `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:48px;height:48px;border-radius:12px;background-color:#F59E0B;text-align:center;vertical-align:middle;font-size:20px;font-weight:800;color:#0F172A;">${safeToolName.charAt(0)}</td></tr></table>`;

  const body = `
    <!-- Now Live badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:100px;padding:5px 14px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:6px;font-size:16px;vertical-align:middle;">&#x1F680;</td>
                    <td style="font-size:11px;font-weight:700;color:#D97706;letter-spacing:0.08em;text-transform:uppercase;vertical-align:middle;">Now Live</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Tool logo -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          ${logoHtml}
        </td>
      </tr>
    </table>

    <h1 class="heading-lg" style="font-size:26px;font-weight:800;color:#0F172A;text-align:center;margin:0 0 12px;letter-spacing:-0.02em;">
      ${safeToolName} Has Launched!
    </h1>
    <p style="font-size:15px;color:#475569;text-align:center;margin:0 0 28px;line-height:1.6;">
      ${escapeHtml(toolTagline)}
    </p>

    ${ctaButton("Check It Out &rarr;", toolUrl)}

    ${footerNote(`You received this because you subscribed to launch notifications for ${safeToolName} on <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>.<br /><a href="${APP_URL}/unsubscribe" style="color:#94A3B8;text-decoration:underline;">Unsubscribe</a>`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${escapeHtml(toolName)} just launched on LaudStack!`,
      html: emailShell(body, `${toolName} is now live on LaudStack! Check it out.`),
      headers: {
        "List-Unsubscribe": `<${APP_URL}/unsubscribe>`,
      },
    });
    if (error) {
      console.error("[Resend] Failed to send launch notification:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending launch notification:", err);
    return false;
  }
}


// ─── Contact Form Notification ────────────────────────────────────────────────

export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const topicLabels: Record<string, string> = {
    general: "General Inquiry",
    launch: "Launch / Update a Stack",
    trust: "Report a Listing or Review",
    partnership: "Partnership or Press",
    support: "Account Support",
    deals: "Deals & Promotions",
    templates: "Templates Marketplace",
    other: "Other",
  };
  const topicLabel = topicLabels[data.topic] || escapeHtml(data.topic);

  const body = `
    <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 24px;">New Contact Form Submission</h1>
    <table role="presentation" style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#64748B;font-weight:600;width:100px;vertical-align:top;">Name</td>
        <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:500;">${escapeHtml(data.name)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Email</td>
        <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="mailto:${escapeHtml(data.email)}" style="color:#F59E0B;text-decoration:none;">${escapeHtml(data.email)}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Topic</td>
        <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:500;">${topicLabel}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="font-size:13px;color:#64748B;font-weight:600;margin:0 0 8px;">Message</p>
          <p style="font-size:14px;color:#0F172A;line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
        </td>
      </tr>
    </table>
  `;

  try {
    const { data: result, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      replyTo: data.email,
      subject: `[LaudStack Contact] ${topicLabel} — ${escapeHtml(data.name)}`,
      html: emailShell(body, `New contact form submission from ${data.name}: ${topicLabel}`),
    });

    if (error) {
      console.error("[Resend] Failed to send contact form email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending contact form email:", err);
    return false;
  }
}


// ─── New Review Notification Email (to founder) ──────────────────────────────

export async function sendNewReviewEmail(
  founderEmail: string,
  toolName: string,
  toolSlug: string,
  reviewerName: string,
  rating: number,
  reviewExcerpt: string
): Promise<boolean> {
  const stars = "&#9733;".repeat(rating) + "&#9734;".repeat(5 - rating);
  const safeToolName = escapeHtml(toolName);
  const safeReviewerName = escapeHtml(reviewerName);
  const safeExcerpt = escapeHtml(reviewExcerpt.length > 200 ? reviewExcerpt.slice(0, 200) + "..." : reviewExcerpt);

  const body = `
    ${iconBlock("&#x2B50;", "#FFFBEB", "#FDE68A")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      New review for ${safeToolName}
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;text-align:center;">
      <strong style="color:#0F172A;">${safeReviewerName}</strong> just left a review on your stack.
    </p>

    ${infoBox("Review", `
      <p style="font-size:20px;color:#F59E0B;margin:0 0 12px;text-align:center;letter-spacing:2px;">${stars}</p>
      <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;font-style:italic;">&ldquo;${safeExcerpt}&rdquo;</p>
    `)}

    ${ctaButton("View Review &amp; Reply &rarr;", `${APP_URL}/tools/${toolSlug}`)}

    ${footerNote(`You received this because you manage <strong>${safeToolName}</strong> on <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>.`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: founderEmail,
      subject: `New ${rating}-star review on ${escapeHtml(toolName)}`,
      html: emailShell(body, `${reviewerName} left a ${rating}-star review on ${toolName}.`),
    });
    if (error) {
      console.error("[Resend] Failed to send new review email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending new review email:", err);
    return false;
  }
}


// ─── Reply Notification Email (to reviewer) ──────────────────────────────────

export async function sendReplyNotificationEmail(
  reviewerEmail: string,
  toolName: string,
  toolSlug: string,
  founderName: string,
  replyExcerpt: string
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);
  const safeFounderName = escapeHtml(founderName);
  const safeExcerpt = escapeHtml(replyExcerpt.length > 200 ? replyExcerpt.slice(0, 200) + "..." : replyExcerpt);

  const body = `
    ${iconBlock("&#x1F4AC;", "#DBEAFE", "#93C5FD")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      ${safeFounderName} replied to your review
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;text-align:center;">
      The team behind <strong style="color:#0F172A;">${safeToolName}</strong> responded to your review on LaudStack.
    </p>

    ${infoBox("Their reply", `
      <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;font-style:italic;">&ldquo;${safeExcerpt}&rdquo;</p>
    `)}

    ${ctaButton("View Conversation &rarr;", `${APP_URL}/tools/${toolSlug}`)}

    ${footerNote(`You received this because you reviewed <strong>${safeToolName}</strong> on <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>.`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: reviewerEmail,
      subject: `${escapeHtml(founderName)} replied to your review of ${escapeHtml(toolName)}`,
      html: emailShell(body, `${founderName} from ${toolName} replied to your review on LaudStack.`),
    });
    if (error) {
      console.error("[Resend] Failed to send reply notification email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending reply notification email:", err);
    return false;
  }
}


// ─── Admin Email Helpers ─────────────────────────────────────────────────────

/**
 * Fetch all admin/super_admin email addresses from the database.
 * Falls back to ADMIN_EMAIL env var if no admins are found in the DB.
 */
export async function getAdminEmails(): Promise<string[]> {
  try {
    // Dynamic import to avoid circular dependency at module load time
    const { db } = await import("@/server/db");
    const { users } = await import("@/drizzle/schema");
    const { inArray } = await import("drizzle-orm");

    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(inArray(users.role, ["admin", "super_admin"]));

    const emails = admins
      .map((a) => a.email)
      .filter((e): e is string => !!e);

    if (emails.length > 0) return emails;
  } catch (err) {
    console.error("[getAdminEmails] DB lookup failed, falling back to env:", err);
  }

  // Fallback to env var
  const fallback = process.env.ADMIN_EMAIL ?? "hello@laudstack.com";
  return [fallback];
}


// ─── Admin Alert: New User Signup ────────────────────────────────────────────

export async function sendAdminNewUserAlert(data: {
  userName: string;
  userEmail: string;
  loginMethod: string;
  userId: number;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const safeName = escapeHtml(data.userName || "Anonymous");
  const safeEmail = escapeHtml(data.userEmail);
  const method = escapeHtml(data.loginMethod || "email");

  const body = `
    <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 20px;">&#x1F464; New User Signup</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;width:100px;vertical-align:top;">Name</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="mailto:${safeEmail}" style="color:#F59E0B;text-decoration:none;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Method</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${method}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">User ID</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">#${data.userId}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton("View in Admin Panel &rarr;", `${APP_URL}/admin/users`)}
    ${footerNote("This is an automated admin notification from LaudStack.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack Admin] New user: ${data.userName || data.userEmail}`,
      html: emailShell(body, `New user signup: ${data.userName || data.userEmail}`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin new user alert:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin new user alert:", err);
    return false;
  }
}


// ─── Admin Alert: New Tool Submission ────────────────────────────────────────

export async function sendAdminNewSubmissionAlert(data: {
  toolName: string;
  founderName: string;
  founderEmail: string;
  category: string;
  submissionId: number;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const safeName = escapeHtml(data.toolName);
  const safeFounder = escapeHtml(data.founderName || "Unknown");
  const safeEmail = escapeHtml(data.founderEmail);
  const safeCategory = escapeHtml(data.category || "Uncategorized");

  const body = `
    <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 20px;">&#x1F680; New Tool Submission</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;width:110px;vertical-align:top;">Tool Name</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Category</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${safeCategory}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Founder</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${safeFounder}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="mailto:${safeEmail}" style="color:#F59E0B;text-decoration:none;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Submission ID</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">#${data.submissionId}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:14px;color:#475569;text-align:center;margin:0 0 24px;line-height:1.6;">
      This submission requires your review. Please approve or reject it in the admin panel.
    </p>

    ${ctaButton("Review Submission &rarr;", `${APP_URL}/admin/submissions`)}
    ${footerNote("This is an automated admin notification from LaudStack.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack Admin] New submission: ${data.toolName}`,
      html: emailShell(body, `New tool submission: ${data.toolName} by ${data.founderName || data.founderEmail}`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin submission alert:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin submission alert:", err);
    return false;
  }
}


// ─── Admin Alert: New Claim Request ──────────────────────────────────────────

export async function sendAdminNewClaimAlert(data: {
  toolName: string;
  toolId: number;
  claimantName: string;
  claimantEmail: string;
  proofUrl?: string;
  message?: string;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const safeTool = escapeHtml(data.toolName);
  const safeName = escapeHtml(data.claimantName || "Unknown");
  const safeEmail = escapeHtml(data.claimantEmail);

  const proofRow = data.proofUrl
    ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Proof URL</td>
        <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="${escapeHtml(data.proofUrl)}" style="color:#F59E0B;text-decoration:none;">View proof</a></td>
      </tr>`
    : "";

  const messageRow = data.message
    ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Message</td>
        <td style="padding:6px 0;font-size:14px;color:#475569;font-weight:400;line-height:1.6;">${escapeHtml(data.message)}</td>
      </tr>`
    : "";

  const body = `
    <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 20px;">&#x1F4CB; New Claim Request</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;width:110px;vertical-align:top;">Tool</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;">${safeTool}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Claimant</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="mailto:${safeEmail}" style="color:#F59E0B;text-decoration:none;">${safeEmail}</a></td>
            </tr>
            ${proofRow}
            ${messageRow}
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:14px;color:#475569;text-align:center;margin:0 0 24px;line-height:1.6;">
      This claim requires your review. Please verify ownership and approve or reject it.
    </p>

    ${ctaButton("Review Claims &rarr;", `${APP_URL}/admin/claims`)}
    ${footerNote("This is an automated admin notification from LaudStack.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack Admin] New claim: ${data.toolName} by ${data.claimantName || data.claimantEmail}`,
      html: emailShell(body, `New ownership claim for ${data.toolName} from ${data.claimantName || data.claimantEmail}`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin claim alert:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin claim alert:", err);
    return false;
  }
}


// ─── Admin Alert: New Review Posted ──────────────────────────────────────────

export async function sendAdminNewReviewAlert(data: {
  toolName: string;
  toolSlug: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  excerpt: string;
  isSpam: boolean;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const safeTool = escapeHtml(data.toolName);
  const safeName = escapeHtml(data.reviewerName || "Anonymous");
  const safeTitle = escapeHtml(data.title);
  const safeExcerpt = escapeHtml(data.excerpt.length > 200 ? data.excerpt.slice(0, 200) + "..." : data.excerpt);
  const stars = "&#9733;".repeat(data.rating) + "&#9734;".repeat(5 - data.rating);

  const spamBadge = data.isSpam
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr><td style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:4px 12px;font-size:11px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:0.05em;">&#x26A0; Flagged as Spam — Pending Moderation</td></tr></table>`
    : "";

  const bgColor = data.isSpam ? "#FEF2F2" : "#F8FAFC";
  const borderColor = data.isSpam ? "#FECACA" : "#E2E8F0";

  const body = `
    <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 20px;">&#x2B50; New Review Posted</h1>
    ${spamBadge}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${bgColor};border:1px solid ${borderColor};border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;width:100px;vertical-align:top;">Tool</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;">${safeTool}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Reviewer</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Rating</td>
              <td style="padding:6px 0;font-size:18px;color:#F59E0B;">${stars}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Title</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:600;">${safeTitle}</td>
            </tr>
          </table>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid ${borderColor};">
            <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;font-style:italic;">&ldquo;${safeExcerpt}&rdquo;</p>
          </div>
        </td>
      </tr>
    </table>

    ${ctaButton("View in Admin Panel &rarr;", `${APP_URL}/admin/reviews`)}
    ${footerNote("This is an automated admin notification from LaudStack.")}
  `;

  const subjectPrefix = data.isSpam ? "[SPAM] " : "";
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack Admin] ${subjectPrefix}New ${data.rating}-star review on ${data.toolName}`,
      html: emailShell(body, `${subjectPrefix}New ${data.rating}-star review on ${data.toolName} by ${data.reviewerName || "Anonymous"}`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin review alert:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin review alert:", err);
    return false;
  }
}


// ─── Admin Alert: Promotion Request ──────────────────────────────────────────

export async function sendAdminPromotionRequestAlert(data: {
  toolName: string;
  toolId: number;
  founderName: string;
  founderEmail: string;
  promotionType: string;
  message: string;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const safeTool = escapeHtml(data.toolName);
  const safeName = escapeHtml(data.founderName || "Unknown");
  const safeEmail = escapeHtml(data.founderEmail);
  const typeLabel =
    data.promotionType === "featured" ? "Spotlight Placement" :
    data.promotionType === "sponsored" ? "Sponsored Listing" :
    data.promotionType === "newsletter" ? "Newsletter Feature" :
    escapeHtml(data.promotionType);
  const safeMessage = escapeHtml(data.message);

  const body = `
    <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 20px;">&#x1F31F; Promotion Request</h1>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;width:110px;vertical-align:top;">Tool</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;">${safeTool}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Type</td>
              <td style="padding:6px 0;font-size:14px;color:#D97706;font-weight:700;">${typeLabel}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Founder</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Email</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="mailto:${safeEmail}" style="color:#F59E0B;text-decoration:none;">${safeEmail}</a></td>
            </tr>
          </table>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #FDE68A;">
            <p style="font-size:12px;font-weight:700;color:#64748B;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
            <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">${safeMessage}</p>
          </div>
        </td>
      </tr>
    </table>

    ${ctaButton("Review Request &rarr;", `${APP_URL}/admin/tools/${data.toolId}`)}
    ${footerNote("This is an automated admin notification from LaudStack.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack Admin] Promotion request: ${typeLabel} for ${data.toolName}`,
      html: emailShell(body, `${data.founderName || data.founderEmail} requested ${typeLabel} for ${data.toolName}`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin promotion alert:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin promotion alert:", err);
    return false;
  }
}


// ─── Admin Daily Digest Email ────────────────────────────────────────────────

export async function sendAdminDailyDigest(data: {
  totalUsers: number;
  totalTools: number;
  totalReviews: number;
  newUsersToday: number;
  newToolsToday: number;
  newReviewsToday: number;
  pendingSubmissions: number;
  pendingClaims: number;
  flaggedReviews: number;
  avgRating: string;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasActionItems = data.pendingSubmissions > 0 || data.pendingClaims > 0 || data.flaggedReviews > 0;

  const actionItemsHtml = hasActionItems
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <p style="font-size:12px;font-weight:800;color:#DC2626;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">&#x26A0; Action Required</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${data.pendingSubmissions > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#0F172A;">&#x1F4E5; <strong>${data.pendingSubmissions}</strong> pending submission${data.pendingSubmissions !== 1 ? "s" : ""} to review</td></tr>` : ""}
            ${data.pendingClaims > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#0F172A;">&#x1F4CB; <strong>${data.pendingClaims}</strong> pending claim${data.pendingClaims !== 1 ? "s" : ""} to verify</td></tr>` : ""}
            ${data.flaggedReviews > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#0F172A;">&#x1F6A9; <strong>${data.flaggedReviews}</strong> flagged review${data.flaggedReviews !== 1 ? "s" : ""} to moderate</td></tr>` : ""}
          </table>
        </td>
      </tr>
    </table>`
    : "";

  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 8px;text-align:center;">&#x1F4CA; Daily Platform Digest</h1>
    <p style="font-size:14px;color:#64748B;text-align:center;margin:0 0 28px;">${today}</p>

    ${actionItemsHtml}

    <!-- Today's Activity -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <p style="font-size:12px;font-weight:800;color:#16A34A;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Today's Growth</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;width:50%;">&#x1F464; New Users</td>
              <td style="padding:6px 0;font-size:16px;color:#0F172A;font-weight:800;text-align:right;"><span style="color:${data.newUsersToday > 0 ? "#16A34A" : "#64748B"};">${data.newUsersToday > 0 ? "+" : ""}${data.newUsersToday}</span></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;">&#x1F6E0; New Tools</td>
              <td style="padding:6px 0;font-size:16px;color:#0F172A;font-weight:800;text-align:right;"><span style="color:${data.newToolsToday > 0 ? "#16A34A" : "#64748B"};">${data.newToolsToday > 0 ? "+" : ""}${data.newToolsToday}</span></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;">&#x2B50; New Reviews</td>
              <td style="padding:6px 0;font-size:16px;color:#0F172A;font-weight:800;text-align:right;"><span style="color:${data.newReviewsToday > 0 ? "#16A34A" : "#64748B"};">${data.newReviewsToday > 0 ? "+" : ""}${data.newReviewsToday}</span></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Platform Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">Platform Totals</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#475569;">Total Users</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${data.totalUsers.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#475569;">Approved Tools</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${data.totalTools.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#475569;">Total Reviews</td>
              <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${data.totalReviews.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#475569;">Avg Rating</td>
              <td style="padding:6px 0;font-size:14px;color:#F59E0B;font-weight:700;text-align:right;">&#9733; ${data.avgRating}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton("Open Admin Dashboard &rarr;", `${APP_URL}/admin`)}
    ${footerNote("This daily digest is sent automatically. Manage notification preferences in admin settings.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack] Daily Digest — ${data.newUsersToday} new users, ${data.newReviewsToday} reviews${hasActionItems ? " ⚠️ Action needed" : ""}`,
      html: emailShell(body, `LaudStack daily digest: ${data.newUsersToday} new users, ${data.newToolsToday} new tools, ${data.newReviewsToday} new reviews.`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin daily digest:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin daily digest:", err);
    return false;
  }
}


// ─── Deal Approval Email (to founder) ───────────────────────────────────────

export async function sendDealApprovalEmail(
  founderEmail: string,
  data: { dealTitle: string; toolName: string; toolSlug: string }
): Promise<boolean> {
  const safeDealTitle = escapeHtml(data.dealTitle);
  const safeToolName = escapeHtml(data.toolName);

  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 8px;text-align:center;">&#x2705; Deal Approved!</h1>
    <p style="font-size:14px;color:#64748B;text-align:center;margin:0 0 28px;">Your deal is now live on LaudStack</p>

    ${infoBox("Deal Details", `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Deal</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeDealTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Stack</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeToolName}</td>
        </tr>
      </table>
    `, "#F0FDF4", "#BBF7D0")}

    <p style="font-size:14px;color:#475569;line-height:1.6;text-align:center;margin:0 0 24px;">
      Your deal has been reviewed and approved by the LaudStack team. It is now visible to all users on the deals page.
    </p>

    ${ctaButton("View Your Deal &rarr;", `${APP_URL}/tools/${data.toolSlug}`)}
    ${footerNote("You're receiving this because you submitted a deal on LaudStack.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: founderEmail,
      subject: `[LaudStack] Your deal "${safeDealTitle}" has been approved!`,
      html: emailShell(body, `Your deal "${safeDealTitle}" is now live on LaudStack.`),
    });
    if (error) {
      console.error("[Resend] Failed to send deal approval email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending deal approval email:", err);
    return false;
  }
}

// ─── Deal Rejection Email (to founder) ──────────────────────────────────────

export async function sendDealRejectionEmail(
  founderEmail: string,
  data: { dealTitle: string; toolName: string; reason?: string }
): Promise<boolean> {
  const safeDealTitle = escapeHtml(data.dealTitle);
  const safeToolName = escapeHtml(data.toolName);
  const safeReason = data.reason ? escapeHtml(data.reason) : "No specific reason provided.";

  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 8px;text-align:center;">Deal Not Approved</h1>
    <p style="font-size:14px;color:#64748B;text-align:center;margin:0 0 28px;">Your deal submission needs changes</p>

    ${infoBox("Deal Details", `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Deal</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeDealTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Stack</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeToolName}</td>
        </tr>
      </table>
    `, "#FFF1F2", "#FECDD3")}

    ${infoBox("Reason", `
      <p style="font-size:14px;color:#475569;line-height:1.6;margin:0;">${safeReason}</p>
    `)}

    <p style="font-size:14px;color:#475569;line-height:1.6;text-align:center;margin:0 0 24px;">
      You can update your deal and resubmit it from your founder dashboard.
    </p>

    ${ctaButton("Go to Dashboard &rarr;", `${APP_URL}/dashboard/founder`)}
    ${footerNote("You're receiving this because you submitted a deal on LaudStack.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: founderEmail,
      subject: `[LaudStack] Your deal "${safeDealTitle}" was not approved`,
      html: emailShell(body, `Your deal "${safeDealTitle}" was not approved. Please review the feedback.`),
    });
    if (error) {
      console.error("[Resend] Failed to send deal rejection email:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending deal rejection email:", err);
    return false;
  }
}

// ─── Admin Alert: New Deal Submitted ────────────────────────────────────────

export async function sendAdminNewDealAlert(data: {
  dealTitle: string;
  toolName: string;
  founderName: string;
  founderEmail: string;
  dealType: string;
  discountPercent?: number | null;
}): Promise<boolean> {
  const adminEmails = await getAdminEmails();
  const safeDealTitle = escapeHtml(data.dealTitle);
  const safeToolName = escapeHtml(data.toolName);
  const safeFounderName = escapeHtml(data.founderName || "Unknown");
  const safeFounderEmail = escapeHtml(data.founderEmail || "N/A");
  const safeDealType = escapeHtml(data.dealType || "discount");

  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#0F172A;margin:0 0 8px;text-align:center;">&#x1F4B0; New Deal Submitted</h1>
    <p style="font-size:14px;color:#64748B;text-align:center;margin:0 0 28px;">A founder has submitted a new deal for review</p>

    ${infoBox("Deal Details", `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Deal Title</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeDealTitle}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Stack</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeToolName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Deal Type</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeDealType}</td>
        </tr>
        ${data.discountPercent ? `
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Discount</td>
          <td style="padding:6px 0;font-size:14px;color:#16A34A;font-weight:700;text-align:right;">${data.discountPercent}% off</td>
        </tr>` : ""}
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Submitted By</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;font-weight:700;text-align:right;">${safeFounderName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#475569;">Email</td>
          <td style="padding:6px 0;font-size:14px;color:#0F172A;text-align:right;">${safeFounderEmail}</td>
        </tr>
      </table>
    `, "#FFFBEB", "#FDE68A")}

    ${ctaButton("Review Deal in Admin &rarr;", `${APP_URL}/admin/deals`)}
    ${footerNote("This is an automated admin notification. A new deal requires your review.")}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `[LaudStack Admin] New deal submitted: "${safeDealTitle}" for ${safeToolName}`,
      html: emailShell(body, `New deal submitted: "${safeDealTitle}" for ${safeToolName}. Review required.`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin new deal alert:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Resend] Exception sending admin new deal alert:", err);
    return false;
  }
}



// ─── Tool Lauded Notification Email (to founder) ────────────────────────────

export async function sendToolLaudedEmail(
  founderEmail: string,
  toolName: string,
  toolSlug: string,
  lauderName: string,
  totalLauds: number
): Promise<boolean> {
  const safeToolName = escapeHtml(toolName);
  const safeLauderName = escapeHtml(lauderName || "Someone");

  const body = `
    ${iconBlock("&#x1F44F;", "#F0FDF4", "#BBF7D0")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      ${safeToolName} just got lauded!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 20px;text-align:center;">
      <strong style="color:#0F172A;">${safeLauderName}</strong> lauded your stack on LaudStack.
      Your stack now has <strong style="color:#F59E0B;">${totalLauds}</strong> total laud${totalLauds !== 1 ? "s" : ""}.
    </p>

    ${ctaButton("View Your Stack &rarr;", `${APP_URL}/tools/${toolSlug}`)}

    ${footerNote(`You received this because you manage <strong>${safeToolName}</strong> on <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>.`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: founderEmail,
      subject: `${safeLauderName} lauded ${escapeHtml(toolName)} on LaudStack`,
      html: emailShell(body, `${lauderName} lauded ${toolName}. Total lauds: ${totalLauds}.`),
    });
    if (error) {
      console.error("[Resend] Failed to send tool lauded email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending tool lauded email:", err);
    return false;
  }
}


// ─── Weekly Digest Email ────────────────────────────────────────────────────

export async function sendWeeklyDigestEmail(
  recipientEmail: string,
  recipientName: string,
  data: {
    newToolsCount: number;
    topTools: Array<{ name: string; slug: string; rating: number; category: string }>;
    newReviewsCount: number;
    trendingCategories: string[];
  }
): Promise<boolean> {
  const safeName = escapeHtml(recipientName || "there");

  const toolRows = data.topTools
    .slice(0, 5)
    .map(
      (t) => `
      <tr>
        <td style="padding:10px 12px;font-size:14px;color:#0F172A;font-weight:600;border-bottom:1px solid #F1F5F9;">
          <a href="${APP_URL}/tools/${t.slug}" style="color:#0F172A;text-decoration:none;">${escapeHtml(t.name)}</a>
        </td>
        <td style="padding:10px 12px;font-size:13px;color:#F59E0B;font-weight:700;text-align:center;border-bottom:1px solid #F1F5F9;">
          ${"&#9733;".repeat(Math.round(t.rating))}
        </td>
        <td style="padding:10px 12px;font-size:12px;color:#64748B;text-align:right;border-bottom:1px solid #F1F5F9;">
          ${escapeHtml(t.category)}
        </td>
      </tr>`
    )
    .join("");

  const trendingCats = data.trendingCategories
    .slice(0, 4)
    .map(
      (c) =>
        `<span style="display:inline-block;padding:4px 12px;border-radius:100px;background:#FFFBEB;border:1px solid #FDE68A;font-size:12px;font-weight:600;color:#B45309;margin:3px 4px;">${escapeHtml(c)}</span>`
    )
    .join("");

  const body = `
    ${iconBlock("&#x1F4E8;", "#EFF6FF", "#BFDBFE")}

    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Your Weekly LaudStack Digest
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      Hey ${safeName}, here&rsquo;s what happened on LaudStack this week.
    </p>

    <!-- Stats row -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:0 6px 0 0;">
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:#16A34A;">${data.newToolsCount}</div>
            <div style="font-size:12px;font-weight:600;color:#64748B;margin-top:4px;">New Stacks</div>
          </div>
        </td>
        <td width="50%" style="padding:0 0 0 6px;">
          <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:#D97706;">${data.newReviewsCount}</div>
            <div style="font-size:12px;font-weight:600;color:#64748B;margin-top:4px;">New Reviews</div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Top tools -->
    ${data.topTools.length > 0 ? `
    <h3 style="font-size:16px;font-weight:800;color:#0F172A;margin:0 0 12px;">Top Stacks This Week</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;margin-bottom:24px;overflow:hidden;">
      <tr style="background:#F8FAFC;">
        <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;">Stack</td>
        <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;text-align:center;">Rating</td>
        <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;text-align:right;">Category</td>
      </tr>
      ${toolRows}
    </table>
    ` : ""}

    <!-- Trending categories -->
    ${data.trendingCategories.length > 0 ? `
    <h3 style="font-size:16px;font-weight:800;color:#0F172A;margin:0 0 12px;">Rising Categories</h3>
    <div style="margin-bottom:24px;text-align:center;">
      ${trendingCats}
    </div>
    ` : ""}

    ${ctaButton("Explore LaudStack &rarr;", APP_URL)}

    ${footerNote(`You received this weekly digest from <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>. <a href="${APP_URL}/settings" style="color:#94A3B8;text-decoration:underline;">Manage email preferences</a>.`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Your LaudStack Weekly: ${data.newToolsCount} new stacks, ${data.newReviewsCount} reviews`,
      html: emailShell(body, `${data.newToolsCount} new stacks and ${data.newReviewsCount} reviews on LaudStack this week.`),
    });
    if (error) {
      console.error("[Resend] Failed to send weekly digest email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending weekly digest email:", err);
    return false;
  }
}

// ─── Admin Invite Email ───────────────────────────────────────────────────────

const ROLE_DISPLAY_LABELS: Record<string, string> = {
  customer_rep: "Customer Rep",
  manager: "Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

export async function sendAdminInviteEmail(data: {
  recipientEmail: string;
  inviterName: string;
  role: string;
  token: string;
  message?: string;
  expiresAt: Date;
}): Promise<boolean> {
  const safeInviterName = escapeHtml(data.inviterName);
  const roleLabel = ROLE_DISPLAY_LABELS[data.role] || data.role;
  const inviteUrl = `${APP_URL}/admin-invite/accept?token=${encodeURIComponent(data.token)}`;
  const expiresFormatted = data.expiresAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const messageBlock = data.message
    ? `
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:0 0 24px;">
      <p style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Personal Message from ${safeInviterName}</p>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;font-style:italic;">&ldquo;${escapeHtml(data.message!)}&rdquo;</p>
    </div>`
    : "";

  const body = `
    ${iconBlock("&#x1F511;", "#FEF3C7", "#FDE68A")}
    <h2 class="heading-md" style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      You&rsquo;re Invited to Join LaudStack
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      <strong>${safeInviterName}</strong> has invited you to join the LaudStack admin team as a <strong style="color:#D97706;">${escapeHtml(roleLabel)}</strong>.
    </p>

    ${messageBlock}

    <!-- Role info card -->
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Your Role</div>
      <div style="font-size:24px;font-weight:900;color:#D97706;">${escapeHtml(roleLabel)}</div>
    </div>

    <!-- Instructions -->
    <div style="margin:0 0 24px;">
      <h3 style="font-size:15px;font-weight:800;color:#0F172A;margin:0 0 12px;">How to get started:</h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;border-radius:50%;background:#F59E0B;color:#fff;font-size:12px;font-weight:800;text-align:center;line-height:22px;">1</div>
          </td>
          <td style="padding:8px 0 8px 10px;font-size:14px;color:#334155;line-height:1.5;">Click the button below to open your invite</td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;border-radius:50%;background:#F59E0B;color:#fff;font-size:12px;font-weight:800;text-align:center;line-height:22px;">2</div>
          </td>
          <td style="padding:8px 0 8px 10px;font-size:14px;color:#334155;line-height:1.5;">Create your account with a secure password</td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:28px;">
            <div style="width:22px;height:22px;border-radius:50%;background:#F59E0B;color:#fff;font-size:12px;font-weight:800;text-align:center;line-height:22px;">3</div>
          </td>
          <td style="padding:8px 0 8px 10px;font-size:14px;color:#334155;line-height:1.5;">Access the admin panel and start managing</td>
        </tr>
      </table>
    </div>

    ${ctaButton("Accept Invite &amp; Create Account &rarr;", inviteUrl)}

    <!-- Expiration warning -->
    <div style="background:#FFF7ED;border:1px solid #FDBA74;border-radius:8px;padding:12px;margin:24px 0 0;text-align:center;">
      <p style="font-size:12px;color:#9A3412;margin:0;font-weight:600;">
        &#x23F3; This invite expires on ${expiresFormatted}
      </p>
    </div>

    ${footerNote(`This invite was sent by <strong>${safeInviterName}</strong> from <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>. If you did not expect this, you can safely ignore it.`)}
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.recipientEmail,
      subject: `You're invited to join LaudStack as ${roleLabel}`,
      html: emailShell(body, `${safeInviterName} invited you to join LaudStack as ${roleLabel}.`),
    });
    if (error) {
      console.error("[Resend] Failed to send admin invite email:", error);
    }
    return !error;
  } catch (err) {
    console.error("[Resend] Exception sending admin invite email:", err);
    return false;
  }
}
