import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { plain } from "@/components/RichText";
import { getContent } from "@/lib/content";
import { hasLocale, t } from "@/lib/i18n";

export const alt = "Araksan Idriss Omar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/cormorant-garamond/files");

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  const { home } = await getContent();

  const [light, medium] = await Promise.all([
    readFile(join(fontDir, "cormorant-garamond-latin-300-normal.woff")),
    readFile(join(fontDir, "cormorant-garamond-latin-500-normal.woff")),
  ]);

  let portrait: string | null = null;
  if (home.portrait.src.startsWith("/images/")) {
    const file = await readFile(join(process.cwd(), "public", home.portrait.src)).catch(() => null);
    if (file) portrait = `data:image/jpeg;base64,${file.toString("base64")}`;
  }

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f6f2ea", color: "#2b2b2b" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", flex: 1 }}>
          <div style={{ display: "flex", fontFamily: "Cormorant", fontWeight: 500, fontSize: 34, letterSpacing: "0.34em" }}>
            ARAKSAN
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 64, height: 1, background: "#8c6a3f", marginBottom: 36 }} />
            <div style={{ fontFamily: "Cormorant", fontWeight: 300, fontSize: 76, lineHeight: 1.04, maxWidth: 620 }}>
              {plain(t(home.headline, locale))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Cormorant", fontWeight: 500, color: "#5e5a54" }}>
            <div style={{ fontSize: 30, color: "#2b2b2b" }}>{home.name}</div>
            <div style={{ fontSize: 22, marginTop: 6, letterSpacing: "0.04em" }}>{t(home.roles, locale)}</div>
          </div>
        </div>
        {portrait && (
          <img src={portrait} alt="" width={420} height={630} style={{ objectFit: "cover", objectPosition: "88% 30%" }} />
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: light, weight: 300, style: "normal" },
        { name: "Cormorant", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
