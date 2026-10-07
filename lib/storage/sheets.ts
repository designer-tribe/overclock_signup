import crypto from "node:crypto";
import type { SignupStore } from "./types";
import type { SignupRecord } from "@/lib/schema";

/**
 * Google Sheets adapter.
 *
 * Talks to the Sheets REST API directly and mints its own service-account token,
 * so there is no `googleapis` dependency to carry (that package is large and
 * pulls in a lot for one append call).
 *
 * NOTE: this has never been run against real credentials — the destination was
 * still undecided when it was written. Treat the first live run as a test.
 *
 * Setup:
 *   1. Google Cloud console → enable the Google Sheets API.
 *   2. Create a service account, then a JSON key for it.
 *   3. Share the target spreadsheet with the service account's email (Editor).
 *   4. Set the env vars below (in Vercel: Project → Settings → Environment Variables).
 *
 *   SIGNUP_STORAGE=sheets
 *   GOOGLE_SHEETS_ID=<the id in the spreadsheet URL>
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL=<...@<project>.iam.gserviceaccount.com>
 *   GOOGLE_PRIVATE_KEY=<the private_key field, newlines escaped as \n>
 *   GOOGLE_SHEETS_RANGE=Signups!A:G   (optional, this is the default)
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[signup] ${key} is not set — the Google Sheets adapter cannot run without it.`,
    );
  }
  return value;
}

/** Cached across invocations on a warm serverless instance. */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Refresh a minute early so a token never expires mid-request.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const clientEmail = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  // Vercel's env UI stores the key on one line, so the newlines arrive escaped.
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 3600;

  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: expiresAt,
    }),
  );
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const signature = base64url(
    crypto.createSign("RSA-SHA256").update(`${header}.${payload}`).sign(privateKey),
  );
  const assertion = `${header}.${payload}.${signature}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `[signup] Google token exchange failed (${response.status}): ${await response.text()}`,
    );
  }

  const token = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
  return cachedToken.value;
}

/** Column order must match the sheet's header row. */
function toRow(record: SignupRecord): string[] {
  return [
    record.submittedAt,
    record.name,
    record.email,
    record.company ?? "",
    record.preferredDate,
    record.preferredSlot,
    record.notes ?? "",
  ];
}

export const sheetsStore: SignupStore = {
  name: "sheets",
  async save(record) {
    const spreadsheetId = requireEnv("GOOGLE_SHEETS_ID");
    const range = process.env.GOOGLE_SHEETS_RANGE ?? "Signups!A:G";
    const accessToken = await getAccessToken();

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
      `/values/${encodeURIComponent(range)}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [toRow(record)] }),
    });

    if (!response.ok) {
      throw new Error(
        `[signup] Sheets append failed (${response.status}): ${await response.text()}`,
      );
    }
  },
};
