import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCommandePourDocument, numeroCourt } from "@/lib/commande-document";
import { RecuPdf } from "@/components/documents/recu-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole(["super_admin", "gestionnaire"]);

  const { id } = await params;
  const typeParam = request.nextUrl.searchParams.get("type");
  const type = typeParam === "solde" ? "solde" : "acompte";

  const supabase = await createClient();
  const donnees = await fetchCommandePourDocument(supabase, id);

  if (!donnees) {
    return new NextResponse("Commande introuvable", { status: 404 });
  }

  const buffer = await renderToBuffer(<RecuPdf {...donnees} type={type} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recu-${type}-${numeroCourt(id)}.pdf"`,
    },
  });
}
