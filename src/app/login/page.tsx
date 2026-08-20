"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { onboardingDejaVu } from "@/components/onboarding/onboarding-flow";
import { Button } from "@/components/ui/button";
import { LoginCarousel } from "@/components/auth/login-carousel";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

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

  return (
    <main className="flex min-h-dvh flex-1 flex-col gap-6 bg-creme px-6 py-8 md:flex-row md:items-center md:justify-center md:gap-10 md:px-10">
      <div className="mx-auto w-full max-w-sm md:w-1/2 md:max-w-md md:self-stretch md:py-8">
        <LoginCarousel />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-8 md:w-1/2 md:max-w-sm">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Image src="/icons/icon-192.png" alt="LFstaff" width={56} height={56} priority />
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
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-encre/15 bg-creme px-4 py-3 text-base text-encre outline-none focus:border-braise"
            />
          </label>

          {error && <p role="alert" className="text-sm text-litige">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </main>
  );
}
