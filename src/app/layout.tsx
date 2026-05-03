import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context"; // Importation
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "WiFiLeads",
  description:
    "Transformez votre WiFi Zone en outil de fidélisation. Collectez les contacts de vos clients automatiquement. Conforme ARCEP 2026. Compatible MikroTik. Essai gratuit 7 jours.",
  keywords: [
    "wifi zone bénin",
    "logiciel mikrotik bénin",
    "portail captif afrique",
    "conformité arcep wifi",
    "fidéliser clients wifi togo",
    "enregistrer abonnés wifi",
  ],
  openGraph: {
    title: "WiFiLeads — Vos clients WiFi enregistrés automatiquement",
    description:
      "Collectez les contacts de vos clients WiFi dès leur connexion. Conforme ARCEP. Compatible MikroTik.",
    url: "https://wifileads.io",
    siteName: "WiFiLeads",
    locale: "fr_BJ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Bubblegum+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full min-h-screen overflow-x-clip">
        <AuthProvider>
          {" "}
          {/* Enveloppement */}
          {children}
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
