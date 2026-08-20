import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 18 },
  subtitle: { fontSize: 11, color: "#6B645A", marginTop: 2 },
  meta: { fontSize: 10, color: "#6B645A", textAlign: "right" },
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
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#2B2118",
  },
  totalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#B23A1C" },
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 9, color: "#6B645A" },
});
