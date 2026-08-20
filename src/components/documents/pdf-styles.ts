import path from "node:path";
import { readFileSync } from "node:fs";
import { Font, StyleSheet } from "@react-pdf/renderer";

// Fraunces (italic, semi-gras) pour la signature "Le Foyer" en pied de
// page — même police d'affichage que le reste de l'app (voir globals.css),
// mais react-pdf ne peut pas lire les fontes chargées via next/font : on
// enregistre le fichier local séparément pour le rendu PDF.
Font.register({
  family: "Fraunces",
  src: path.join(process.cwd(), "src/assets/fonts/Fraunces-Italic-SemiBold.woff"),
  fontStyle: "italic",
  fontWeight: 600,
});

// react-pdf's <Image src="..."> traite une chaîne comme une URL à fetch, y
// compris pour un chemin local (échec silencieux en environnement serverless) ;
// on lit le fichier nous-mêmes et on lui passe une data URI, ce qui contourne
// complètement sa résolution d'URL.
const logoBuffer = readFileSync(path.join(process.cwd(), "public/icons/icon-192.png"));
export const LOGO_SRC = `data:image/png;base64,${logoBuffer.toString("base64")}`;

export const pdfStyles = StyleSheet.create({
  page: { padding: 32, paddingBottom: 64, fontSize: 11, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 6 },
  title: { fontSize: 18 },
  subtitle: { fontSize: 11, color: "#6B645A", marginTop: 2 },
  meta: { fontSize: 10, color: "#6B645A", textAlign: "right" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE6D3",
  },
  label: { color: "#2B2118" },
  value: { fontFamily: "Helvetica-Bold" },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2B2118",
  },
  totalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#B23A1C" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#EFE6D3",
    paddingTop: 8,
  },
  footerText: { fontSize: 9, color: "#6B645A" },
  signature: { fontFamily: "Fraunces", fontStyle: "italic", fontSize: 13, color: "#1A1714" },
});
