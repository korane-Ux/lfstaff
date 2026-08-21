import { NextResponse } from "next/server";
import { Resend } from "resend";
import twilio from "twilio";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCommandePourDocument } from "@/lib/commande-document";
import { messagePourEtat, smsPourEtat } from "@/lib/notifications";
import { numeroInternational } from "@/lib/contact";

// Appelé (sans bloquer l'action principale) juste après qu'une commande
// change d'état, pour prévenir le client par email et/ou SMS. Les deux
// canaux sont indépendants : chacun se tait silencieusement s'il n'est pas
// configuré (pas d'erreur bruyante avant que l'utilisateur ait créé ses
// comptes Resend/Twilio) ou si le client n'a pas l'information de contact
// correspondante.
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

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;
  if (!twilioSid || !twilioToken || !twilioFrom) {
    resultats.sms = "non configuré";
  } else if (!donnees.client?.telephone) {
    resultats.sms = "pas de téléphone client";
  } else {
    const texte = smsPourEtat(donnees.commande.etat, ctx);
    if (!texte) {
      resultats.sms = "pas de message pour cet état";
    } else {
      try {
        await twilio(twilioSid, twilioToken).messages.create({
          from: twilioFrom,
          to: `+${numeroInternational(donnees.client.telephone)}`,
          body: texte,
        });
        resultats.sms = "envoyé";
      } catch (err) {
        resultats.sms = `erreur : ${err instanceof Error ? err.message : "inconnue"}`;
      }
    }
  }

  return NextResponse.json(resultats);
}
