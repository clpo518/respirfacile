import type { Metadata } from "next";
import "./globals.css";
import { InstallPWA } from "@/components/InstallPWA";
import { siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Respirfacile, rééducation respiratoire pour l'apnée du sommeil",
    template: `%s | ${siteName}`,
  },
  description:
    "L'application de thérapie myofonctionnelle orofaciale prescrite par les orthophonistes et les kinésithérapeutes. Exercices guidés au quotidien, suivi du praticien entre les séances. Essai 30 jours sans carte bancaire.",
  keywords: [
    "apnée du sommeil",
    "SAOS",
    "thérapie myofonctionnelle",
    "TMOF",
    "rééducation respiratoire",
    "orthophoniste",
    "kinésithérapeute",
    "exercices SAOS",
    "ronflement",
    "CPAP",
    "pause contrôlée",
    "cohérence cardiaque",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Respirfacile, rééducation respiratoire",
    description:
      "Prescrit par les orthophonistes et les kinésithérapeutes. Essai 30 jours sans carte bancaire.",
    siteName,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400;1,9..144,600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2D5016" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Respirfacile" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <InstallPWA />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
