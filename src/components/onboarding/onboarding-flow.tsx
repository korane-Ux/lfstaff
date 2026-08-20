"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import logo from "../../../design/references/lfstaff-logo-source.jpg";
import fonteImg from "../../../design/references/fonte-illustration.jpg";
import equipeImg from "../../../design/references/motif-mains-feu.jpg";
import livraisonImg from "../../../design/references/remise-livraison.png";
import { roleHome } from "@/lib/role-home";
import type { AppRole } from "@/lib/supabase/types";

const CLE_VU = "lfstaff-onboarding-vu";

const ECRANS: { image: StaticImageData; phrase: string }[] = [
  { image: logo, phrase: "Bienvenue sur LFstaff, l'outil du staff Le Foyer." },
  { image: fonteImg, phrase: "Suis chaque commande, de la fonte à la livraison." },
  { image: equipeImg, phrase: "Gestionnaire, fournisseur, livreur : chacun voit juste ce qu'il a à faire." },
  { image: livraisonImg, phrase: "C'est parti !" },
];

export function OnboardingFlow({ role }: { role: AppRole }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const ecran = ECRANS[index];
  const dernier = index === ECRANS.length - 1;

  function terminer() {
    localStorage.setItem(CLE_VU, "1");
    router.replace(roleHome(role));
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between gap-8 bg-creme px-6 py-10">
      <button onClick={terminer} className="self-end text-sm text-encre/65">
        Passer
      </button>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="relative h-56 w-56 overflow-hidden rounded-3xl">
          <Image src={ecran.image} alt="" fill className="object-cover" priority />
        </div>
        <p className="max-w-xs text-center font-display text-2xl text-encre">{ecran.phrase}</p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <div className="flex gap-2">
          {ECRANS.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-braise" : "bg-encre/15"}`}
            />
          ))}
        </div>
        <button
          onClick={() => (dernier ? terminer() : setIndex(index + 1))}
          className="w-full rounded-none bg-braise px-4 py-4 text-lg font-medium text-accent-fg"
        >
          {dernier ? "Commencer" : "Suivant"}
        </button>
      </div>
    </main>
  );
}

export function onboardingDejaVu() {
  return typeof window !== "undefined" && localStorage.getItem(CLE_VU) === "1";
}
