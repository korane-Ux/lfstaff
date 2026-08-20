"use client";

import { useState, type ReactNode } from "react";
import { Button } from "./button";

const PHRASE = "LABRAISECONSUMME";

// Gate pour toute action irréversible (suppression, désactivation,
// annulation) : le bouton de confirmation ne s'active qu'une fois la
// phrase tapée exactement. Le render-prop `trigger` laisse chaque appelant
// utiliser son propre bouton/déclencheur tout en partageant la mécanique.
export function ConfirmDangerDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  trigger,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  trigger: (open: () => void) => ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fermer() {
    if (loading) return;
    setOuvert(false);
    setSaisie("");
    setError(null);
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      setOuvert(false);
      setSaisie("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {trigger(() => setOuvert(true))}
      {ouvert && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={fermer}
        >
          <div
            className="flex w-full max-w-sm flex-col gap-3 rounded-3xl bg-surface p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-base font-medium text-encre">{title}</p>
            <p className="text-sm text-encre/70">{description}</p>
            <p className="text-xs text-encre/65">
              Tape <span className="font-mono font-medium text-litige">{PHRASE}</span> pour confirmer.
            </p>
            <input
              value={saisie}
              onChange={(event) => setSaisie(event.target.value)}
              autoFocus
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise"
            />
            {error && <p role="alert" className="text-xs text-litige">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={fermer} disabled={loading}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="flex-1"
                disabled={loading || saisie !== PHRASE}
                onClick={handleConfirm}
              >
                {loading ? "..." : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
