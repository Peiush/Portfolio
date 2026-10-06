// Renders favicon PNGs, apple-touch icon, PWA icons and the 1200x630 OG card from SVG.
// Run: node scripts/gen-brand-assets.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const out = (f) => new URL(`../public/${f}`, import.meta.url);

const mark = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}"><rect width="32" height="32" fill="#09090b"/><text x="16" y="23" font-size="20" font-weight="900" text-anchor="middle" fill="#fde047" font-family="Helvetica, Arial, sans-serif">P</text></svg>`;

for (const [file, size] of [["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  await sharp(Buffer.from(mark(size))).resize(size, size).png().toFile(out(file).pathname);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="2"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="#09090b"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="-60" y="470" width="1320" height="44" fill="#DC2626" opacity=".75" transform="rotate(-4 600 492)"/>
  <rect x="-60" y="530" width="1320" height="44" fill="#a855f7" opacity=".75" transform="rotate(2 600 552)"/>
  <rect x="86" y="86" width="560" height="42" fill="#000" stroke="#fde047" stroke-width="3"/>
  <text x="108" y="114" font-family="Courier New, monospace" font-size="20" font-weight="700" fill="#fde047" letter-spacing="5">PORTFOLIO // 2026</text>
  <rect x="86" y="170" width="900" height="170" fill="#fff" stroke="#000" stroke-width="6"/>
  <rect x="98" y="182" width="900" height="170" fill="#000" opacity=".9" transform="translate(0 0)"/>
  <rect x="86" y="170" width="900" height="170" fill="#fde047" stroke="#000" stroke-width="6"/>
  <text x="120" y="290" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="900" fill="#000" letter-spacing="-4">PIYUSH</text>
  <text x="90" y="400" font-family="Helvetica, Arial, sans-serif" font-size="44" font-weight="800" fill="#fafafa">Creative Full-Stack Developer</text>
  <text x="90" y="445" font-family="Courier New, monospace" font-size="24" fill="#a1a1aa">React · Next.js · Node · TypeScript · PostgreSQL</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(out("images/assets/og-image.png").pathname);

await writeFile(out("site.webmanifest"), JSON.stringify({
  name: "Piyush — Creative Full-Stack Developer",
  short_name: "Piyush",
  start_url: "/",
  display: "standalone",
  background_color: "#09090b",
  theme_color: "#09090b",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
}, null, 2) + "\n");
console.log("brand assets written");
