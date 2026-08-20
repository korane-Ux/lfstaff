"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PhotoInput } from "@/components/ui/photo-input";
import { Button } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/ui/field";

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
  const [fraisTransport, setFraisTransport] = useState("");
  const [photoBordereau, setPhotoBordereau] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!pret) {
    return (
      <Button size="lg" onClick={() => setPret(true)}>
        C&apos;est prêt
      </Button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("fn_expedier_commande", {
      p_commande_id: commandeId,
      p_agence: agence,
      p_n_bordereau: nBordereau || null,
      p_ville_depart: villeDepart || null,
      p_ville_arrivee: villeArrivee || null,
      p_date_arrivee_prevue: dateArriveePrevue || null,
      p_frais_transport: fraisTransport ? Number(fraisTransport) : null,
      p_photo_bordereau: photoBordereau,
    });

    setLoading(false);

    if (rpcError) {
      setError("Impossible d'enregistrer l'expédition.");
      return;
    }

    router.replace("/fournisseur");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
      <p className="text-sm font-medium text-encre">Expédition</p>

      <TextField
        label="Agence de transport"
        required
        value={agence}
        onChange={(e) => setAgence(e.target.value)}
      />

      <TextField label="N° de bordereau" value={nBordereau} onChange={(e) => setNBordereau(e.target.value)} />

      {villes.length > 0 && (
        <>
          <SelectField
            label="Ville de départ"
            value={villeDepart}
            onChange={(e) => setVilleDepart(e.target.value)}
          >
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Ville d'arrivée"
            value={villeArrivee}
            onChange={(e) => setVilleArrivee(e.target.value)}
          >
            {villes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SelectField>
        </>
      )}

      <TextField
        label="Frais de transport"
        hint="FCFA"
        type="number"
        min={0}
        value={fraisTransport}
        onChange={(e) => setFraisTransport(e.target.value)}
      />

      <PhotoInput dossier="expeditions" onUploaded={setPhotoBordereau} />

      <TextField
        label="Date d'arrivée prévue"
        type="date"
        required
        value={dateArriveePrevue}
        onChange={(e) => setDateArriveePrevue(e.target.value)}
      />

      {error && <p className="text-sm text-litige">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Confirmer l'expédition"}
      </Button>
    </form>
  );
}
