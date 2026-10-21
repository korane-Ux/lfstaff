import { describe, expect, it } from "vitest";
import { GUIDES, PARCOURS, guidesPour } from "./contenu";

const toutesLesQuestions = Object.values(GUIDES).flatMap((rubriques) => rubriques.flatMap((r) => r.questions));

// Tous les textes d'une question où le balisage [[ ]] / ** ** est autorisé.
function textes(q: (typeof toutesLesQuestions)[number]) {
  return [...q.etapes, q.resultat, q.astuce, q.attention].filter((t): t is string => !!t);
}

describe("contenu de l'aide", () => {
  it("donne un identifiant unique à chaque question (liens directs /aide#id)", () => {
    const ids = toutesLesQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("donne un identifiant unique à chaque rubrique", () => {
    const ids = Object.values(GUIDES).flatMap((rubriques) => rubriques.map((r) => r.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ferme toujours les boutons [[ ]] et le gras ** **", () => {
    for (const q of toutesLesQuestions) {
      for (const t of textes(q)) {
        expect(t.split("[[").length, `${q.id} : « ${t} »`).toBe(t.split("]]").length);
        expect((t.match(/\*\*/g) ?? []).length % 2, `${q.id} : « ${t} »`).toBe(0);
      }
    }
  });

  it("a au moins une étape par question et des liens internes", () => {
    for (const q of toutesLesQuestions) {
      expect(q.etapes.length, q.id).toBeGreaterThan(0);
      if (q.lien) expect(q.lien.href.startsWith("/"), q.id).toBe(true);
    }
  });

  it("montre à chaque rôle son guide et les bases communes", () => {
    expect(guidesPour("livreur")).toEqual(["livreur", "commun"]);
    expect(guidesPour("fournisseur")).toEqual(["fournisseur", "commun"]);
    expect(guidesPour("gestionnaire")).toEqual(["gestionnaire", "commun"]);
    expect(guidesPour("super_admin")).toContain("admin");
    expect(guidesPour("gestionnaire")).not.toContain("admin");
  });

  it("attribue chaque étape du parcours à un rôle qui a un guide", () => {
    for (const etape of PARCOURS) expect(GUIDES[etape.acteur].length, etape.etat).toBeGreaterThan(0);
  });
});
