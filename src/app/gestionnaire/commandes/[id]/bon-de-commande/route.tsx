import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchCommandePourDocument, numeroCourt } from "@/lib/commande-document";
import { BonDeCommandePdf } from "@/components/documents/bon-de-commande-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["super_admin", "gestionnaire"]);

  const { id } = await params;
  const supabase = await createClient();
  const donnees = await fetchCommandePourDocument(supabase, id);

  if (!donnees) {
    return new NextResponse("Commande introuvable", { status: 404 });
  }

  const buffer = await renderToBuffer(<BonDeCommandePdf {...donnees} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bon-de-commande-${numeroCourt(id)}.pdf"`,
    },
  });
}
