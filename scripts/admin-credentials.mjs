#!/usr/bin/env node
// Generates admin credentials for .env.local or the host's environment settings.
//
//   npm run admin:credentials -- "a long passphrase"          password + session secret
//   npm run admin:credentials -- "a long passphrase" --totp   also a two-step sign-in secret
//
// The password itself is never stored, only its scrypt hash.
import { randomBytes, scryptSync } from "node:crypto";

const [password, flag] = process.argv.slice(2);
if (!password || password.length < 12) {
  console.error('Usage: npm run admin:credentials -- "<password of 12+ characters>" [--totp]');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1 });

console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);

if (flag === "--totp") {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const secret = Array.from(randomBytes(20), (b) => alphabet[b % 32]).join("");
  console.log(`ADMIN_TOTP_SECRET=${secret}`);
  console.error(
    `\nAdd to an authenticator app (Google Authenticator, 1Password, etc.):\n` +
      `otpauth://totp/ARAKSAN:admin?secret=${secret}&issuer=ARAKSAN`,
  );
}
