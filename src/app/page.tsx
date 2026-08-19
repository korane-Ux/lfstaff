import Image from "next/image";

const ETATS = [
  { label: "Nouvelle", color: "bg-gris" },
  { label: "Validée", color: "bg-laiton" },
  { label: "Avance envoyée", color: "bg-laiton-fonce" },
  { label: "En création", color: "bg-creation" },
  { label: "Expédiée", color: "bg-ocre" },
  { label: "Reçue", color: "bg-ocre-fonce" },
  { label: "En livraison", color: "bg-braise" },
  { label: "Livrée & validée", color: "bg-vert" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-creme px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-surface p-8 text-center shadow-sm">
        <Image src="/icons/icon-192.png" alt="LFstaff" width={72} height={72} priority />
        <h1 className="font-display text-3xl text-encre">LFstaff</h1>
        <p className="text-sm text-encre/70">
          L&apos;outil interne du staff Le Foyer — commandes, fonte, transit et livraison.
        </p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        {ETATS.map((etat) => (
          <div
            key={etat.label}
            className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-left"
          >
            <span className={`h-3 w-3 shrink-0 rounded-full ${etat.color}`} />
            <span className="text-xs text-encre/80">{etat.label}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
