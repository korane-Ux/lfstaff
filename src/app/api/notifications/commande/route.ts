import { NextResponse } from "next/server";
import { Resend } from "resend";
import twilio from "twilio";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCommandePourDocument } from "@/lib/commande-document";
import { messagePourEtat, smsPourEtat, smsPourLivreurAssigne } from "@/lib/notifications";
import { numeroInternational } from "@/lib/contact";

async function envoyerSms(telephone: string, texte: string): Promise<string> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return "non configuré";

  try {
    await twilio(sid, token).messages.create({
      from,
      to: `+${numeroInternational(telephone)}`,
      body: texte,
    });
    return "envoyé";
  } catch (err) {
    return `erreur : ${err instanceof Error ? err.message : "inconnue"}`;
  }
}

// Appelé (sans bloquer l'action principale) juste après qu'une commande
// change d'état, pour prévenir le client (email + SMS) et, si elle vient
// d'être assignée, le livreur (SMS). Chaque canal se tait silencieusement
// s'il n'est pas configuré ou si la personne n'a pas l'info de contact
// correspondante — jamais d'erreur bruyante avant que Resend/Twilio soient
// branchés.
export async function POST(request: Request) {
  await requireRole(["super_admin", "gestionnaire", "fournisseur"]);

  const { commandeId } = (await request.json()) as { commandeId?: string };
  if (!commandeId) {
    return NextResponse.json({ error: "commandeId manquant." }, { status: 400 });
  }

  const supabase = await createClient();
  const donnees = await fetchCommandePourDocument(supabase, commandeId);
  if (!donnees) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  const ctx = {
    clientNom: donnees.client?.nom ?? "client",
    produitNom: donnees.produit?.nom ?? "votre commande",
    codeLivraison: donnees.commande.code_livraison,
    motif: donnees.commande.motif_annulation,
    soldeMontant: donnees.commande.solde_montant,
  };

  const resultats: Record<string, string> = {};

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!resendKey || !from) {
    resultats.email = "non configuré";
  } else if (!donnees.client?.email) {
    resultats.email = "pas d'email client";
  } else {
    const message = messagePourEtat(donnees.commande.etat, ctx);
    if (!message) {
      resultats.email = "pas de message pour cet état";
    } else {
      const { error } = await new Resend(resendKey).emails.send({
        from,
        to: donnees.client.email,
        subject: message.objet,
        text: message.corps,
      });
      resultats.email = error ? `erreur : ${error.message}` : "envoyé";
    }
  }

  if (!donnees.client?.telephone) {
    resultats.sms = "pas de téléphone client";
  } else {
    const texte = smsPourEtat(donnees.commande.etat, ctx);
    resultats.sms = texte ? await envoyerSms(donnees.client.telephone, texte) : "pas de message pour cet état";
  }

  if (donnees.commande.etat === "en_livraison" && donnees.commande.livreur_id) {
    const { data: livreur } = await supabase
      .from("users")
      .select("nom, telephone")
      .eq("id", donnees.commande.livreur_id)
      .single();

    if (!livreur?.telephone) {
      resultats.smsLivreur = "pas de téléphone livreur";
    } else {
      const texte = smsPourLivreurAssigne({
        clientNom: ctx.clientNom,
        produitNom: ctx.produitNom,
        ville: donnees.commande.ville_livraison,
      });
      resultats.smsLivreur = await envoyerSms(livreur.telephone, texte);
    }
  }

  return NextResponse.json(resultats);
}
