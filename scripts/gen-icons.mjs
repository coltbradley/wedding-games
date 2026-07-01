import sharp from "sharp";
import { mkdirSync } from "node:fs";

const OUT = "/Users/coltbradley/Documents/code/wedding-games/public/icons";
mkdirSync(OUT, { recursive: true });

// V & C monogram on watercolour paper — mirrors the app's bloom motif.
// pad: extra breathing room for maskable (safe zone = inner 80%).
const svg = (pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" fill="#FBF7F0"/>
  <defs>
    <radialGradient id="a" cx="42%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#F39E65" stop-opacity=".42"/>
      <stop offset="100%" stop-color="#F39E65" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="62%" cy="62%" r="55%">
      <stop offset="0%" stop-color="#8A9A7B" stop-opacity=".38"/>
      <stop offset="100%" stop-color="#8A9A7B" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="c" cx="38%" cy="66%" r="48%">
      <stop offset="0%" stop-color="#6E2C3E" stop-opacity=".20"/>
      <stop offset="100%" stop-color="#6E2C3E" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#a)"/>
  <rect width="512" height="512" fill="url(#b)"/>
  <rect width="512" height="512" fill="url(#c)"/>
  <g transform="translate(256 256) scale(${1 - pad}) translate(-256 -256)">
    <text x="256" y="238" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-size="196"
      font-weight="500" fill="#6E2C3E">V<tspan fill="#A8927A" font-style="italic" font-size="130" dy="-8"> &amp; </tspan><tspan dy="8">C</tspan></text>
    <text x="256" y="352" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-style="italic"
      font-size="46" fill="#2A2D32">05 · 08 · 26</text>
  </g>
</svg>`;

const flat = Buffer.from(svg(0));
const mask = Buffer.from(svg(0.14));

await sharp(flat).resize(512, 512).png().toFile(`${OUT}/icon-512.png`);
await sharp(flat).resize(192, 192).png().toFile(`${OUT}/icon-192.png`);
await sharp(flat).resize(180, 180).png().toFile(`${OUT}/apple-touch-icon.png`);
await sharp(mask).resize(512, 512).png().toFile(`${OUT}/icon-maskable-512.png`);
console.log("icons written");
