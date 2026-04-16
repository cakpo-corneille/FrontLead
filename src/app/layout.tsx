import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context'; // Importation

export const metadata: Metadata = {
  title: 'WiFiLeads',
  description: 'Collectez facilement les données de vos clients via un portail WiFi captif.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Bubblegum+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-screen overflow-hidden">
        <AuthProvider> {/* Enveloppement */} 
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
