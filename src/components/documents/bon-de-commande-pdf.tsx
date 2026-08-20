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

export function BonDeCommandePdf({ commande, client, produit }: CommandePourDocument) {
  const date = new Date(commande.cree_le).toLocaleDateString("fr-FR");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Le Foyer</Text>
            <Text style={s.subtitle}>Bon de commande</Text>
          </View>
          <View>
            <Text style={s.meta}>N° {numeroCourt(commande.id)}</Text>
            <Text style={s.meta}>{date}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Client</Text>
          <Ligne label="Nom" valeur={client?.nom ?? "—"} />
          {client?.telephone && <Ligne label="Téléphone" valeur={client.telephone} />}
          <Ligne
            label="Livraison"
            valeur={[client?.adresse, client?.quartier, commande.ville_livraison]
              .filter(Boolean)
              .join(", ") || "—"}
          />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Commande</Text>
          <Ligne label="Produit" valeur={produit?.nom ?? "—"} />
          <Ligne label="Quantité" valeur={String(commande.quantite)} />
          {commande.specs && <Ligne label="Précisions" valeur={commande.specs} />}
        </View>

        <View style={s.section}>
          <Ligne label="Acompte à la commande" valeur={formatFcfa(commande.acompte_montant)} />
          <Ligne label="Solde à la livraison" valeur={formatFcfa(commande.solde_montant)} />
        </View>

        <View style={s.total}>
          <Text style={s.totalLabel}>Prix total</Text>
          <Text style={s.totalValue}>{formatFcfa(commande.prix_total)}</Text>
        </View>

        <Text style={s.footer}>Le Foyer — marmites en métal coulé, sur commande.</Text>
      </Page>
    </Document>
  );
}
