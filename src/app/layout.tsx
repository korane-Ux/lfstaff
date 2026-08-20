import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { InstallBanner } from "@/components/pwa/install-banner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INSTALL_PROMPT_CAPTURE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <OfflineBanner />
        <InstallBanner />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
