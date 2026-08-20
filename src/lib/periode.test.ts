import { describe, expect, it } from "vitest";
import { calculerPeriode } from "./periode";

describe("calculerPeriode", () => {
  it("jour : début et fin sont la même date", () => {
    const instant = new Date("2026-08-20T10:00:00Z");
    const { debutDate, finDate } = calculerPeriode("jour", instant);
    expect(debutDate).toBe("2026-08-20");
    expect(finDate).toBe("2026-08-20");
  });

  it("semaine : commence le lundi précédent (inclus)", () => {
    // 2026-08-20 est un jeudi
    const instant = new Date("2026-08-20T10:00:00Z");
    const { debutDate, finDate } = calculerPeriode("semaine", instant);
    expect(debutDate).toBe("2026-08-17"); // lundi
    expect(finDate).toBe("2026-08-20");
  });

  it("mois : commence le 1er du mois", () => {
    const instant = new Date("2026-08-20T10:00:00Z");
    const { debutDate, finDate } = calculerPeriode("mois", instant);
    expect(debutDate).toBe("2026-08-01");
    expect(finDate).toBe("2026-08-20");
  });

  it("respecte l'heure du Cameroun (UTC+1), pas le fuseau du serveur", () => {
    // 23h30 UTC le 19 août = 00h30 le 20 août à Douala/Yaoundé.
    // Un serveur en UTC (le cas le plus courant en production) verrait
    // "19 août" s'il utilisait l'heure locale du serveur au lieu de
    // calculer explicitement l'heure du Cameroun.
    const instant = new Date("2026-08-19T23:30:00Z");
    const { debutDate, finDate } = calculerPeriode("jour", instant);
    expect(debutDate).toBe("2026-08-20");
    expect(finDate).toBe("2026-08-20");
  });

  it("semaine : le dimanche appartient à la semaine qui se termine ce jour-là", () => {
    // 2026-08-23 est un dimanche ; la semaine a commencé le 2026-08-17 (lundi)
    const instant = new Date("2026-08-23T12:00:00Z");
    const { debutDate, finDate } = calculerPeriode("semaine", instant);
    expect(debutDate).toBe("2026-08-17");
    expect(finDate).toBe("2026-08-23");
  });

  it("debutInstant/finInstant encadrent bien la journée en heure du Cameroun", () => {
    const instant = new Date("2026-08-20T10:00:00Z");
    const { debutInstant, finInstant } = calculerPeriode("jour", instant);
    // Minuit à Douala le 20 août = 2026-08-19T23:00:00.000Z (UTC+1)
    expect(debutInstant).toBe("2026-08-19T23:00:00.000Z");
    // Borne exclusive = minuit du lendemain à Douala
    expect(finInstant).toBe("2026-08-20T23:00:00.000Z");
  });
});
