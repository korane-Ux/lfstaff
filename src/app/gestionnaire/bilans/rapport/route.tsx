import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { calculerBilanPeriode } from "@/lib/bilans";
import { PERIODE_LABELS, type PeriodeKey } from "@/lib/periode";
import { RapportPdf } from "@/components/bilans/rapport-pdf";

function estPeriodeKey(value: string | null): value is PeriodeKey {
  return value === "jour" || value === "semaine" || value === "mois";
}

export async function GET(request: NextRequest) {
  await requireRole(["super_admin", "gestionnaire"]);

  const periodeParam = request.nextUrl.searchParams.get("periode");
  const periode: PeriodeKey = estPeriodeKey(periodeParam) ? periodeParam : "semaine";

  const supabase = await createClient();
  const bilan = await calculerBilanPeriode(supabase, periode);

  const buffer = await renderToBuffer(
    <RapportPdf periodeLabel={PERIODE_LABELS[periode]} bilan={bilan} />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="lfstaff-bilan-${periode}.pdf"`,
    },
  });
}
