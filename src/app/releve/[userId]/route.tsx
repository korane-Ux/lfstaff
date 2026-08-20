import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchReleve } from "@/lib/releve";
import { RelevePdf } from "@/components/documents/releve-pdf";

// Pas de restriction de rôle ici : la RLS sur `transactions` et `users`
// fait déjà le filtrage (chacun voit ses propres transactions, le staff
// voit tout). getCurrentProfile() vérifie juste qu'une session existe.
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  await getCurrentProfile();

  const { userId } = await params;
  const supabase = await createClient();
  const releve = await fetchReleve(supabase, userId);

  const buffer = await renderToBuffer(<RelevePdf {...releve} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="releve-${userId.slice(0, 8)}.pdf"`,
    },
  });
}
