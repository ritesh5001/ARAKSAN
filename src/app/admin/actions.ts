"use server";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import {
  adminConfigured,
  createSession,
  destroySession,
  isAuthenticated,
  totpRequired,
  verifyPassword,
} from "@/lib/auth";
import { CONTENT_TAG, validateContent, writeContent } from "@/lib/content";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { uploadDir } from "@/lib/storage";
import { verifyTotp } from "@/lib/totp";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, data: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: "The admin panel is not configured yet." };
  if (!rateLimit(`login:${await clientIp()}`, 5, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const password = String(data.get("password") ?? "");
  const code = String(data.get("code") ?? "");
  const passwordOk = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!);
  const codeOk = !totpRequired() || verifyTotp(process.env.ADMIN_TOTP_SECRET!, code);
  if (!passwordOk || !codeOk) {
    return { error: totpRequired() ? "Incorrect password or code." : "Incorrect password." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export type SaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function saveContent(json: string): Promise<SaveResult> {
  if (!(await isAuthenticated())) return { ok: false, error: "Your session has expired. Please sign in again." };

  let content: unknown;
  try {
    content = JSON.parse(json);
  } catch {
    return { ok: false, error: "The content could not be read." };
  }
  if (!validateContent(content)) {
    return { ok: false, error: "Some content is in an unexpected format or too long. Nothing was saved." };
  }

  const slugs = content.perspectives.essays.map((e) => e.slug);
  if (slugs.some((s) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))) {
    return { ok: false, error: "Each essay needs a web address of lowercase letters, numbers and hyphens." };
  }
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "Two essays share the same web address." };
  }

  const now = new Date();
  await writeContent(content, now.toISOString().replace(/[:.]/g, "-"));
  updateTag(CONTENT_TAG);
  return { ok: true, savedAt: now.toISOString() };
}

export type UploadResult = { ok: true; src: string } | { ok: false; error: string };

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Stores an uploaded image, auto-rotated and resized to 2400px on the long edge. */
export async function uploadImage(data: FormData): Promise<UploadResult> {
  if (!(await isAuthenticated())) return { ok: false, error: "Your session has expired. Please sign in again." };

  const file = data.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please choose an image." };
  if (!ACCEPTED.includes(file.type)) return { ok: false, error: "Please upload a JPEG, PNG or WebP image." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Images must be under 15 MB." };

  const base =
    path
      .parse(file.name)
      .name.toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image";
  const name = `${base}-${randomBytes(4).toString("hex")}.jpg`;

  try {
    const output = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#f6f2ea" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, name), output);
  } catch {
    return { ok: false, error: "That file could not be processed as an image." };
  }

  return { ok: true, src: `/media/${name}` };
}
