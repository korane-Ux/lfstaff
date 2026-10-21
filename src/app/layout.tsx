import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Fraunces } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { InstallBanner } from "@/components/pwa/install-banner";
import { Providers } from "@/components/providers";
import { PREFERENCES_INIT_SCRIPT } from "@/lib/preferences-store";
import "./globals.css";

// Titres : Fraunces, la voix de la marque (chaleureuse, artisanale).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

// Texte courant : Atkinson Hyperlegible, dessinée par le Braille Institute
// pour les personnes malvoyantes — chaque lettre se distingue des autres
// (I/l/1, O/0, rn/m…), ce qui sert tout le monde, y compris en plein
// soleil sur un écran de téléphone.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin", "latin-ext"],
  // Next.js ne connaît pas les métriques de cette police pour ajuster
  // automatiquement la police de secours (avertissement au démarrage) :
  // on désactive l'ajustement et on nomme un repli système explicite.
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: "LFstaff",
  description:
    "L'outil interne du staff Le Foyer — commandes, fonte, transit et livraison des marmites.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LFstaff",
  },
  other: {
    // Next.js n'émet plus que la balise non préfixée "mobile-web-app-capable" ;
    // iOS Safari ignore celle-ci et a besoin de la balise préfixée "apple-"
    // pour lancer l'app en plein écran (sans barre d'adresse) depuis l'écran
    // d'accueil — sans elle, l'icône ajoutée rouvre un simple onglet Safari.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#B23A1C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Appliqué avant l'hydratation pour éviter un flash du mauvais thème au
// chargement : lit la préférence mémorisée (voir theme-toggle.tsx) et pose
// l'attribut data-theme sur <html> avant le premier rendu visible.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var t = localStorage.getItem("lfstaff-theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
`;

// Chrome peut déclencher beforeinstallprompt avant que React/l'effet de
// InstallBanner soit prêt à l'écouter — l'événement est alors perdu pour
// de bon (il ne se redéclenche pas). On l'attrape ici, le plus tôt possible,
// et InstallBanner va le relire sur window au montage.
const INSTALL_PROMPT_CAPTURE_SCRIPT = `
(function () {
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.__lfstaffInstallPrompt = e;
  });
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${atkinson.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_CAPTURE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <OfflineBanner />
          <InstallBanner />
          {children}
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
