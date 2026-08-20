"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Client = { id: string; nom: string };
type Produit = { id: string; nom: string; prix_final: number | null };

const inputClass =
  "rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise";

export function CommandeForm({
  clients,
  produits,
  pctAcompte,
  villes,
}: {
  clients: Client[];
  produits: Produit[];
  pctAcompte: number;
  villes: string[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [produitId, setProduitId] = useState(produits[0]?.id ?? "");
  const [quantite, setQuantite] = useState("1");
  const [prixTotal, setPrixTotal] = useState(() => String(produits[0]?.prix_final ?? ""));
  const [acompteMontant, setAcompteMontant] = useState("");
  const [villeLivraison, setVilleLivraison] = useState(villes[0] ?? "");
  const [specs, setSpecs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const acompteSuggere = useMemo(() => {
    const total = Number(prixTotal) || 0;
    return Math.round((total * pctAcompte) / 100);
  }, [prixTotal, pctAcompte]);

  function recalcPrix(nextProduitId: string, nextQuantite: string) {
    const produit = produits.find((p) => p.id === nextProduitId);
    const qte = Number(nextQuantite) || 1;
    if (produit?.prix_final) {
      setPrixTotal(String(produit.prix_final * qte));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const total = Number(prixTotal) || 0;
    const acompte = acompteMontant ? Number(acompteMontant) : acompteSuggere;

    const supabase = createClient();
    const { error: insertError } = await supabase.from("commandes").insert({
      client_id: clientId,
      produit_id: produitId,
      quantite: Number(quantite) || 1,
      prix_total: total,
      acompte_montant: acompte,
      solde_montant: total - acompte,
      ville_livraison: villeLivraison || null,
      specs: specs || null,
    });

    setLoading(false);

    if (insertError) {
      setError("Impossible de créer la commande.");
      return;
    }

    router.replace("/gestionnaire");
    router.refresh();
  }

  if (!clients.length) {
    return (
      <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
        Il faut d&apos;abord un client.{" "}
        <Link href="/gestionnaire/clients/nouveau" className="underline">
          En créer un
        </Link>
        .
      </p>
    );
  }

  if (!produits.length) {
    return (
      <p className="rounded-2xl bg-surface p-6 text-center text-sm text-encre/60">
        Il faut d&apos;abord un produit au catalogue.{" "}
        <Link href="/gestionnaire/produits/nouveau" className="underline">
          En créer un
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-surface p-5">
      <label className="flex flex-col gap-1 text-sm text-encre">
        Client
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Produit
        <select
          value={produitId}
          onChange={(e) => {
            setProduitId(e.target.value);
            recalcPrix(e.target.value, quantite);
          }}
          className={inputClass}
        >
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Quantité
        <input
          type="number"
          min={1}
          value={quantite}
          onChange={(e) => {
            setQuantite(e.target.value);
            recalcPrix(produitId, e.target.value);
          }}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Prix total (FCFA)
        <input
          required
          type="number"
          min={0}
          value={prixTotal}
          onChange={(e) => setPrixTotal(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-encre">
        Acompte à encaisser (FCFA) — suggéré {acompteSuggere.toLocaleString("fr-FR")}
        <input
          type="number"
          min={0}
          value={acompteMontant}
          placeholder={String(acompteSuggere)}
          onChange={(e) => setAcompteMontant(e.target.value)}
          className={inputClass}
        />
      </label>

      {villes.length > 0 && (
        <label className="flex flex-col gap-1 text-sm text-encre">
          Ville de livraison
          <select
            value={villeLivraison}
            onChange={(e) => setVilleLivraison(e.target.value)}
            className={inputClass}
          >
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm text-encre">
        Précisions (optionnel)
        <textarea value={specs} onChange={(e) => setSpecs(e.target.value)} rows={2} className={inputClass} />
      </label>

      {error && <p className="text-sm text-litige">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme disabled:opacity-60"
      >
        {loading ? "Création..." : "Créer la commande"}
      </button>
    </form>
  );
}
