import { describe, expect, it } from "vitest";
import { formatFcfa } from "./etats";

// Constantes construites explicitement (pas de caractère spécial tapé en
// dur ici) pour éviter toute ambiguïté avec l'espace fine insécable
// (U+202F) que ce test vérifie justement l'absence.
const ESPACE_FINE_INSECABLE = String.fromCharCode(0x202f);
const ESPACE_INSECABLE = String.fromCharCode(0x00a0);

describe("formatFcfa", () => {
  it("sépare les milliers par une espace normale (pas l'espace insécable de Intl)", () => {
    const resultat = formatFcfa(450000);
    expect(resultat).toBe("450 000 FCFA");
    // Regression : Intl.NumberFormat("fr-FR") utilise U+202F par défaut,
    // invisible dans les polices PDF de base — on vérifie ici qu'aucun
    // caractère espace non-standard ne subsiste.
    expect(resultat.includes(ESPACE_FINE_INSECABLE)).toBe(false);
    expect(resultat.includes(ESPACE_INSECABLE)).toBe(false);
  });

  it("gère les petits montants sans séparateur", () => {
    expect(formatFcfa(500)).toBe("500 FCFA");
  });

  it("affiche un tiret pour null ou undefined", () => {
    expect(formatFcfa(null)).toBe("—");
    expect(formatFcfa(undefined)).toBe("—");
  });

  it("gère zéro correctement", () => {
    expect(formatFcfa(0)).toBe("0 FCFA");
  });
});
