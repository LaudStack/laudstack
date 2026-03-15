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

// ─── Shared email shell ───────────────────────────────────────────────────────

function emailShell(body: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>LaudStack</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter','Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F1F5F9;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Preheader text (hidden) -->
        <div style="display:none;font-size:1px;color:#F1F5F9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
          LaudStack — The Trusted Source for SaaS &amp; AI Stacks
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
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
                        <td style="width:40px;height:1px;background-color:rgba(245,158,11,0.3);"></td>
                        <td style="padding:0 12px;">
                          <span style="font-size:11px;color:#94A3B8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">The Trusted Source for SaaS &amp; AI Stacks</span>
                        </td>
                        <td style="width:40px;height:1px;background-color:rgba(245,158,11,0.3);"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amber accent line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#F59E0B,#D97706,#F59E0B);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);border-radius:0 0 16px 16px;padding:32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Social proof -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <span style="font-size:12px;color:#64748B;">95+ Tools</span>
                        </td>
                        <td style="color:#334155;">·</td>
                        <td style="padding:0 8px;">
                          <span style="font-size:12px;color:#64748B;">12,000+ Users</span>
                        </td>
                        <td style="color:#334155;">·</td>
                        <td style="padding:0 8px;">
                          <span style="font-size:12px;color:#64748B;">4.9★ Avg Rating</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <div style="height:1px;background-color:rgba(255,255,255,0.08);"></div>
                  </td>
                </tr>
                <!-- Links -->
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-size:13px;font-weight:700;">laudstack.com</a>
                    <span style="color:#334155;margin:0 10px;">·</span>
                    <a href="${APP_URL}/privacy" style="color:#64748B;text-decoration:none;font-size:13px;">Privacy</a>
                    <span style="color:#334155;margin:0 10px;">·</span>
                    <a href="${APP_URL}/terms" style="color:#64748B;text-decoration:none;font-size:13px;">Terms</a>
                    <span style="color:#334155;margin:0 10px;">·</span>
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
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Verification email (6-digit OTP) ────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  // Split code into individual digits for styled display
  const digits = code.split("");
  const digitCells = digits.map(d =>
    `<td style="width:48px;height:56px;background-color:#FFFBEB;border:2px solid #F59E0B;border-radius:12px;text-align:center;vertical-align:middle;">
      <span style="font-size:28px;font-weight:900;color:#0F172A;font-family:'Courier New',Courier,monospace;line-height:56px;">${d}</span>
    </td>`
  ).join('<td style="width:8px;"></td>');

  const body = `
    <!-- Icon -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#FFFBEB,#FEF3C7);border:2px solid #FDE68A;border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">&#9993;</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <h1 style="font-size:26px;font-weight:900;color:#0F172A;margin:0 0 10px;text-align:center;letter-spacing:-0.03em;">
      Verify your email address
    </h1>
    <p style="font-size:15px;color:#64748B;text-align:center;margin:0 0 32px;line-height:1.7;">
      Enter the 6-digit code below to complete your<br />
      <strong style="color:#0F172A;">LaudStack</strong> account setup.
    </p>

    <!-- OTP Code Block — individual digit boxes -->
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

    <!-- Instructions -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">How to verify</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:6px 0;vertical-align:top;width:28px;">
                <div style="width:22px;height:22px;background-color:#FEF3C7;border:1px solid #FDE68A;border-radius:50%;text-align:center;line-height:22px;">
                  <span style="font-size:11px;font-weight:800;color:#D97706;">1</span>
                </div>
              </td>
              <td style="padding:6px 0;padding-left:10px;">
                <span style="font-size:14px;color:#475569;line-height:1.5;">Return to the LaudStack sign-up page</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;vertical-align:top;width:28px;">
                <div style="width:22px;height:22px;background-color:#FEF3C7;border:1px solid #FDE68A;border-radius:50%;text-align:center;line-height:22px;">
                  <span style="font-size:11px;font-weight:800;color:#D97706;">2</span>
                </div>
              </td>
              <td style="padding:6px 0;padding-left:10px;">
                <span style="font-size:14px;color:#475569;line-height:1.5;">Enter the 6-digit code shown above</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;vertical-align:top;width:28px;">
                <div style="width:22px;height:22px;background-color:#DCFCE7;border:1px solid #BBF7D0;border-radius:50%;text-align:center;line-height:22px;">
                  <span style="font-size:11px;font-weight:800;color:#16A34A;">&#10003;</span>
                </div>
              </td>
              <td style="padding:6px 0;padding-left:10px;">
                <span style="font-size:14px;color:#475569;line-height:1.5;">Your account will be instantly activated</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

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
      html: emailShell(body),
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
  const name = firstName ?? "there";

  const body = `
    <!-- Welcome icon -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#FEF3C7,#FFFBEB);border:2px solid #FDE68A;border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">&#128075;</span>
          </div>
        </td>
      </tr>
    </table>

    <h2 style="font-size:24px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Welcome to LaudStack, ${name}!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 18px;text-align:center;">
      You&rsquo;re now part of a community of <strong style="color:#0F172A;">12,000+ professionals</strong> who rely on LaudStack to discover the right SaaS &amp; AI stacks.
    </p>

    <!-- What you can do -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">What you can do now</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:5px 0;">
                <span style="font-size:14px;color:#475569;line-height:1.6;">&#x2728; Browse 95+ curated SaaS &amp; AI stacks</span>
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0;">
                <span style="font-size:14px;color:#475569;line-height:1.6;">&#x2B50; Write verified reviews and help the community</span>
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0;">
                <span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F680; Discover trending products and exclusive deals</span>
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0;">
                <span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F4CA; Compare tools side-by-side with real data</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">
            Start Exploring Tools &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
      You&rsquo;re receiving this because you created an account at LaudStack.<br />
      <a href="${APP_URL}/unsubscribe" style="color:#94A3B8;text-decoration:underline;">Unsubscribe</a>
    </p>
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to LaudStack — Your SaaS & AI discovery hub",
      html: emailShell(body),
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
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#FEF3C7,#FFFBEB);border:2px solid #FDE68A;border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">&#x1F680;</span>
          </div>
        </td>
      </tr>
    </table>

    <h2 style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Your tool has been submitted!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">
      <strong style="color:#0F172A;">${toolName}</strong> has been submitted to LaudStack and is now under review.
      We typically review submissions within 1&ndash;2 business days.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      Once approved, your tool will be live and discoverable by 12,000+ professionals on LaudStack.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">What happens next</p>
          <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">
            Our editorial team will review your submission for quality, accuracy, and completeness.
            You&rsquo;ll receive an email notification once a decision has been made.
          </p>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
      Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>
    </p>
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your tool "${toolName}" has been submitted to LaudStack`,
      html: emailShell(body),
    });

    return !error;
  } catch {
    return false;
  }
}

// ─── Claim approval email ─────────────────────────────────────────────────────
export async function sendClaimApprovedEmail(
  email: string,
  toolName: string,
  toolSlug: string
): Promise<boolean> {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#D1FAE5,#ECFDF5);border:2px solid #6EE7B7;border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">&#x2705;</span>
          </div>
        </td>
      </tr>
    </table>
    <h2 style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Your claim has been approved!
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">
      Congratulations! Your ownership claim for <strong style="color:#0F172A;">${toolName}</strong> has been verified and approved by the LaudStack team.
    </p>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      You now have full founder access to manage your tool&rsquo;s listing, respond to reviews, update details, and track analytics.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.08em;">What you can do now</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x270F;&#xFE0F; Edit your tool&rsquo;s description, screenshots, and pricing</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F4AC; Reply to user reviews and engage your community</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F4CA; Track views, clicks, saves, and Lauds from your dashboard</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:14px;color:#475569;line-height:1.6;">&#x1F680; Request featured placement or promotion</span></td></tr>
          </table>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/dashboard/founder" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">
            Go to Founder Dashboard &rarr;
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
      Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>
    </p>
  `;
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Claim approved \u2014 You now manage "${toolName}" on LaudStack`,
      html: emailShell(body),
    });
    return !error;
  } catch {
    return false;
  }
}

// ─── Claim rejection email ────────────────────────────────────────────────────
export async function sendClaimRejectedEmail(
  email: string,
  toolName: string,
  reason?: string
): Promise<boolean> {
  const reasonBlock = reason ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF7ED;border-radius:14px;border:1px solid #FED7AA;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#9A3412;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">Reason</p>
          <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">${reason}</p>
        </td>
      </tr>
    </table>` : "";
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,#FEE2E2,#FFF1F2);border:2px solid #FECACA;border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">&#x1F4CB;</span>
          </div>
        </td>
      </tr>
    </table>
    <h2 style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">
      Claim update for ${toolName}
    </h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">
      After reviewing your ownership claim for <strong style="color:#0F172A;">${toolName}</strong>, we were unable to verify it at this time.
    </p>
    ${reasonBlock}
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">
      You can submit a new claim with additional proof of ownership.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/claim" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">
            Submit New Claim &rarr;
          </a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
      Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a>
    </p>
  `;
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Claim update for "${toolName}" on LaudStack`,
      html: emailShell(body),
    });
    return !error;
  } catch {
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
  const icon = approved ? "&#x2705;" : "&#x1F50D;";
  const bgGrad = approved ? "#D1FAE5,#ECFDF5" : "#FEF3C7,#FFFBEB";
  const borderColor = approved ? "#6EE7B7" : "#FDE68A";
  const headline = approved
    ? `${toolName} is now verified!`
    : `Verification update for ${toolName}`;
  const message = approved
    ? `Great news! <strong style="color:#0F172A;">${toolName}</strong> has been reviewed and awarded the <strong style="color:#059669;">Verified</strong> badge on LaudStack.`
    : `After reviewing your verification request for <strong style="color:#0F172A;">${toolName}</strong>, we need additional information before we can award the Verified badge.`;
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,${bgGrad});border:2px solid ${borderColor};border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">${icon}</span>
          </div>
        </td>
      </tr>
    </table>
    <h2 style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">${headline}</h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 24px;text-align:center;">${message}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/tools/${toolSlug}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">View Your Tool &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a></p>
  `;
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: approved ? `${toolName} is now verified on LaudStack` : `Verification update for "${toolName}" on LaudStack`,
      html: emailShell(body),
    });
    return !error;
  } catch {
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
  const typeLabel =
    promotionType === "featured" ? "Featured Placement" :
    promotionType === "sponsored" ? "Sponsored Listing" :
    promotionType === "newsletter" ? "Newsletter Feature" :
    promotionType;
  const icon = approved ? "&#x1F31F;" : "&#x1F4DD;";
  const bgGrad = approved ? "#FEF3C7,#FFFBEB" : "#F1F5F9,#F8FAFC";
  const borderColor = approved ? "#FDE68A" : "#E2E8F0";
  const headline = approved
    ? `${toolName} \u2014 Promotion approved!`
    : `Promotion update for ${toolName}`;
  const message = approved
    ? `Your <strong style="color:#D97706;">${typeLabel}</strong> request for <strong style="color:#0F172A;">${toolName}</strong> has been approved. Your tool will receive enhanced visibility on LaudStack.`
    : `We&rsquo;ve reviewed your <strong style="color:#475569;">${typeLabel}</strong> request for <strong style="color:#0F172A;">${toolName}</strong>. Unfortunately, we&rsquo;re unable to approve it at this time.`;
  const notesBlock = notes ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border-radius:14px;border:1px solid #E2E8F0;margin-bottom:24px;">
      <tr>
        <td style="padding:24px;">
          <p style="font-size:12px;font-weight:800;color:#0F172A;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">Notes from our team</p>
          <p style="font-size:14px;color:#475569;margin:0;line-height:1.7;">${notes}</p>
        </td>
      </tr>
    </table>` : "";
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td align="center">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,${bgGrad});border:2px solid ${borderColor};border-radius:20px;display:inline-block;text-align:center;line-height:72px;">
            <span style="font-size:32px;">${icon}</span>
          </div>
        </td>
      </tr>
    </table>
    <h2 style="font-size:22px;font-weight:900;color:#0F172A;margin:0 0 12px;text-align:center;letter-spacing:-0.025em;">${headline}</h2>
    <p style="font-size:15px;color:#475569;line-height:1.7;margin:0 0 16px;text-align:center;">${message}</p>
    ${notesBlock}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${APP_URL}/dashboard/founder" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">${approved ? "View Dashboard" : "Try Again"} &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">Questions? Reply to this email or visit <a href="${APP_URL}/contact" style="color:#F59E0B;text-decoration:none;font-weight:600;">laudstack.com/contact</a></p>
  `;
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: approved ? `Promotion approved for "${toolName}" on LaudStack` : `Promotion update for "${toolName}" on LaudStack`,
      html: emailShell(body),
    });
    return !error;
  } catch {
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
  const toolUrl = toolSlug ? `${APP_URL}/tools/${toolSlug}` : APP_URL;
  const logoHtml = toolLogo
    ? `<img src="${toolLogo}" alt="${toolName}" width="48" height="48" style="display:block;border-radius:12px;border:1px solid #E2E8F0;" />`
    : `<div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#F59E0B,#D97706);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#0F172A;">${toolName.charAt(0)}</div>`;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:100px;padding:5px 14px;margin-bottom:20px;">
            <span style="font-size:16px;">🚀</span>
            <span style="font-size:11px;font-weight:700;color:#D97706;letter-spacing:0.08em;text-transform:uppercase;">Now Live</span>
          </div>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          ${logoHtml}
        </td>
      </tr>
    </table>

    <h1 style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:26px;font-weight:800;color:#0F172A;text-align:center;margin:0 0 12px;letter-spacing:-0.02em;">
      ${toolName} Has Launched!
    </h1>
    <p style="font-size:15px;color:#475569;text-align:center;margin:0 0 28px;line-height:1.6;">
      ${toolTagline}
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${toolUrl}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#0F172A;font-weight:800;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;">Check It Out &rarr;</a>
        </td>
      </tr>
    </table>

    <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0;">
      You received this because you subscribed to launch notifications for ${toolName} on <a href="${APP_URL}" style="color:#F59E0B;text-decoration:none;font-weight:600;">LaudStack</a>.
    </p>
  `;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🚀 ${toolName} just launched on LaudStack!`,
      html: emailShell(body),
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
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "hello@laudstack.com";
  const topicLabels: Record<string, string> = {
    general: "General Inquiry",
    launch: "Launch / Update a Tool",
    trust: "Report a Listing or Review",
    partnership: "Partnership or Press",
    support: "Account Support",
  };
  const topicLabel = topicLabels[data.topic] || data.topic;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `[LaudStack Contact] ${topicLabel} — ${data.name}`,
      html: emailShell(`
        <div style="padding:32px 40px;">
          <h1 style="font-size:20px;font-weight:800;color:#0F172A;margin:0 0 24px;">New Contact Form Submission</h1>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#64748B;font-weight:600;width:100px;vertical-align:top;">Name</td>
              <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:500;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Email</td>
              <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:500;"><a href="mailto:${data.email}" style="color:#F59E0B;text-decoration:none;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#64748B;font-weight:600;vertical-align:top;">Topic</td>
              <td style="padding:8px 0;font-size:14px;color:#0F172A;font-weight:500;">${topicLabel}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:16px 20px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
            <p style="font-size:13px;color:#64748B;font-weight:600;margin:0 0 8px;">Message</p>
            <p style="font-size:14px;color:#0F172A;line-height:1.7;margin:0;white-space:pre-wrap;">${data.message}</p>
          </div>
        </div>
      `),
    });
    return true;
  } catch (err) {
    console.error("[Contact Email Error]", err);
    return false;
  }
}
