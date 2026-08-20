import { ProduitForm } from "@/components/gestionnaire/produit-form";

export default function NouveauProduitPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-4">
      <h1 className="font-display text-2xl text-encre">Nouveau produit</h1>
      <ProduitForm />
    </main>
  );
}
