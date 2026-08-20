import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icons/|manifest.webmanifest|sw.js|icon.png|apple-icon.png|offline).*)",
  ],
};
