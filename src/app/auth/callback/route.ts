import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Rappel des liens de connexion par e-mail (lien magique / OTP).
// Supabase renvoie l'utilisateur ici avec un ?code=... qu'on échange
// contre une session (le flux PKCE de @supabase/ssr dépose les cookies).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Derrière Vercel, request.url porte l'hôte interne : on reconstruit
      // l'URL publique à partir de l'en-tête transmis par le proxy.
      const forwardedHost = request.headers.get("x-forwarded-host");
      const base = process.env.NODE_ENV === "development" || !forwardedHost
        ? origin
        : `https://${forwardedHost}`;
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erreur=lien`);
}
