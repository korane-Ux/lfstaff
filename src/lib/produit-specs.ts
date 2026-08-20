type Specs = {
  contenance_litres: number | null;
  diametre_cm: number | null;
  hauteur_cm: number | null;
  poids_kg: number | null;
};

export function formatSpecsMarmite(produit: Specs) {
  const parts: string[] = [];
  if (produit.contenance_litres) parts.push(`${produit.contenance_litres} L`);
  if (produit.diametre_cm) parts.push(`Ø ${produit.diametre_cm} cm`);
  if (produit.hauteur_cm) parts.push(`H ${produit.hauteur_cm} cm`);
  if (produit.poids_kg) parts.push(`${produit.poids_kg} kg`);
  return parts.join(" · ");
}
