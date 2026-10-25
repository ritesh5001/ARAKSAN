import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { listTemplates, seedContent, type SiteContent } from "./content-types";
import { backupDir, contentFile } from "./storage";

export const CONTENT_TAG = "site-content";
const MAX_BACKUPS = 30;
const MAX_STRING = 20_000;

/** Read the site content. Cached until the admin panel saves a change. */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);

  try {
    const raw = await fs.readFile(contentFile, "utf8");
    const parsed = JSON.parse(raw);
    return validateContent(parsed) ? parsed : seedContent;
  } catch {
    return seedContent;
  }
}

/** Write content atomically and keep a timestamped backup of the previous version. */
export async function writeContent(content: SiteContent, stamp: string) {
  await fs.mkdir(backupDir, { recursive: true });
  try {
    await fs.copyFile(contentFile, path.join(backupDir, `content-${stamp}.json`));
  } catch {
    // First save: nothing to back up yet.
  }
  const tmp = `${contentFile}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(content, null, 2), "utf8");
  await fs.rename(tmp, contentFile);

  const backups = (await fs.readdir(backupDir)).filter((f) => f.endsWith(".json")).sort();
  await Promise.all(
    backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS)).map((f) => fs.unlink(path.join(backupDir, f))),
  );
}

/**
 * Structural check against the seed: same keys, same value types, strings of
 * sane length. Stops a malformed save from taking the public site down.
 */
export function validateContent(value: unknown): value is SiteContent {
  return matches(seedContent, value, "");
}

function matches(template: unknown, value: unknown, at: string): boolean {
  if (typeof template === "string") return typeof value === "string" && value.length <= MAX_STRING;
  if (typeof template === "boolean") return typeof value === "boolean";
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length > 100) return false;
    const itemTemplate = listTemplates[at] ?? template[0];
    return itemTemplate !== undefined && value.every((item) => matches(itemTemplate, item, at));
  }
  if (template && typeof template === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const keys = Object.keys(template);
    if (Object.keys(value).length !== keys.length) return false;
    return keys.every((key) =>
      matches(
        (template as Record<string, unknown>)[key],
        (value as Record<string, unknown>)[key],
        at ? `${at}.${key}` : key,
      ),
    );
  }
  return false;
}
