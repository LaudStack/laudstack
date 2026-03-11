/**
 * LinkedIn OAuth 2.0 Authentication
 *
 * Flow:
 *  1. GET /api/auth/linkedin          → redirect to LinkedIn authorization URL
 *  2. GET /api/auth/linkedin/callback → exchange code for token, fetch profile,
 *                                       upsert user, create session, redirect to /
 *
 * Profile data extracted:
 *  - First name, last name (from /v2/me with localizedFirstName / localizedLastName)
 *  - Email (from /v2/emailAddress)
 *  - Profile photo (from /v2/me with profilePicture)
 *  - Location: city, state, country (from /v2/me with location fields)
 */

import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import * as db from "./db";

const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_PROFILE_URL = "https://api.linkedin.com/v2/me";
const LINKEDIN_EMAIL_URL = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))";
const LINKEDIN_PHOTO_URL = "https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))";

// Scopes needed: openid, profile, email, w_member_social (optional)
// Using v2 API with r_liteprofile + r_emailaddress
const LINKEDIN_SCOPES = ["openid", "profile", "email"].join(" ");

function getLinkedInClientId(): string {
  return process.env.LINKEDIN_CLIENT_ID ?? "";
}

function getLinkedInClientSecret(): string {
  return process.env.LINKEDIN_CLIENT_SECRET ?? "";
}

function getLinkedInRedirectUri(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] ?? req.protocol ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:3000";
  return `${proto}://${host}/api/auth/linkedin/callback`;
}

/** Parse LinkedIn location string "City, State, Country" into parts */
function parseLocation(locationStr: string | undefined): { city: string | null; state: string | null; country: string | null } {
  if (!locationStr) return { city: null, state: null, country: null };
  const parts = locationStr.split(",").map(p => p.trim()).filter(Boolean);
  if (parts.length === 1) return { city: null, state: null, country: parts[0] };
  if (parts.length === 2) return { city: parts[0], state: null, country: parts[1] };
  return { city: parts[0], state: parts[1], country: parts[2] };
}

/** Extract the largest available profile photo URL from LinkedIn API response */
function extractProfilePhoto(profileData: Record<string, unknown>): string | null {
  try {
    const pic = (profileData as any)?.profilePicture?.["displayImage~"]?.elements;
    if (!Array.isArray(pic) || pic.length === 0) return null;
    // Get the largest image (last element usually has highest resolution)
    const largest = pic[pic.length - 1];
    const identifiers = largest?.identifiers;
    if (!Array.isArray(identifiers) || identifiers.length === 0) return null;
    return identifiers[0]?.identifier ?? null;
  } catch {
    return null;
  }
}

export function registerLinkedInAuthRoutes(app: Express) {
  // ── Step 1: Redirect to LinkedIn ─────────────────────────────────────────
  app.get("/api/auth/linkedin", (req: Request, res: Response) => {
    const clientId = getLinkedInClientId();
    if (!clientId) {
      res.status(500).json({ error: "LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID." });
      return;
    }
    const redirectUri = getLinkedInRedirectUri(req);
    const state = Buffer.from(JSON.stringify({ ts: Date.now(), origin: redirectUri })).toString("base64url");

    const url = new URL(LINKEDIN_AUTH_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", LINKEDIN_SCOPES);

    res.redirect(302, url.toString());
  });

  // ── Step 2: Handle callback ───────────────────────────────────────────────
  app.get("/api/auth/linkedin/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const error = typeof req.query.error === "string" ? req.query.error : null;

    if (error) {
      console.error("[LinkedIn] OAuth error:", error, req.query.error_description);
      res.redirect(302, "/signin?error=linkedin_denied");
      return;
    }

    if (!code) {
      res.redirect(302, "/signin?error=linkedin_no_code");
      return;
    }

    const clientId = getLinkedInClientId();
    const clientSecret = getLinkedInClientSecret();
    const redirectUri = getLinkedInRedirectUri(req);

    if (!clientId || !clientSecret) {
      res.status(500).json({ error: "LinkedIn OAuth credentials not configured." });
      return;
    }

    try {
      // ── Exchange code for access token ──────────────────────────────────
      const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const tokenRes = await fetch(LINKEDIN_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenParams.toString(),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("[LinkedIn] Token exchange failed:", errText);
        res.redirect(302, "/signin?error=linkedin_token_failed");
        return;
      }

      const tokenData = await tokenRes.json() as { access_token: string; expires_in: number };
      const accessToken = tokenData.access_token;

      // ── Fetch profile data in parallel ──────────────────────────────────
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      };

      // Profile: id, localizedFirstName, localizedLastName, location, profilePicture
      const [profileRes, emailRes, photoRes] = await Promise.all([
        fetch(`${LINKEDIN_PROFILE_URL}?projection=(id,localizedFirstName,localizedLastName,location,headline,vanityName)`, { headers }),
        fetch(LINKEDIN_EMAIL_URL, { headers }),
        fetch(`${LINKEDIN_PHOTO_URL}`, { headers }),
      ]);

      if (!profileRes.ok) {
        console.error("[LinkedIn] Profile fetch failed:", await profileRes.text());
        res.redirect(302, "/signin?error=linkedin_profile_failed");
        return;
      }

      const profileData = await profileRes.json() as Record<string, unknown>;
      const emailData = emailRes.ok ? await emailRes.json() as Record<string, unknown> : null;
      const photoData = photoRes.ok ? await photoRes.json() as Record<string, unknown> : null;

      // ── Extract profile fields ───────────────────────────────────────────
      const linkedinId = String(profileData.id ?? "");
      const firstName = String(profileData.localizedFirstName ?? "").trim();
      const lastName = String(profileData.localizedLastName ?? "").trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || "LinkedIn User";
      const vanityName = typeof profileData.vanityName === "string" ? profileData.vanityName : null;

      // Location: LinkedIn returns { country: { code: "US" }, ... } or a string
      let city: string | null = null;
      let state: string | null = null;
      let country: string | null = null;

      const locationRaw = (profileData as any)?.location;
      if (typeof locationRaw === "string") {
        const parsed = parseLocation(locationRaw);
        city = parsed.city;
        state = parsed.state;
        country = parsed.country;
      } else if (locationRaw && typeof locationRaw === "object") {
        // LinkedIn v2 returns { country: { code: "US" }, ... }
        const countryCode = (locationRaw as any)?.country?.code ?? null;
        const regionCode = (locationRaw as any)?.region ?? null;
        country = countryCode;
        state = regionCode;
      }

      // Email: elements[0].handle~.emailAddress
      let email: string | null = null;
      try {
        const elements = (emailData as any)?.elements;
        if (Array.isArray(elements) && elements.length > 0) {
          email = elements[0]?.["handle~"]?.emailAddress ?? null;
        }
      } catch {
        email = null;
      }

      // Profile photo
      const avatarUrl = photoData ? extractProfilePhoto(photoData) : null;

      // LinkedIn profile URL
      const linkedinUrl = vanityName
        ? `https://www.linkedin.com/in/${vanityName}`
        : `https://www.linkedin.com/in/${linkedinId}`;

      // ── Upsert user in database ──────────────────────────────────────────
      // Use "linkedin:<id>" as the openId for LinkedIn users
      const openId = `linkedin:${linkedinId}`;

      await db.upsertUser({
        openId,
        name: fullName,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email ? email.toLowerCase().trim() : null,
        avatarUrl: avatarUrl ?? null,
        city: city ?? null,
        state: state ?? null,
        country: country ?? null,
        linkedinId,
        linkedinUrl,
        loginMethod: "linkedin",
        emailVerified: email ? true : false,
        lastSignedIn: new Date(),
      });

      console.log(`[LinkedIn] User authenticated: ${fullName} (${email ?? "no email"}) — ID: ${linkedinId}`);

      // ── Create session token ─────────────────────────────────────────────
      const sessionToken = await sdk.createSessionToken(openId, {
        name: fullName,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to dashboard or intended destination
      const redirectTo = (req.query.redirect as string) ?? "/dashboard";
      res.redirect(302, redirectTo);
    } catch (error) {
      console.error("[LinkedIn] Callback error:", error);
      res.redirect(302, "/signin?error=linkedin_failed");
    }
  });
}
