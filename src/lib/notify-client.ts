// Appel "fire and forget" : ne bloque jamais l'action principale (encaisser,
// expédier...) sur l'envoi d'un email — un souci de notification ne doit
// jamais empêcher le vrai travail de continuer.
export function notifierClientCommande(commandeId: string) {
  fetch("/api/notifications/commande", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commandeId }),
  }).catch(() => {});
}
