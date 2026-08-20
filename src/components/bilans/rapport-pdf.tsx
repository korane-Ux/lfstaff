import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatFcfa } from "@/lib/etats";
import type { BilanPeriode } from "@/lib/bilans";
import { pdfStyles as s } from "@/components/documents/pdf-styles";
import { PdfHeader, PdfFooter } from "@/components/documents/pdf-brand";

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{valeur}</Text>
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
      <Page size="A4" style={s.page}>
        <PdfHeader
          subtitle="Rapport de période"
          metaLines={[periodeLabel, `${bilan.debutDate} au ${bilan.finDate}`]}
        />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Argent</Text>
          <Ligne label="Encaissé" valeur={formatFcfa(bilan.encaisse)} />
          <Ligne label="Avances fournisseurs" valeur={formatFcfa(bilan.sortiesAvances)} />
          <Ligne label="Commissions livreurs" valeur={formatFcfa(bilan.sortiesCommissions)} />
          <Ligne label="Transport" valeur={formatFcfa(bilan.sortiesTransport)} />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Commandes de la période</Text>
          <Ligne label="Nombre" valeur={String(bilan.nombreCommandes)} />
          <Ligne label="En attente d'encaissement" valeur={formatFcfa(bilan.enAttente)} />
        </View>

        <View style={s.total}>
          <Text style={s.totalLabel}>Marge nette</Text>
          <Text style={s.totalValue}>{formatFcfa(bilan.margeNette)}</Text>
        </View>

        <PdfFooter />
      </Page>
    </Document>
  );
}
