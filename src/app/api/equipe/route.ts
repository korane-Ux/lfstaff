import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";
import { genererMotDePasseProvisoire } from "@/lib/mot-de-passe";

const ROLES_CREABLES: AppRole[] = ["gestionnaire", "fournisseur", "livreur"];

export async function POST(request: Request) {
  await requireRole(["super_admin"]);

  const body = await request.json();
  const { nom, email, telephone, role, ville } = body as {
    nom?: string;
    email?: string;
    telephone?: string;
    role?: AppRole;
    ville?: string;
  };

  if (!nom || !email || !role || !ROLES_CREABLES.includes(role)) {
    return NextResponse.json({ error: "Champs manquants ou rôle invalide." }, { status: 400 });
  }

  const motDePasse = genererMotDePasseProvisoire();
  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Impossible de créer le compte." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.user.id,
    nom,
    telephone: telephone || null,
    role,
    ville: ville || null,
    actif: true,
  });

  if (insertError) {
    // Deux systèmes distincts (auth GoTrue + table users), pas de vraie
    // transaction possible entre les deux : on annule manuellement le
    // compte auth pour ne pas laisser un utilisateur "fantôme" sans profil.
    await admin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: "Impossible d'enregistrer le profil." }, { status: 400 });
  }

  return NextResponse.json({ email, motDePasse });
}
