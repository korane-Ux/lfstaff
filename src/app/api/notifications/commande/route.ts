import { NextResponse } from "next/server";
import { Resend } from "resend";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCommandePourDocument } from "@/lib/commande-document";
import { messagePourEtat } from "@/lib/notifications";

// Appelé (sans bloquer l'action principale) juste après qu'une commande
// change d'état, pour prévenir le client par email. Ne fait rien
// silencieusement si le client n'a pas d'email renseigné, ou si
// RESEND_API_KEY n'est pas configuré (pas d'erreur bruyante en dev/avant
// que l'utilisateur ait créé son compte Resend).
export async function POST(request: Request) {
  await requireRole(["super_admin", "gestionnaire", "fournisseur"]);

  const { commandeId } = (await request.json()) as { commandeId?: string };
  if (!commandeId) {
    return NextResponse.json({ error: "commandeId manquant." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json({ skipped: "email non configuré" });
  }

  const supabase = await createClient();
  const donnees = await fetchCommandePourDocument(supabase, commandeId);
  if (!donnees?.client?.email) {
    return NextResponse.json({ skipped: "pas d'email client" });
  }

  const message = messagePourEtat(donnees.commande.etat, {
    clientNom: donnees.client.nom,
    produitNom: donnees.produit?.nom ?? "votre commande",
    codeLivraison: donnees.commande.code_livraison,
    motif: donnees.commande.motif_annulation,
    soldeMontant: donnees.commande.solde_montant,
  });

  if (!message) {
    return NextResponse.json({ skipped: "pas de message pour cet état" });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: donnees.client.email,
    subject: message.objet,
    text: message.corps,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
