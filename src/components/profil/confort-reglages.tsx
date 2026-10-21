"use client";

import { useSyncExternalStore } from "react";
import { SpeakerHighIcon, SpeakerSlashIcon, SparkleIcon, TextAaIcon } from "@phosphor-icons/react";
import {
  definirPreference,
  getPreferencesServerSnapshot,
  getPreferencesSnapshot,
  subscribePreferences,
  type TailleTexte,
} from "@/lib/preferences-store";
import { jouerSon } from "@/lib/son";

const TAILLES: { value: TailleTexte; label: string; apercu: string }[] = [
  { value: "normal", label: "Normal", apercu: "text-xl" },
  { value: "grand", label: "Grand", apercu: "text-2xl" },
  { value: "tres-grand", label: "Très grand", apercu: "text-3xl" },
];

// Interrupteur accessible : un vrai bouton avec role="switch" et
// aria-checked, libellé visible à côté — jamais un interrupteur muet.
function Interrupteur({
  actif,
  onChange,
  label,
  description,
  icone,
}: {
  actif: boolean;
  onChange: (actif: boolean) => void;
  label: string;
  description: string;
  icone: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={() => onChange(!actif)}
      className="flex min-h-16 w-full items-center gap-4 rounded-2xl bg-creme p-4 text-left"
    >
      <span className="shrink-0 text-encre">{icone}</span>
      <span className="flex flex-1 flex-col">
        <span className="text-base font-semibold text-encre">{label}</span>
        <span className="text-sm text-encre/65">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${actif ? "bg-vert" : "bg-gris/60"}`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            actif ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export function ConfortReglages() {
  const prefs = useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    getPreferencesServerSnapshot,
  );

  return (
    <section aria-labelledby="confort-titre" className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <div className="flex items-center gap-3">
        <TextAaIcon size={30} weight="duotone" className="icone-duo text-encre" />
        <div>
          <h2 id="confort-titre" className="font-display text-xl text-encre">
            Confort
          </h2>
          <p className="text-sm text-encre/65">Réglé pour cet appareil uniquement.</p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-base font-semibold text-encre">Taille du texte</legend>
        <div className="grid grid-cols-3 gap-2">
          {TAILLES.map((taille) => {
            const choisie = prefs.texte === taille.value;
            return (
              <button
                key={taille.value}
                type="button"
                aria-pressed={choisie}
                onClick={() => definirPreference("texte", taille.value)}
                className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl p-2 ${
                  choisie ? "bg-braise text-accent-fg" : "bg-creme text-encre"
                }`}
              >
                <span className={`font-display leading-none ${taille.apercu}`} aria-hidden="true">
                  Aa
                </span>
                <span className="text-sm font-semibold">{taille.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Interrupteur
          actif={prefs.son}
          onChange={(actif) => {
            definirPreference("son", actif);
            if (actif) jouerSon("succes");
          }}
          label="Sons de confirmation"
          description="Un petit tintement quand une action réussit."
          icone={
            prefs.son ? (
              <SpeakerHighIcon size={28} weight="duotone" className="icone-duo" />
            ) : (
              <SpeakerSlashIcon size={28} weight="duotone" className="icone-duo" />
            )
          }
        />
        {prefs.son && (
          <button
            type="button"
            onClick={() => jouerSon("succes")}
            className="min-h-11 self-start px-1 text-base text-encre/75 underline underline-offset-4 hover:text-encre"
          >
            Écouter le son
          </button>
        )}

        <Interrupteur
          actif={prefs.animations === "auto"}
          onChange={(actif) => definirPreference("animations", actif ? "auto" : "reduites")}
          label="Animations"
          description="Désactivez-les si les mouvements vous gênent."
          icone={<SparkleIcon size={28} weight="duotone" className="icone-duo" />}
        />
      </div>
    </section>
  );
}
