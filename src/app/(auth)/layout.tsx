import { Logo } from '@/components/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen lg:grid-cols-2 overflow-hidden">
      <div className="hidden bg-primary lg:flex lg:flex-col lg:p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/20 p-2 rounded-lg">
                <Logo className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-headline">WiFiLeads</span>
          </div>
          <div className="my-auto">
            <h1 className="font-headline text-4xl font-bold leading-tight">
            Capturez des leads via WiFi.
            <br />
            Automatisé. Simple.
            </h1>
            <p className="mt-4 max-w-md text-primary-foreground/80">
            Transformez votre WiFi gratuit en un puissant canal marketing. Collectez emails, numéros de téléphone et insights clients automatiquement.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/60">
            &copy; {new Date().getFullYear()} WiFiLeads. Tous droits réservés.
          </p>
      </div>
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
            {children}
        </div>
      </div>
    </div>
  );
}