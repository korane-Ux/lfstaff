import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatFcfa } from "@/lib/etats";
import { numeroCourt, type CommandePourDocument } from "@/lib/commande-document";
import { pdfStyles as s } from "./pdf-styles";

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{valeur}</Text>
    </View>
  );
}

export function RecuPdf({
  commande,
  client,
  produit,
  type,
}: CommandePourDocument & { type: "acompte" | "solde" }) {
  const montant = type === "acompte" ? commande.acompte_montant : commande.solde_montant;
  const libelle = type === "acompte" ? "Acompte" : "Solde";
  const date = new Date().toLocaleDateString("fr-FR");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Le Foyer</Text>
            <Text style={s.subtitle}>Reçu de paiement — {libelle.toLowerCase()}</Text>
          </View>
          <View>
            <Text style={s.meta}>Commande N° {numeroCourt(commande.id)}</Text>
            <Text style={s.meta}>{date}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Ligne label="Reçu de" valeur={client?.nom ?? "—"} />
          <Ligne label="Pour" valeur={produit?.nom ?? "—"} />
        </View>

        <View style={s.total}>
          <Text style={s.totalLabel}>{libelle} reçu</Text>
          <Text style={s.totalValue}>{formatFcfa(montant)}</Text>
        </View>

        <Text style={s.footer}>Le Foyer — marmites en métal coulé, sur commande.</Text>
      </Page>
    </Document>
  );
}
