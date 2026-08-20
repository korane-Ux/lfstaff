import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, "..", "design", "references", "lfstaff-logo-source.jpg");
const outDir = path.join(root, "..", "public", "icons");
const appDir = path.join(root, "..", "src", "app");

mkdirSync(outDir, { recursive: true });

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(src)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`icon-${size}.png`);
}

// Apple touch icon (Next.js picks up src/app/apple-icon.png automatically)
await sharp(src)
  .resize(180, 180)
  .png()
  .toFile(path.join(appDir, "apple-icon.png"));
console.log("src/app/apple-icon.png");

// Favicon (Next.js picks up src/app/icon.png automatically)
await sharp(src)
  .resize(48, 48)
  .png()
  .toFile(path.join(appDir, "icon.png"));
console.log("src/app/icon.png");

console.log("Icônes générées.");
