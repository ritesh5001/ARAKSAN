import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "araksan_admin";
const SESSION_HOURS = 12;
const SCRYPT = { N: 16384, r: 8, p: 1 } as const;

/** Format: scrypt:<salt>:<hash>, both base64url. Uses ":" because Next's .env loader expands "$". */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize("NFKC"), salt, 64, SCRYPT);
  return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password.normalize("NFKC"), Buffer.from(salt, "base64url"), expected.length, SCRYPT);
  return timingSafeEqual(actual, expected);
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);
}

export function totpRequired(): boolean {
  return Boolean(process.env.ADMIN_TOTP_SECRET);
}

function sign(value: string): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(value).digest("base64url");
}

export async function createSession() {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const value = `${expires}.${sign(`admin:${expires}`)}`;
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** True when the request carries a valid, unexpired admin session cookie. */
export async function isAuthenticated(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(`admin:${expires}`));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
