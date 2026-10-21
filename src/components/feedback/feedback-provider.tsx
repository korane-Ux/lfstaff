"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, WarningCircleIcon, XIcon, type Icon } from "@phosphor-icons/react";
import { jouerSon } from "@/lib/son";
import { animationsReduites } from "@/lib/preferences-store";

export type ActionSuivante = {
  label: string;
  href: string;
  icone?: Icon;
};

type Succes = {
  titre: string;
  message?: string;
  // Les prochaines étapes logiques (ex. « Voir le suivi »). Sans elles, la
  // pop-up se ferme seule : il n'y a rien à décider.
  suite?: ActionSuivante[];
};

type FeedbackApi = {
  succes: (succes: Succes) => void;
  erreur: (message: string) => void;
};

const FeedbackContext = createContext<FeedbackApi | null>(null);

export function useFeedback(): FeedbackApi {
  const api = useContext(FeedbackContext);
  if (!api) throw new Error("useFeedback doit être utilisé sous <FeedbackProvider>.");
  return api;
}

const DUREE_FERMETURE_AUTO = 2600;

// Étincelles : quelques points qui jaillissent du centre, aux couleurs du
// métal chauffé. Purement décoratif (aria-hidden), coupé si animations
// réduites.
const ETINCELLES = [
  { x: -46, y: -38, couleur: "bg-laiton" },
  { x: 48, y: -32, couleur: "bg-creation" },
  { x: -54, y: 14, couleur: "bg-creation" },
  { x: 56, y: 20, couleur: "bg-laiton" },
  { x: -18, y: -58, couleur: "bg-braise" },
  { x: 22, y: 56, couleur: "bg-laiton" },
];

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [succes, setSucces] = useState<Succes | null>(null);
  const [erreurMessage, setErreurMessage] = useState<string | null>(null);
  const [reduit, setReduit] = useState(false);
  // Change à chaque affichage pour rejouer l'animation même si deux
  // succès identiques s'enchaînent.
  const [cle, setCle] = useState(0);

  const fermer = useCallback(() => {
    dialogRef.current?.close();
    setSucces(null);
  }, []);

  const api = useMemo<FeedbackApi>(
    () => ({
      succes: (s) => {
        setReduit(animationsReduites());
        setSucces(s);
        setCle((c) => c + 1);
        jouerSon("succes");
      },
      erreur: (message) => {
        setErreurMessage(message);
        jouerSon("erreur");
      },
    }),
    [],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !succes) return;
    if (!dialog.open) dialog.showModal();

    if (!succes.suite?.length) {
      const minuterie = setTimeout(fermer, DUREE_FERMETURE_AUTO);
      return () => clearTimeout(minuterie);
    }
  }, [succes, cle, fermer]);

  useEffect(() => {
    if (!erreurMessage) return;
    const minuterie = setTimeout(() => setErreurMessage(null), 5000);
    return () => clearTimeout(minuterie);
  }, [erreurMessage]);

  return (
    <FeedbackContext.Provider value={api}>
      {children}

      <dialog
        ref={dialogRef}
        onClose={() => setSucces(null)}
        onClick={(event) => {
          // Clic sur le voile (hors de la carte) = fermer.
          if (event.target === event.currentTarget) fermer();
        }}
        aria-labelledby="feedback-titre"
        aria-describedby={succes?.message ? "feedback-message" : undefined}
        className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-encre/45 backdrop:backdrop-blur-[2px] md:m-auto md:max-w-md"
      >
        {succes && (
          <motion.div
            key={cle}
            initial={reduit ? false : { y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative flex flex-col items-center gap-5 rounded-t-[2rem] bg-surface px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8 text-center shadow-2xl md:rounded-[2rem]"
          >
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-encre/60 hover:bg-creme hover:text-encre"
            >
              <XIcon size={22} weight="bold" />
            </button>

            <div className="relative flex h-24 w-24 items-center justify-center" aria-hidden="true">
              {!reduit &&
                ETINCELLES.map((e, i) => (
                  <motion.span
                    key={i}
                    className={`absolute h-2 w-2 rounded-full ${e.couleur}`}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: e.x, y: e.y, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.75, delay: 0.15 + i * 0.03, ease: "easeOut" }}
                  />
                ))}
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-vert"
                initial={reduit ? false : { scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 16 }}
              >
                <svg viewBox="0 0 52 52" className="h-11 w-11" fill="none">
                  <motion.path
                    d="M14 27 L23 36 L39 18"
                    stroke="var(--color-accent-fg)"
                    strokeWidth={5.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduit ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 id="feedback-titre" className="font-display text-3xl leading-tight text-encre">
                {succes.titre}
              </h2>
              {succes.message && (
                <p id="feedback-message" className="text-base text-encre/75">
                  {succes.message}
                </p>
              )}
            </div>

            {!!succes.suite?.length && (
              <div className="flex w-full flex-col gap-2">
                <p className="text-left text-sm font-semibold uppercase tracking-wider text-encre/55">
                  Et ensuite ?
                </p>
                {succes.suite.map((action, index) => {
                  const IconeAction = action.icone;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={fermer}
                      autoFocus={index === 0}
                      className={`group flex min-h-14 items-center gap-3 px-4 py-3 text-left text-base font-semibold transition-transform active:scale-[0.98] ${
                        index === 0 ? "bg-braise text-accent-fg" : "bg-creme text-encre"
                      }`}
                    >
                      {IconeAction && <IconeAction size={26} weight="duotone" className="shrink-0" />}
                      <span className="flex-1">{action.label}</span>
                      <ArrowRightIcon
                        size={20}
                        weight="bold"
                        className="shrink-0 transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={fermer}
                  className="min-h-12 text-base text-encre/70 underline-offset-4 hover:text-encre hover:underline"
                >
                  Rester sur cette page
                </button>
              </div>
            )}
          </motion.div>
        )}
      </dialog>

      {/* Erreurs hors formulaire : bandeau discret en bas, annoncé aux
          lecteurs d'écran (role=alert) sans voler le focus. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-6">
        {erreurMessage && (
          <motion.div
            role="alert"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 bg-litige px-4 py-3 text-base text-accent-fg shadow-xl"
          >
            <WarningCircleIcon size={24} weight="duotone" className="shrink-0" />
            <span className="flex-1">{erreurMessage}</span>
            <button
              type="button"
              onClick={() => setErreurMessage(null)}
              aria-label="Fermer le message"
              className="flex h-10 w-10 items-center justify-center"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </motion.div>
        )}
      </div>
    </FeedbackContext.Provider>
  );
}
