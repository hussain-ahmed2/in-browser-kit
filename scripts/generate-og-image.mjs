import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");

const WIDTH = 1200;
const HEIGHT = 630;

const AMP = "&" + "amp;";

function escapeXml(str) {
  return str
    .replace(/&/g, AMP)
    .replace(/%/g, "&#37;");
}

const GRADIENT = `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#0284c7"/>
  <stop offset="1" stop-color="#84cc16"/>
</linearGradient>`;

const BOLT = `<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>`;

async function generate() {
  const text1 = escapeXml("InBrowser");
  const text2 = escapeXml("Privacy-first file tools");
  const text3 = escapeXml("Compress images, merge PDFs, generate QR codes \u2014 all in your browser");
  const text4 = escapeXml("100% Client-Side");
  const text5 = escapeXml("No Uploads Ever");
  const text6 = escapeXml("Free & Open Source");

  const svg = `
    <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>${GRADIENT}</defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
      
      <g transform="translate(80, 140)">
        <g transform="scale(4)">
          ${BOLT}
        </g>
      </g>
      
      <text x="320" y="240" font-family="system-ui, sans-serif" font-size="64" font-weight="800" fill="white" text-anchor="start">${text1}</text>
      <text x="320" y="320" font-family="system-ui, sans-serif" font-size="28" font-weight="400" fill="rgba(255,255,255,0.9)" text-anchor="start">${text2}</text>
      <text x="320" y="370" font-family="system-ui, sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.7)" text-anchor="start">${text3}</text>
      
      <g transform="translate(80, 500)">
        <rect x="0" y="0" width="160" height="40" rx="8" fill="white" fill-opacity="0.2"/>
        <text x="80" y="28" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="white" text-anchor="middle">${text4}</text>
      </g>
      <g transform="translate(280, 500)">
        <rect x="0" y="0" width="180" height="40" rx="8" fill="white" fill-opacity="0.2"/>
        <text x="90" y="28" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="white" text-anchor="middle">${text5}</text>
      </g>
      <g transform="translate(500, 500)">
        <rect x="0" y="0" width="180" height="40" rx="8" fill="white" fill-opacity="0.2"/>
        <text x="90" y="28" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="white" text-anchor="middle">${text6}</text>
      </g>
    </svg>
  `;

  const png = await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT)
    .png()
    .toBuffer();

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "opengraph-image.png"), png);
  console.log(`Generated public/opengraph-image.png (${WIDTH}x${HEIGHT})`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});