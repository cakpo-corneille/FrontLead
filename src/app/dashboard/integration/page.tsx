'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clipboard, 
  Info, 
  RefreshCw, 
  Globe, 
  Code2, 
  CheckCircle2, 
  Layout
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { placeholderImages } from '@/lib/placeholder-images';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

function CodeBlock({ snippet }: { snippet: string }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    const textToCopy = snippet.trim();
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copié!',
        description: 'Le code a été copié dans le presse-papiers.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le code.',
      });
    }
  };

  const srcMatch = snippet.match(/src="([^"]*)"/);
  const keyMatch = snippet.match(/data-public-key="([^"]*)"/);
  const macMatch = snippet.match(/data-mac="([^"]*)"/);
  
  const srcUrl    = srcMatch ? srcMatch[1] : '';
  const publicKey = keyMatch ? keyMatch[1] : '';
  const dataMac   = macMatch ? macMatch[1] : '$(mac)';

  return (
    <div className="relative group">
      <Button
        variant="secondary"
        size="sm"
        className="absolute right-3 top-3 h-8 gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 border-none transition-all opacity-0 group-hover:opacity-100"
        onClick={handleCopy}
      >
        <Clipboard className="h-4 w-4" />
        Copier
      </Button>
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-6 text-sm font-mono overflow-x-auto border border-gray-700 shadow-inner">
        <code>
          <span className="text-pink-400">&lt;script</span>
          <br />
          {'  '}
          <span className="text-teal-300">src</span>
          <span className="text-white">=</span>
          <span className="text-amber-300">"{srcUrl}"</span>
          <br />
          {'  '}
          <span className="text-teal-300">data-public-key</span>
          <span className="text-white">=</span>
          <span className="text-amber-300">"{publicKey}"</span>
          <br />
          {'  '}
          <span className="text-teal-300">data-mac</span>
          <span className="text-white">=</span>
          <span className="text-amber-300">"{dataMac}"</span>
          <br />
          <span className="text-pink-400">&gt;&lt;/script&gt;</span>
        </code>
      </pre>
    </div>
  );
}

export default function IntegrationPage() {
  const { formConfig, fetchFormConfig, fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [apiHost, setApiHost] = useState('');

  useEffect(() => {
    fetchFormConfig();
  }, [fetchFormConfig]);

  useEffect(() => {
    if (formConfig?.integration_snippet) {
      const snippet = formConfig.integration_snippet;
      const srcMatch = snippet.match(/src="([^"]*)"/);
      if (srcMatch && srcMatch[1]) {
        try {
          const url = new URL(srcMatch[1]);
          setApiHost(url.host); // Corrected: use .host to include port
        } catch (error) {
          console.error("Invalid URL in snippet:", srcMatch[1]);
          setApiHost('domaine-invalide.com');
        }
      }
    }
  }, [formConfig]);

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    try {
      const response = await fetchWithAuth('/schema/rotate_key/', { method: 'POST' });
      if (!response.ok) throw new Error("Erreur serveur");
      await fetchFormConfig();
      toast({ title: 'Nouvelle clé générée !', description: 'Mettez à jour votre snippet immédiatement.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de générer une clé.' });
    } finally {
      setIsRotatingKey(false);
    }
  };
  
  const handleCopyHost = async () => {
    if (!apiHost) return;
    try {
      await navigator.clipboard.writeText(apiHost);
      toast({
        title: 'Copié !',
        description: 'Le domaine a été copié dans le presse-papiers.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le domaine.',
      });
    }
  };

  const step3 = placeholderImages.find(img => img.id === 'integration-step-3');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-inter">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl font-headline">
            Déploiement du Widget
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Suivez ces étapes simples pour intégrer notre widget à votre portail Wi-Fi et commencer à transformer vos visiteurs en contacts qualifiés.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 p-2 rounded-lg border border-gray-200">
          <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          Status: Prêt pour déploiement
        </div>
      </div>

      <div className="grid gap-8">
        {/* ÉTAPE 1: SNIPPET */}
        <Card className="border-gray-200 shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-gray-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-900 p-3 rounded-lg text-white shadow-md">
                  <Code2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">Étape 1 : Installation du Snippet</CardTitle>
                  <CardDescription>Copiez ce code unique dans le fichier HTML de votre portail.</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Placez ce script juste avant la balise de fermeture <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-900 font-bold">&lt;/body&gt;</code></span>
              </div>
              {!formConfig?.integration_snippet ? (
                <Skeleton className="h-32 w-full rounded-xl" />
              ) : (
                <CodeBlock snippet={formConfig.integration_snippet} />
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border bg-gray-50/50 hover:bg-white transition-colors border-gray-100 flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-900/10 text-blue-900 flex items-center justify-center shrink-0 text-sm font-bold shadow-sm">1</div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-800 text-sm">Accès Administrateur</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Connectez-vous à l'interface de votre routeur (UniFi, Mikrotik, etc.) et accédez à la gestion du Portail Captif.</p>
                </div>
              </div>
              <div className="p-5 rounded-xl border bg-gray-50/50 hover:bg-white transition-colors border-gray-100 flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-900/10 text-blue-900 flex items-center justify-center shrink-0 text-sm font-bold shadow-sm">2</div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-800 text-sm">Modification HTML</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Éditez le fichier <strong>login.html</strong> ou <strong>index.html</strong> et collez le script à la toute fin du fichier.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 border-t px-6 py-4 flex justify-between items-center">
            <p className="text-xs text-gray-500">Clé de sécurité active</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isRotatingKey} className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs">
                  <RefreshCw className={cn("mr-2 h-3 w-3", isRotatingKey && "animate-spin")} />
                  Régénérer la clé
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline">Rotation de clé</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action invalidera votre snippet actuel. Vous devrez impérativement mettre à jour le code sur votre portail captif immédiatement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRotateKey} className="bg-red-600 hover:bg-red-700">Générer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        {/* ÉTAPE 2: WALLED GARDEN */}
        <Card className="border-amber-200 bg-amber-50/60 overflow-hidden shadow-sm">
          <div className="h-1.5 bg-amber-400 w-full" />
          <CardHeader className="flex flex-row items-start space-x-4">
            <div className="bg-amber-100 p-3 rounded-lg text-amber-600 shadow-sm">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-amber-900 font-headline text-xl">Étape 2 : Configuration du Walled Garden</CardTitle>
              <CardDescription className="text-amber-800/80">
                Autorisez notre domaine pour que le widget puisse se charger avant l'authentification.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-amber-900/80 leading-relaxed">
               Pour que le script puisse s'afficher, vous devez ajouter notre domaine à la "liste blanche" (Walled Garden / Pre-Auth Access) de votre contrôleur Wi-Fi :
              </p>
              <div className="relative group flex items-center justify-between bg-white border border-amber-200 p-3 pr-2 rounded-xl shadow-inner">
                {apiHost ? 
                  <code className="font-mono font-bold text-amber-700 text-lg truncate">{apiHost}</code>
                  : <Skeleton className="h-6 w-48" />
                }
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-amber-600 hover:bg-amber-100 shrink-0"
                  onClick={handleCopyHost}
                  disabled={!apiHost}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border bg-amber-50/50 hover:bg-white transition-colors border-amber-100 flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-amber-600/10 text-amber-700 flex items-center justify-center shrink-0 text-sm font-bold shadow-sm">1</div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-800 text-sm">Trouver les Paramètres</p>
                  <p className="text-xs text-amber-600 leading-relaxed">Dans les réglages de votre portail captif, cherchez "Walled Garden", "Allowed Hostnames" ou "Accès Pré-authentification".</p>
                </div>
              </div>
              <div className="p-5 rounded-xl border bg-amber-50/50 hover:bg-white transition-colors border-amber-100 flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-amber-600/10 text-amber-700 flex items-center justify-center shrink-0 text-sm font-bold shadow-sm">2</div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-800 text-sm">Autoriser le Domaine</p>
                  <p className="text-xs text-amber-600 leading-relaxed">Ajoutez une nouvelle entrée à la liste, collez le domaine copié, et sauvegardez les changements.</p>
                </div>
              </div>
            </div>

            <Alert className="bg-amber-100/70 border-amber-200 text-amber-900">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="font-bold">Pourquoi est-ce nécessaire ?</AlertTitle>
              <AlertDescription>
                Sans cette étape, le routeur bloque notre script. Le formulaire ne pourra donc pas s'afficher sur votre portail.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* CARD 3: FONCTIONNEMENT */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/30">
            <CardTitle className="flex items-center gap-3 font-headline">
              <Layout className="h-5 w-5 text-teal-500" />
              Fonctionnement & Validation
            </CardTitle>
            <CardDescription>Comprendre comment le widget interagit avec votre portail actuel.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid md:grid-cols-3 gap-6 my-6">
              <div className="space-y-2">
                <Badge className="bg-blue-900 text-white">01. Apparition</Badge>
                <p className="text-xs text-gray-600 leading-relaxed">Le portail captif s'ouvre, puis notre widget s'affiche <strong>instantanément par-dessus</strong>.</p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-blue-900 text-white">02. Collecte</Badge>
                <p className="text-xs text-gray-600 leading-relaxed">L'utilisateur remplit le formulaire. Les données sont envoyées à votre dashboard.</p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-teal-500 text-white">03. Retrait</Badge>
                <p className="text-xs text-gray-600 leading-relaxed">Une fois validé, <strong>l'overlay disparaît</strong>, et l'utilisateur peut se connecter à internet.</p>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-guide" className="border-gray-200">
                <AccordionTrigger className="hover:no-underline hover:bg-gray-50 px-4 py-3 rounded-xl transition-colors font-headline text-gray-700">
                  <span className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    Checklist de Validation
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 px-4 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                       <div className="flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full border-2 border-teal-500 flex-shrink-0" />
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          Vérifiez que le formulaire s'affiche bien <strong>automatiquement</strong> après l'ouverture du portail captif.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full border-2 border-teal-500 flex-shrink-0" />
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          Testez la validation : l'overlay doit se fermer pour laisser place à votre portail d'origine.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 pt-2">
                         <p className="text-sm text-gray-500 italic">"Utilisez un appareil qui ne s'est jamais connecté à ce réseau Wi-Fi pour faire le test."</p>
                      </div>
                    </div>
                    {step3 && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border shadow-inner bg-gray-100 group">
                        <Image src={step3.imageUrl} alt="Validation Test" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="p-8 bg-blue-900 text-white rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-2xl font-bold font-headline">Assistance Technique Gratuite</h3>
            <p className="text-blue-200/80 max-w-lg leading-relaxed">
              Vous n'arrivez pas à configurer votre <strong>UniFi Controller</strong> ou votre <strong>Mikrotik</strong> ? Nos experts vous guident pas à pas.
            </p>
          </div>
          <Button size="lg" asChild className="bg-teal-400 text-blue-900 hover:bg-teal-400/90 font-bold px-8 shadow-lg shadow-black/20">
            <Link href="https://wa.me/22964861850" target="_blank">Contacter le support</Link>
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full -ml-20 -mb-20 blur-[80px]" />
      </div>
    </div>
  );
}