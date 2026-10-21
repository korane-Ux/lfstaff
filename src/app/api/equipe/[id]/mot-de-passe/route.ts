import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { genererMotDePasseProvisoire } from "@/lib/mot-de-passe";

// Réinitialisation du mot de passe d'un membre par le super-admin (membre
// qui l'a oublié). Le contrôle de rôle est fait ici, côté serveur : masquer
// le bouton dans l'interface ne suffirait pas à protéger la clé admin.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const superAdmin = await requireRole(["super_admin"]);
  const { id } = await params;

  if (id === superAdmin.id) {
    return NextResponse.json(
      { error: "Pour votre propre compte, passez par Mon profil → Mot de passe." },
      { status: 400 },
    );
  }

  // Le membre doit exister dans l'équipe (et être visible du super-admin) :
  // on ne réinitialise pas un identifiant arbitraire.
  const supabase = await createClient();
  const { data: membre } = await supabase.from("users").select("id").eq("id", id).single();
  if (!membre) {
    return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
  }

  const motDePasse = genererMotDePasseProvisoire();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.updateUserById(id, { password: motDePasse });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Impossible de réinitialiser ce mot de passe." },
      { status: 400 },
    );
  }

  return NextResponse.json({ email: data.user.email, motDePasse });
}
