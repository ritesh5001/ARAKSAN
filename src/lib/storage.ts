import "server-only";
import path from "node:path";

// All editable data lives outside the build: content JSON, backups and
// uploaded images. Point STORAGE_DIR at a persistent volume in production.
// The ignore comment stops the build tracing the whole project: storage is
// runtime data, never part of the server bundle.
export const storageDir = path.resolve(/*turbopackIgnore: true*/ process.env.STORAGE_DIR || "storage");
export const contentFile = path.join(storageDir, "content.json");
export const backupDir = path.join(storageDir, "backups");
export const uploadDir = path.join(storageDir, "uploads");
