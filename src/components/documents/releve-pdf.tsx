import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatFcfa } from "@/lib/etats";
import type { Releve } from "@/lib/releve";
import { pdfStyles as s } from "./pdf-styles";

const TYPE_LABELS: Record<string, string> = {
  avance_fournisseur: "Avance reçue",
  commission_livreur: "Commission créditée",
  retrait_livreur: "Retrait payé",
  solde_client: "Solde client encaissé",
  remise_cash: "Cash remis à l'entreprise",
  acompte_client: "Acompte encaissé",
  frais_transport: "Frais de transport",
};

export function RelevePdf({ profil, transactions }: Releve) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>Le Foyer</Text>
            <Text style={s.subtitle}>Relevé de compte — {profil?.nom ?? "—"}</Text>
          </View>
          <Text style={s.meta}>{new Date().toLocaleDateString("fr-FR")}</Text>
        </View>

        <View style={s.section}>
          {transactions.map((t, i) => (
            <View key={i} style={s.row}>
              <Text style={s.label}>
                {new Date(t.date).toLocaleDateString("fr-FR")} — {TYPE_LABELS[t.type] ?? t.type}
              </Text>
              <Text style={s.value}>{formatFcfa(t.montant)}</Text>
            </View>
          ))}
          {transactions.length === 0 && <Text style={s.label}>Aucune transaction pour l&apos;instant.</Text>}
        </View>
      </Page>
    </Document>
  );
}
