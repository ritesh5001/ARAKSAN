#!/usr/bin/env node
// Builds the ARAG SAN Productions logo as clean, scalable SVG from the design
// Ms. Omar approved (assets-original/arag-san-productions-reference.jpg).
//
//   npm run brand:productions
//
// Lettering is outlined from fonts (no font needed to display it); the gold
// eye/horizon symbol is drawn from points measured on the reference.
// Writes brand/arag-san-productions-*.svg|png and public/brand/*.svg.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const font = async (pkg, file) => {
  const buf = await readFile(path.join(root, "node_modules/@fontsource", pkg, "files", file));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const serif = await font("cormorant-garamond", "cormorant-garamond-latin-400-normal.woff");
const italic = await font("cormorant-garamond", "cormorant-garamond-latin-400-italic.woff");
const sans = await font("jost", "jost-latin-400-normal.woff");

// Colours sampled from the reference.
const C = { charcoal: "#121212", ivory: "#F0E7D6", ink: "#2B2B2B", paper: "#F6F2EA" };

// ── Type ────────────────────────────────────────────────────────────────
const n = (v) => String(Math.round(v * 100) / 100);
const pathData = (commands) =>
  commands
    .map((c) => {
      if (c.type === "M" || c.type === "L") return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === "C") return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      return "Z";
    })
    .join("");

/** Outlines `text` at a size and tracking (em), from an origin on the baseline. */
function layout(f, text, size, tracking, x = 0, baseline = 0) {
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  const all = new opentype.Path();
  let cursor = x;
  glyphs.forEach((g, i) => {
    all.extend(g.getPath(cursor, baseline, size));
    cursor += g.advanceWidth * scale;
    if (i < glyphs.length - 1) {
      const kern = f.getKerningValue(g, glyphs[i + 1]);
      cursor += (Number.isFinite(kern) ? kern : 0) * scale + tracking * size;
    }
  });
  return { d: pathData(all.commands), box: all.getBoundingBox() };
}

/** Sizes and tracks `text` so its ink fills `box` exactly, as in the reference. */
function fit(f, text, box) {
  const unit = layout(f, text, 1, 0);
  const size = (box.y1 - box.y0) / (unit.box.y2 - unit.box.y1);
  const gaps = Math.max(1, [...text].length - 1);
  const natural = layout(f, text, size, 0).box;
  const tracking = (box.x1 - box.x0 - (natural.x2 - natural.x1)) / (gaps * size);
  const atOrigin = layout(f, text, size, tracking).box;
  return layout(f, text, size, tracking, box.x0 - atOrigin.x1, box.y0 - atOrigin.y1);
}

// ── Symbol ──────────────────────────────────────────────────────────────
/** Catmull-Rom curve through points, outlined with a tapering thickness. */
function taperedStroke(points, thickness, samples = 160) {
  const at = (t) => {
    const seg = Math.min(points.length - 2, Math.floor(t * (points.length - 1)));
    const u = t * (points.length - 1) - seg;
    const p0 = points[Math.max(0, seg - 1)];
    const [p1, p2] = [points[seg], points[seg + 1]];
    const p3 = points[Math.min(points.length - 1, seg + 2)];
    const c = (a, b, c2, d) =>
      0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
    return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
  };
  const left = [];
  const right = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const [x, y] = at(t);
    const [x2, y2] = at(Math.min(1, t + 1e-3));
    const [x0, y0] = at(Math.max(0, t - 1e-3));
    const len = Math.hypot(x2 - x0, y2 - y0) || 1;
    const [nx, ny] = [-(y2 - y0) / len, (x2 - x0) / len];
    const w = thickness(t) / 2;
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
  }
  const pts = [...left, ...right.reverse()];
  return `M${pts.map(([x, y]) => `${n(x)} ${n(y)}`).join("L")}Z`;
}

const upperArc = taperedStroke(
  [
    [846, 402], [855, 388], [870, 375], [885, 362], [900, 351], [915, 343], [930, 337],
    [945, 332], [960, 329], [975, 327], [995, 326], [1015, 327], [1038, 330],
  ],
  // A crescent: boldest in its left third, fine at both points.
  (t) => 9.5 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.7) * (1 - 0.4 * t),
);
const lowerArc = taperedStroke(
  [
    [843, 439], [870, 422], [900, 407], [920, 401], [945, 396], [970, 394], [995, 395],
    [1020, 399], [1040, 405], [1060, 415], [1080, 428], [1100, 444], [1112, 459],
  ],
  // Fine on the left, gathering weight toward the right end.
  (t) => (1 + 5 * t) * Math.pow(Math.sin(Math.PI * t), 0.3),
);

const SUN = { cx: 969.5, horizon: 404, r: 23 };
const symbol = (id) => `
  <path fill="url(#${id}-gold)" d="${upperArc}"/>
  <path fill="url(#${id}-gold)" d="${lowerArc}"/>
  <circle cx="${SUN.cx}" cy="${SUN.horizon - 4}" r="30" fill="url(#${id}-glow)"/>
  <path fill="url(#${id}-sun)" d="M${SUN.cx - SUN.r} ${SUN.horizon}A${SUN.r} ${SUN.r} 0 0 1 ${SUN.cx + SUN.r} ${SUN.horizon}Z"/>
  <rect x="${SUN.cx - 70}" y="${SUN.horizon - 0.8}" width="140" height="2" fill="url(#${id}-fade)"/>
  ${[
    [86, 410, 0.8],
    [70, 415, 0.62],
    [54, 420, 0.45],
    [36, 425, 0.3],
  ]
    .map(([w, y, o]) => `<rect x="${SUN.cx - w / 2}" y="${y}" width="${w}" height="1.5" fill="url(#${id}-fade)" opacity="${o}"/>`)
    .join("\n  ")}`;

const defs = (id) => `
  <defs>
    <linearGradient id="${id}-gold" x1="840" y1="0" x2="1115" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#B8925A"/>
      <stop offset="0.45" stop-color="#E8CB92"/>
      <stop offset="1" stop-color="#C9A266"/>
    </linearGradient>
    <radialGradient id="${id}-sun" cx="${SUN.cx}" cy="${SUN.horizon - 8}" r="${SUN.r * 1.2}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F1D9A4"/>
      <stop offset="1" stop-color="#C79E62"/>
    </radialGradient>
    <radialGradient id="${id}-glow" cx="${SUN.cx}" cy="${SUN.horizon}" r="46" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#E4C68D" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#E4C68D" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#D9B87F" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#E4C68D"/>
      <stop offset="1" stop-color="#D9B87F" stop-opacity="0"/>
    </linearGradient>
  </defs>`;

// ── Lockups ─────────────────────────────────────────────────────────────
const MARK = { x0: 299, x1: 1480 };
const CENTER = (MARK.x0 + MARK.x1) / 2;
const arag = fit(serif, "ARAG", { x0: 299, y0: 331, x1: 805, y1: 460 });
const san = fit(serif, "SAN", { x0: 1137, y0: 331, x1: 1480, y1: 460 });

/** `scale` enlarges PRODUCTIONS and the tagline (the compact, mobile lockup). */
function lockup(scale = 1) {
  const prodW = 615 * scale;
  const prodTop = 460 + 48 * Math.sqrt(scale);
  const production = fit(sans, "PRODUCTIONS", {
    x0: CENTER - prodW / 2,
    x1: CENTER + prodW / 2,
    y0: prodTop,
    y1: prodTop + 27 * scale,
  });
  const tagW = 399 * scale;
  const tagTop = prodTop + 27 * scale + 36 * Math.sqrt(scale);
  const tagline = fit(italic, "Seeing the beauty", {
    x0: CENTER - tagW / 2,
    x1: CENTER + tagW / 2,
    y0: tagTop,
    y1: tagTop + 43 * scale,
  });
  return { production, tagline, bottom: tagTop + 43 * scale };
}

function svg({ id, ink, background, box, scale = 1 }) {
  const { production, tagline } = lockup(scale);
  const [x, y, w, h] = box;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="ARAG SAN Productions — Seeing the beauty">` +
    defs(id) +
    (background ? `\n  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${background}"/>` : "") +
    `\n  <path fill="${ink}" d="${arag.d}"/>\n  <path fill="${ink}" d="${san.d}"/>` +
    symbol(id) +
    `\n  <path fill="${ink}" d="${production.d}"/>\n  <path fill="${ink}" d="${tagline.d}"/>\n</svg>\n`
  );
}

const PAD = 40;
const tight = (scale = 1) => {
  const bottom = lockup(scale).bottom;
  return [MARK.x0 - PAD, 326 - PAD, MARK.x1 - MARK.x0 + PAD * 2, bottom - 326 + PAD * 2];
};

const outputs = {
  "brand/arag-san-productions-on-charcoal.svg": svg({ id: "c", ink: C.ivory, background: C.charcoal, box: [0, 0, 1774, 887] }),
  "brand/arag-san-productions-ivory-transparent.svg": svg({ id: "t", ink: C.ivory, box: tight() }),
  "brand/arag-san-productions-on-ivory.svg": svg({ id: "i", ink: C.ink, background: C.paper, box: tight() }),
  "public/brand/arag-san-productions.svg": svg({ id: "w", ink: C.ivory, box: tight() }),
  "public/brand/arag-san-productions-compact.svg": svg({ id: "m", ink: C.ivory, box: tight(1.7), scale: 1.7 }),
};
await mkdir(path.join(root, "brand"), { recursive: true });
await mkdir(path.join(root, "public/brand"), { recursive: true });
for (const [file, content] of Object.entries(outputs)) await writeFile(path.join(root, file), content);

// PNG for email and social use, and a side-by-side check against the reference.
const charcoal = Buffer.from(outputs["brand/arag-san-productions-on-charcoal.svg"]);
await sharp(charcoal, { density: 144 }).png().toFile(path.join(root, "brand/arag-san-productions-on-charcoal@2x.png"));
const rebuilt = await sharp(charcoal).resize(887).png().toBuffer();
const reference = await sharp(path.join(root, "assets-original/arag-san-productions-reference.jpg")).resize(887).png().toBuffer();
await sharp({ create: { width: 887, height: 900, channels: 3, background: "#333" } })
  .composite([
    { input: reference, left: 0, top: 0 },
    { input: rebuilt, left: 0, top: 456 },
  ])
  .png()
  .toFile(path.join(root, "brand/arag-san-productions-compare.png"));

console.log(`Wrote ${Object.keys(outputs).length} SVGs, a 2x PNG and a comparison sheet.`);
