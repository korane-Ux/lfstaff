import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatFcfa } from "@/lib/etats";
import type { BilanPeriode } from "@/lib/bilans";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#6B645A", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, marginBottom: 8, fontFamily: "Helvetica-Bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE6D3",
  },
  label: { color: "#2B2118" },
  value: { fontFamily: "Helvetica-Bold" },
});

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{valeur}</Text>
    </View>
  );
}

export function RapportPdf({
  periodeLabel,
  bilan,
}: {
  periodeLabel: string;
  bilan: BilanPeriode;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>LFstaff — Rapport de période</Text>
        <Text style={styles.subtitle}>
          {periodeLabel} ({bilan.debutDate} au {bilan.finDate})
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Argent</Text>
          <Ligne label="Encaissé" valeur={formatFcfa(bilan.encaisse)} />
          <Ligne label="Avances fournisseurs" valeur={formatFcfa(bilan.sortiesAvances)} />
          <Ligne label="Commissions livreurs" valeur={formatFcfa(bilan.sortiesCommissions)} />
          <Ligne label="Transport" valeur={formatFcfa(bilan.sortiesTransport)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commandes de la période</Text>
          <Ligne label="Nombre" valeur={String(bilan.nombreCommandes)} />
          <Ligne label="En attente d'encaissement" valeur={formatFcfa(bilan.enAttente)} />
          <Ligne label="Marge nette" valeur={formatFcfa(bilan.margeNette)} />
        </View>
      </Page>
    </Document>
  );
}
