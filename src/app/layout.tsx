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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OfflineBanner />
        <InstallBanner />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
