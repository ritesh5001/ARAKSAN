#!/usr/bin/env node
// Builds the ARAKSAN wordmark as outlined SVG paths (no font needed to display it).
//
//   npm run brand:wordmark
//
// Writes brand/wordmark-<variant>-<colourway>.svg, brand/wordmark-preview.png
// and src/app/icon.svg.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const fontDir = path.join(root, "node_modules/@fontsource/cormorant-garamond/files");
const outDir = path.join(root, "brand");

const COLOURS = {
  ivory: "#F6F2EA",
  charcoal: "#2B2B2B",
  bronze: "#8C6A3F",
  bronzeOnDark: "#C9A97C",
};

const loadFont = async (weight) => {
  const file = await readFile(path.join(fontDir, `cormorant-garamond-latin-${weight}-normal.woff`));
  return opentype.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
};

// opentype.js 2.0's toPathData() occasionally prints NaN; serialise commands directly.
const n = (v) => String(Math.round(v * 100) / 100);
function pathData(p) {
  return p.commands
    .map((c) => {
      if (c.type === "M" || c.type === "L") return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === "C") return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      return "Z";
    })
    .join("");
}

/** Outline `text` with extra tracking (in em). Returns path data and its bounding box. */
function setText(font, text, size, tracking, x = 0, baseline = 0) {
  const scale = size / font.unitsPerEm;
  let cursor = x;
  const glyphs = font.stringToGlyphs(text);
  const parts = [];
  glyphs.forEach((glyph, i) => {
    const p = glyph.getPath(cursor, baseline, size);
    parts.push(pathData(p));
    cursor += glyph.advanceWidth * scale;
    if (i < glyphs.length - 1) {
      const kern = font.getKerningValue(glyph, glyphs[i + 1]);
      cursor += (Number.isFinite(kern) ? kern : 0) * scale + tracking * size;
    }
  });
  const bb = font.getPath(text, 0, 0, size).getBoundingBox(); // vertical extent only
  return { d: parts.join(""), width: cursor - x, top: baseline + bb.y1, bottom: baseline + bb.y2 };
}

const svg = (width, height, body, background) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Araksan">` +
  (background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : "") +
  body +
  `</svg>\n`;

const medium = await loadFont(500);
const light = await loadFont(300);
await mkdir(outDir, { recursive: true });

const PAD_X = 96;
const PAD_Y = 80;
const SIZE = 120;

const variants = {
  // A: the wordmark alone, generously tracked.
  classic: (fg) => {
    const word = setText(medium, "ARAKSAN", SIZE, 0.34, PAD_X, PAD_Y + SIZE * 0.66);
    const w = word.width + PAD_X * 2;
    const h = word.bottom + PAD_Y;
    return { w, h, body: `<path fill="${fg}" d="${word.d}"/>` };
  },
  // B: with one thin bronze rule beneath, centred.
  ruled: (fg, accent) => {
    const word = setText(medium, "ARAKSAN", SIZE, 0.34, PAD_X, PAD_Y + SIZE * 0.66);
    const w = word.width + PAD_X * 2;
    const ruleW = word.width * 0.18;
    const ruleY = word.bottom + 34;
    const h = ruleY + PAD_Y;
    return {
      w,
      h,
      body:
        `<path fill="${fg}" d="${word.d}"/>` +
        `<rect x="${(w - ruleW) / 2}" y="${ruleY}" width="${ruleW}" height="2" fill="${accent}"/>`,
    };
  },
  // C: light weight with the full name set small beneath, as a spacing cue.
  signature: (fg, accent) => {
    const word = setText(light, "ARAKSAN", SIZE, 0.36);
    const sub = setText(medium, "IDRISS OMAR", SIZE * 0.2, 0.62);
    const w = word.width + PAD_X * 2;
    const wordBase = PAD_Y + SIZE * 0.66;
    const subBase = wordBase + 64;
    const placedWord = setText(light, "ARAKSAN", SIZE, 0.36, PAD_X, wordBase);
    const placedSub = setText(medium, "IDRISS OMAR", SIZE * 0.2, 0.62, (w - sub.width) / 2, subBase);
    const ruleW = 40;
    const h = subBase + PAD_Y;
    return {
      w,
      h,
      body:
        `<path fill="${fg}" d="${placedWord.d}"/>` +
        `<rect x="${PAD_X}" y="${subBase - 7}" width="${ruleW}" height="1.5" fill="${accent}"/>` +
        `<rect x="${w - PAD_X - ruleW}" y="${subBase - 7}" width="${ruleW}" height="1.5" fill="${accent}"/>` +
        `<path fill="${fg}" d="${placedSub.d}"/>`,
    };
  },
};

const colourways = {
  "charcoal-on-ivory": { fg: COLOURS.charcoal, bg: COLOURS.ivory, accent: COLOURS.bronze },
  "ivory-on-charcoal": { fg: COLOURS.ivory, bg: COLOURS.charcoal, accent: COLOURS.bronzeOnDark },
};

const previews = [];
for (const [variant, build] of Object.entries(variants)) {
  for (const [name, c] of Object.entries(colourways)) {
    const { w, h, body } = build(c.fg, c.accent);
    const W = Math.round(w);
    const H = Math.round(h);
    await writeFile(path.join(outDir, `wordmark-${variant}-${name}.svg`), svg(W, H, body, c.bg));
    // Transparent version for placing on photography or other grounds.
    await writeFile(path.join(outDir, `wordmark-${variant}-${name.split("-on-")[0]}-transparent.svg`), svg(W, H, body));
    previews.push({ file: svg(W, H, body, c.bg), W, H });
  }
}

// Favicon: a single serif A.
const ax = (64 - setText(medium, "A", 44, 0).width) / 2;
const icon = setText(medium, "A", 44, 0, ax, 47);
await writeFile(
  path.join(root, "src/app/icon.svg"),
  svg(64, 64, `<path fill="${COLOURS.ivory}" d="${icon.d}"/><rect x="22" y="54" width="20" height="1.5" fill="${COLOURS.bronzeOnDark}"/>`, COLOURS.charcoal),
);

// Contact sheet: 3 variants × 2 colourways.
const cellW = 1200;
const cellH = 420;
const composites = await Promise.all(
  previews.map(async (p, i) => {
    const scale = Math.min((cellW - 80) / p.W, (cellH - 60) / p.H);
    const png = await sharp(Buffer.from(p.file), { density: 72 * scale })
      .resize({ width: Math.round(p.W * scale) })
      .png()
      .toBuffer();
    const meta = await sharp(png).metadata();
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bg = col === 0 ? COLOURS.ivory : COLOURS.charcoal;
    const cell = await sharp({ create: { width: cellW, height: cellH, channels: 3, background: bg } })
      .composite([{ input: png, left: Math.round((cellW - meta.width) / 2), top: Math.round((cellH - meta.height) / 2) }])
      .png()
      .toBuffer();
    return { input: cell, left: col * cellW, top: row * cellH };
  }),
);
await sharp({ create: { width: cellW * 2, height: cellH * 3, channels: 3, background: COLOURS.ivory } })
  .composite(composites)
  .png()
  .toFile(path.join(outDir, "wordmark-preview.png"));

console.log(`Wrote ${previews.length * 2} SVGs, a preview sheet and src/app/icon.svg`);
