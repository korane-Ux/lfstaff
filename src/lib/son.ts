import { getPreferencesSnapshot } from "@/lib/preferences-store";

// Sons synthétisés à la volée (Web Audio) : aucun fichier à télécharger,
// ce qui compte sur une connexion 3G. Le timbre évoque un petit tintement
// de métal — on reste dans l'univers de la fonte.

export type TypeSon = "succes" | "erreur" | "info";

let contexte: AudioContext | null = null;

function obtenirContexte(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!contexte) contexte = new Ctor();
  // Les navigateurs suspendent l'audio tant que l'utilisateur n'a pas
  // interagi ; nos sons suivent toujours un clic, donc la reprise passe.
  if (contexte.state === "suspended") void contexte.resume();
  return contexte;
}

function note(ctx: AudioContext, frequence: number, debut: number, duree: number, volume: number) {
  const osc = ctx.createOscillator();
  const harmonique = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequence;
  // Une harmonique légère, un peu désaccordée : c'est elle qui donne le
  // côté « métal qui sonne » plutôt qu'un bip électronique.
  harmonique.type = "triangle";
  harmonique.frequency.value = frequence * 2.01;

  const t = ctx.currentTime + debut;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);

  const gainHarmonique = ctx.createGain();
  gainHarmonique.gain.value = 0.18;

  osc.connect(gain);
  harmonique.connect(gainHarmonique).connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  harmonique.start(t);
  osc.stop(t + duree + 0.05);
  harmonique.stop(t + duree + 0.05);
}

export function jouerSon(type: TypeSon) {
  if (!getPreferencesSnapshot().son) return;
  const ctx = obtenirContexte();
  if (!ctx) return;

  try {
    if (type === "succes") {
      // Deux notes montantes (sol → do) : la « résolution » se lit comme
      // une réussite, même sans regarder l'écran.
      note(ctx, 783.99, 0, 0.35, 0.16);
      note(ctx, 1046.5, 0.09, 0.55, 0.14);
    } else if (type === "erreur") {
      // Deux notes descendantes, plus graves et plus douces : signaler sans
      // alarmer.
      note(ctx, 392, 0, 0.3, 0.12);
      note(ctx, 311.13, 0.12, 0.45, 0.1);
    } else {
      note(ctx, 880, 0, 0.3, 0.08);
    }
  } catch {
    // Audio indisponible (politique du navigateur, appareil muet…) : le
    // retour visuel suffit, on ne casse jamais une action pour un son.
  }
}
