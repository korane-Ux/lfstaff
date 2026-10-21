"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { onboardingDejaVu } from "@/components/onboarding/onboarding-flow";
import { Button } from "@/components/ui/button";
import { LoginCarousel } from "@/components/auth/login-carousel";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voirMdp, setVoirMdp] = useState(false);
  const [resetEnCours, setResetEnCours] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.replace(onboardingDejaVu() ? "/" : "/bienvenue");
    router.refresh();
  }

  // Mot de passe oublié : Supabase envoie un e-mail avec un lien de
  // réinitialisation qui ramène sur /auth/callback (échange du code contre
  // une session de récupération) puis vers /reset-mot-de-passe.
  async function handleReset() {
    if (!email) {
      setInfo(null);
      setError("Entre d'abord ton adresse e-mail, puis reclique sur le lien.");
      return;
    }

    setResetEnCours(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-mot-de-passe`,
    });

    setResetEnCours(false);

    if (resetError) {
      setError("Impossible d'envoyer l'e-mail pour le moment. Réessaie dans un instant.");
      return;
    }

    setInfo("E-mail envoyé ! Ouvre le lien reçu pour choisir un nouveau mot de passe (pense aux indésirables).");
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col gap-6 bg-creme px-6 py-8 md:flex-row md:items-center md:justify-center md:gap-10 md:px-10">
      <div className="mx-auto w-full max-w-sm md:w-1/2 md:max-w-md md:self-stretch md:py-8">
        <LoginCarousel />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-8 md:w-1/2 md:max-w-sm">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo hauteur={64} />
          <h1 className="font-display text-3xl text-encre">LFstaff</h1>
          <p className="text-sm text-encre/65 md:text-left">Connecte-toi pour continuer.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-3xl bg-surface p-6 shadow-sm">
          <label className="flex flex-col gap-1 text-sm text-encre">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-encre">
            Mot de passe
            <div className="relative">
              <input
                type={voirMdp ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-encre/15 bg-creme px-4 py-3 pr-12 text-base text-encre outline-none focus:border-braise"
              />
              <button
                type="button"
                onClick={() => setVoirMdp((v) => !v)}
                aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-encre/50 transition-colors hover:text-encre"
              >
                {voirMdp ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          {error && <p role="alert" className="text-sm text-litige">{error}</p>}
          {info && <p role="status" className="text-sm text-vert">{info}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <button
            type="button"
            onClick={handleReset}
            disabled={resetEnCours}
            className="text-center text-xs text-encre/60 underline-offset-2 transition-colors hover:text-encre hover:underline disabled:opacity-60"
          >
            {resetEnCours ? "Envoi de l'e-mail..." : "Mot de passe oublié ?"}
          </button>
        </form>
      </div>
    </main>
  );
}
