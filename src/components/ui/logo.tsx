// La flamme du logo, sans son carré de fond (voir scripts/extraire-logo.mjs).
// L'image est un simple masque : la couleur vient du CSS (braise par
// défaut), ce qui la garde lisible en thème clair comme sombre.
const RATIO = 166 / 256; // largeur / hauteur de public/icons/logo-marque.png

export function Logo({
  hauteur = 40,
  className = "bg-braise",
  decoratif = false,
}: {
  hauteur?: number;
  className?: string;
  // true quand le nom « LFstaff » est déjà écrit à côté : inutile de le
  // faire lire deux fois par un lecteur d'écran.
  decoratif?: boolean;
}) {
  const masque = "url(/icons/logo-marque.png) center / contain no-repeat";
  return (
    <span
      role={decoratif ? undefined : "img"}
      aria-label={decoratif ? undefined : "LFstaff"}
      aria-hidden={decoratif || undefined}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: Math.round(hauteur * RATIO), height: hauteur, mask: masque, WebkitMask: masque }}
    />
  );
}
