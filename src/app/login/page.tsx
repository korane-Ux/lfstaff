"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { onboardingDejaVu } from "@/components/onboarding/onboarding-flow";

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
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-8 bg-creme px-6">
      <div className="flex flex-col items-center gap-2">
        <Image src="/icons/icon-192.png" alt="LFstaff" width={64} height={64} priority />
        <h1 className="font-display text-3xl text-encre">LFstaff</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-surface p-6 shadow-sm"
      >
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

        {error && <p className="text-sm text-litige">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-braise px-4 py-3 text-base font-medium text-creme transition-opacity disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
