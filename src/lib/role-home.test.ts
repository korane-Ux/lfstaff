import { describe, expect, it } from "vitest";
import { roleHome } from "./role-home";

describe("roleHome", () => {
  it("envoie le fournisseur vers /fournisseur", () => {
    expect(roleHome("fournisseur")).toBe("/fournisseur");
  });

  it("envoie le livreur vers /livreur", () => {
    expect(roleHome("livreur")).toBe("/livreur");
  });

  it("envoie la gestionnaire vers /gestionnaire", () => {
    expect(roleHome("gestionnaire")).toBe("/gestionnaire");
  });

  it("envoie le super_admin vers /gestionnaire aussi", () => {
    expect(roleHome("super_admin")).toBe("/gestionnaire");
  });
});
