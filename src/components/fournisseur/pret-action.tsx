"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

export function PretAction({
  commandeId,
  villes,
  villeLivraison,
}: {
  commandeId: string;
  villes: string[];
  villeLivraison: string | null;
}) {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [agence, setAgence] = useState("");
  const [nBordereau, setNBordereau] = useState("");
  const [villeDepart, setVilleDepart] = useState(villes[0] ?? "");
  const [villeArrivee, setVilleArrivee] = useState(villeLivraison ?? villes[0] ?? "");
  const [dateArriveePrevue, setDateArriveePrevue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!pret) {
    return (
      <button
        onClick={() => setPret(true)}
        className="rounded-xl bg-braise px-4 py-4 text-lg font-medium text-creme"
      >
        C&apos;est prêt
      </button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: expError } = await supabase.from("expeditions").insert({
      commande_id: commandeId,
      agence,
      n_bordereau: nBordereau || null,
      ville_depart: villeDepart || null,
      ville_arrivee: villeArrivee || null,
      date_depart: new Date().toISOString().slice(0, 10),
      date_arrivee_prevue: dateArriveePrevue || null,
    });

    if (expError) {
      setLoading(false);
      setError("Impossible d'enregistrer l'expédition.");
      return;
    }

    const { error: updateError } = await supabase
      .from("commandes")
      .update({ etat: "expediee" })
      .eq("id", commandeId);

    setLoading(false);

    if (updateError) {
      setError("L'expédition est enregistrée mais le statut n'a pas pu être mis à jour.");
      return;
    }

    router.replace("/fournisseur");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Expédition</p>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Agence de transport
        <input required value={agence} onChange={(e) => setAgence(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        N° de bordereau
        <input value={nBordereau} onChange={(e) => setNBordereau(e.target.value)} className={inputClass} />
      </label>

      {villes.length > 0 && (
        <>
          <label className="flex flex-col gap-1 text-sm text-encre">
            Ville de départ
            <select
              value={villeDepart}
              onChange={(e) => setVilleDepart(e.target.value)}
              className={inputClass}
            >
              {villes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-encre">
            Ville d&apos;arrivée
            <select
              value={villeArrivee}
              onChange={(e) => setVilleArrivee(e.target.value)}
              className={inputClass}
            >
              {villes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <label className="flex flex-col gap-1 text-sm text-encre">
        Date d&apos;arrivée prévue
        <input
          type="date"
          required
          value={dateArriveePrevue}
          onChange={(e) => setDateArriveePrevue(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-sm text-litige">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Confirmer l'expédition"}
      </button>
    </form>
  );
}
