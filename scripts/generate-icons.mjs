import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");

const GRADIENT = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0284c7"/>
    <stop offset="100%" stop-color="#84cc16"/>
  </linearGradient>`;

// Lucide "zap" polygon in a 24x24 viewBox: (13,2)(3,14)(12,14)(11,22)(21,10)(12,10)
const BOLT = `<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" fill="#ffffff"/>`;

function iconSvg({ maskable = false, scale }) {
  const rx = maskable ? 0 : 112;
  const rect = maskable
    ? `<rect width="512" height="512" fill="url(#g)"/>`
    : `<rect x="16" y="16" width="480" height="480" rx="${rx}" fill="url(#g)"/>`;
  const offset = 256 - 12 * scale;
  const bolt = `<g transform="translate(${offset} ${offset}) scale(${scale})">${BOLT}</g>`;
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${GRADIENT}</defs>
  ${rect}
  ${bolt}
</svg>`;
}

async function render(svg, file, size) {
  const png = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  writeFileSync(join(outDir, file), png);
  console.log(`generated public/${file}`);
}

mkdirSync(outDir, { recursive: true });

await render(iconSvg({ scale: 13 }), "icon-512.png", 512);
await render(iconSvg({ scale: 13 }), "icon-192.png", 192);
await render(iconSvg({ maskable: true, scale: 9.5 }), "icon-maskable.png", 512);
