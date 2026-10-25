import "server-only";
import { headers } from "next/headers";

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

/**
 * Small in-memory sliding-window limiter. Enough for a single-instance
 * personal site; swap for a shared store if the site runs on several instances.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((at) => now - at < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);

  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.hits.every((at) => now - at >= windowMs)) buckets.delete(k);
  }
  return true;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
