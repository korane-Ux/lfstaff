import { Image, Text, View } from "@react-pdf/renderer";
import { pdfStyles as s, LOGO_SRC } from "./pdf-styles";

export function PdfHeader({
  subtitle,
  metaLines = [],
}: {
  subtitle: string;
  metaLines?: string[];
}) {
  return (
    <View style={s.header}>
      <View style={s.brand}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not next/image/DOM: no alt prop exists on this component */}
        <Image src={LOGO_SRC} style={s.logo} />
        <View>
          <Text style={s.title}>Le Foyer</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {metaLines.length > 0 && (
        <View>
          {metaLines.map((ligne) => (
            <Text key={ligne} style={s.meta}>
              {ligne}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export function PdfFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Le Foyer — marmites en métal coulé, sur commande.</Text>
      <Text style={s.signature}>Signé Le Foyer</Text>
    </View>
  );
}
