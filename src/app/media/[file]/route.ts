import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "@/lib/storage";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png" };

/** Serves images uploaded through the admin panel from persistent storage. */
export async function GET(_request: Request, { params }: RouteContext<"/media/[file]">) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.(jpg|webp|png)$/.test(file)) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(uploadDir, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[path.extname(file)],
        // Upload names are unique, so the file at a URL never changes.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
