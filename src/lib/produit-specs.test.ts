import { describe, expect, it } from "vitest";
import { formatSpecsMarmite } from "./produit-specs";

describe("formatSpecsMarmite", () => {
  it("combine les mesures renseignées séparées par des points médians", () => {
    const resultat = formatSpecsMarmite({
      contenance_litres: 10,
      diametre_cm: 28,
      hauteur_cm: 20,
      poids_kg: 3.2,
    });
    expect(resultat).toBe("10 L · Ø 28 cm · H 20 cm · 3.2 kg");
  });

  it("omet les mesures manquantes sans laisser de séparateur vide", () => {
    const resultat = formatSpecsMarmite({
      contenance_litres: 5,
      diametre_cm: null,
      hauteur_cm: null,
      poids_kg: 2,
    });
    expect(resultat).toBe("5 L · 2 kg");
  });

  it("retourne une chaîne vide si rien n'est renseigné", () => {
    const resultat = formatSpecsMarmite({
      contenance_litres: null,
      diametre_cm: null,
      hauteur_cm: null,
      poids_kg: null,
    });
    expect(resultat).toBe("");
  });
});
