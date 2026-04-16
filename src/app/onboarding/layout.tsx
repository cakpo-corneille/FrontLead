import { Logo } from '@/components/logo';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full flex flex-col bg-secondary overflow-y-auto">
      <header className="flex w-full shrink-0 items-center justify-center p-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline text-primary">WiFiLeads</span>
        </div>
      </header>
      <main className="flex w-full flex-1 flex-col items-center p-4 pt-0">
          {children}
      </main>
    </div>
  );
}
