import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowRight, BarChart3, Menu, Router, Users, Zap } from 'lucide-react';
import { Logo } from '@/components/logo';
import { placeholderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Constructeur de formulaires IA',
    description:
      'Créez des formulaires de portail captif en décrivant simplement les champs souhaités. Notre IA peut même suggérer des questions pertinentes.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Analyses en temps réel',
    description:
      'Obtenez des informations instantanées sur les données collectées via des tableaux de bord et des graphiques clairs.',
  },
  {
    icon: <Router className="h-8 w-8 text-primary" />,
    title: 'Intégration facile du routeur',
    description:
      "Recevez des extraits de code pour une intégration transparente avec n\'importe quel routeur, ce qui simplifie la configuration.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Interaction simplifiée',
    description:
      'Utilisez des questions intelligemment intégrées pour améliorer l’engagement des utilisateurs et collecter les informations dont vous avez besoin.',
  },
];

export default function LandingPage() {
  const heroImage = placeholderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex h-full flex-col bg-background overflow-y-auto overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="mr-4 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="hidden font-bold font-headline sm:inline-block">WiFiLeads</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Link href="/signup">
                S'inscrire <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    A mobile navigation menu with links to login and sign up.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col space-y-6 text-lg mt-8">
                  <Link href="/login" className="text-muted-foreground hover:text-foreground">
                    Connexion
                  </Link>
                  <Link href="/signup" className="font-semibold text-foreground">
                    S'inscrire
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container text-center px-2 sm:px-6 lg:px-8">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl break-words">
              Optimisez la collecte de données de vos clients via votre portail WiFi
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              WiFiLeads vous permet de collecter rapidement des informations sur les clients de votre zone WiFi via un portail captif simple et efficace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <Link href="/signup">Commencer gratuitement</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">En savoir plus</Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="visual"
          className="container py-16 md:py-24 lg:py-32 px-2 sm:px-6 lg:px-8"
        >
          {heroImage && (
             <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-2xl">
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={1200}
                    height={675}
                    className="w-full"
                    data-ai-hint={heroImage.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
             </div>
          )}
        </section>

        <section id="features" className="bg-secondary py-16 md:py-24 lg:py-32">
          <div className="container px-2 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Fonctionnalités clés
              </h2>
              <p className="mt-4 text-muted-foreground">
                Découvrez comment WiFiLeads peut simplifier votre processus de collecte de données.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col w-full">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="font-headline mt-4 break-words">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 lg:py-32">
          <div className="container text-center px-2 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Prêt à mieux connaître vos clients ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Rejoignez WiFiLeads aujourd'hui et commencez à collecter des informations précieuses à chaque connexion.
            </p>
            <div className="mt-6">
              <Button size="lg" asChild className="w-full sm:w-auto px-6 sm:px-8" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                <Link href="/signup">
                  Créer votre compte <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex h-auto min-h-16 flex-col items-center justify-center gap-4 py-4 sm:h-16 sm:flex-row sm:justify-between px-4">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4">
            <Logo className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} WiFiLeads. Tous droits réservés.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Termes
            </Link>
            <Link href="#" className="hover:text-foreground">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
