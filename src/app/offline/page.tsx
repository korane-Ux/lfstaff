export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-creme px-6 text-center">
      <p className="font-display text-2xl text-encre">Pas de connexion</p>
      <p className="max-w-xs text-encre/70">
        LFstaff a besoin du réseau pour cette page. Réessayez dès que vous captez du signal.
      </p>
    </main>
  );
}
