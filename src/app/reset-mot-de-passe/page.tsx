"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// Atterrissage du lien « mot de passe oublié ». /auth/callback a déjà
// échangé le code contre une session de récupération : l'utilisateur peut
// donc définir un nouveau mot de passe via updateUser.
export default function ResetMotDePassePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [voir, setVoir] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      setError("Choisis un mot de passe d'au moins 6 caractères.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError("Le lien a peut-être expiré. Redemande un e-mail de réinitialisation.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-creme px-6 py-8">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <Image src="/icons/icon-192.png" alt="LFstaff" width={56} height={56} priority />
          <h1 className="font-display text-3xl text-encre">Nouveau mot de passe</h1>
          <p className="text-center text-sm text-encre/65">Choisis un mot de passe, puis valide.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-3xl bg-surface p-6 shadow-sm">
          <label className="flex flex-col gap-1 text-sm text-encre">
            Mot de passe
            <div className="relative">
              <input
                type={voir ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-encre/15 bg-creme px-4 py-3 pr-12 text-base text-encre outline-none focus:border-braise"
              />
              <button
                type="button"
                onClick={() => setVoir((v) => !v)}
                aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-encre/50 transition-colors hover:text-encre"
              >
                {voir ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          {error && <p role="alert" className="text-sm text-litige">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enregistrement..." : "Valider le nouveau mot de passe"}
          </Button>
        </form>
      </div>
    </main>
  );
}
