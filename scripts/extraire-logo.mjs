// Découpe la flamme du logo (crème) hors de son carré dégradé orange, pour
// l'afficher sans fond dans l'app. Sortie : un masque blanc sur fond
// transparent (public/icons/logo-marque.png), recoloré en CSS (mask-image) — la
// même image sert alors en braise sur fond clair comme sur fond sombre.
//
// Usage : node scripts/extraire-logo.mjs
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const racine = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(racine, "design", "references", "lfstaff-logo-source.jpg");
const sortie = path.join(racine, "public", "icons", "logo-marque.png");

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: l, height: h } = info;

// Le crème a un canal vert élevé (~230), l'orange un vert bas (~60-110) :
// on en tire une opacité progressive, qui garde des bords lissés.
const VERT_FOND = 135;
const VERT_MARQUE = 205;
// On ne cherche la flamme qu'au centre : les coins de l'image sont blancs
// (hors du carré arrondi) et le coin bas-droit porte une petite étoile en
// filigrane laissée par le générateur d'images.
const dansZoneFlamme = (x, y) => x > l * 0.2 && x < l * 0.8 && y > h * 0.12 && y < h * 0.88;

const alpha = Buffer.alloc(l * h);
let [minX, minY, maxX, maxY] = [l, h, 0, 0];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < l; x++) {
    const i = y * l + x;
    const vert = data[i * 3 + 1];
    const a = Math.round(Math.min(1, Math.max(0, (vert - VERT_FOND) / (VERT_MARQUE - VERT_FOND))) * 255);
    alpha[i] = dansZoneFlamme(x, y) ? a : 0;
    if (alpha[i] > 128) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const marge = 8;
const zone = {
  left: Math.max(0, minX - marge),
  top: Math.max(0, minY - marge),
  width: Math.min(l, maxX + marge) - Math.max(0, minX - marge),
  height: Math.min(h, maxY + marge) - Math.max(0, minY - marge),
};

// Blanc + alpha : la couleur finale vient du CSS.
const rgba = Buffer.alloc(l * h * 4, 255);
for (let i = 0; i < l * h; i++) rgba[i * 4 + 3] = alpha[i];

await sharp(rgba, { raw: { width: l, height: h, channels: 4 } })
  .extract(zone)
  .resize({ height: 256 })
  .png()
  .toFile(sortie);

console.log(`logo-marque.png : zone ${zone.width}x${zone.height} depuis (${zone.left},${zone.top})`);
