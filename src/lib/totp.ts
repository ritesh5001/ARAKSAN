import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Buffer {
  const clean = input.replace(/[\s=-]/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function codeAt(key: Buffer, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 1_000_000).padStart(6, "0");
}

/** RFC 6238 six-digit code, 30-second step, accepting one step of clock drift either way. */
export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  const given = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(given)) return false;
  const key = base32Decode(secret);
  const step = Math.floor(now / 30_000);
  return [-1, 0, 1].some((drift) => timingSafeEqual(Buffer.from(codeAt(key, step + drift)), Buffer.from(given)));
}
