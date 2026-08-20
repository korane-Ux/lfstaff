import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Si Supabase est mal configuré (variables d'environnement manquantes
  // sur ce déploiement) ou injoignable, mieux vaut laisser passer la
  // requête que de faire planter le proxy pour absolument toutes les
  // pages du site — chaque page ira de toute façon échouer plus
  // précisément à son propre point d'accès aux données.
  let user = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // getUser() (pas getSession()) : revalide le token auprès de Supabase à
    // chaque requête plutôt que de faire confiance au cookie tel quel.
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    console.error("Proxy : impossible de vérifier la session Supabase.", error);
    return response;
  }

  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (!user && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
