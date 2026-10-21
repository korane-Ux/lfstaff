// Mots de passe provisoires (création de compte, réinitialisation par le
// super-admin) : ils sont souvent dictés au téléphone ou recopiés depuis
// WhatsApp, donc sans caractères ambigus (0/O, 1/l/I) et en deux groupes
// lisibles, ex. « Kp7m-3Rqx ».
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

// crypto.getRandomValues (et non Math.random, prévisible) + tirage par
// rejet : on écarte les octets qui biaiseraient la répartition modulo la
// taille de l'alphabet.
function caractereAleatoire(): string {
  const limite = 256 - (256 % ALPHABET.length);
  const octet = new Uint8Array(1);
  do {
    crypto.getRandomValues(octet);
  } while (octet[0] >= limite);
  return ALPHABET[octet[0] % ALPHABET.length];
}

export function genererMotDePasseProvisoire(): string {
  const groupe = () => Array.from({ length: 4 }, caractereAleatoire).join("");
  return `${groupe()}-${groupe()}`;
}
