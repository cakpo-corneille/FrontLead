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
  Layout,
  ArrowRight,
  Zap,
  ShieldCheck,
  Activity,
} from 'lucide-react';
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
    try {
      await navigator.clipboard.writeText(snippet.trim());
      toast({ title: 'Copié!', description: 'Le code a été copié dans le presse-papiers.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de copier le code.' });
    }
  };

  const srcMatch = snippet.match(/src="([^"]*)"/);
  const srcUrl = srcMatch ? srcMatch[1] : '';

  const attrRegex = /([\w-]+)="([^"]*)"/g;
  const attributes: { key: string; value: string }[] = [];
  let match;
  while ((match = attrRegex.exec(snippet)) !== null) {
    if (match[1] !== 'src') {
      attributes.push({ key: match[1], value: match[2] });
    }
  }

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <Button
        variant="secondary"
        size="sm"
        className="absolute right-3 top-3 h-8 gap-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
        onClick={handleCopy}
      >
        <Clipboard className="h-3.5 w-3.5" />
        Copier
      </Button>
      <pre className="bg-[#0d1117] text-gray-100 p-6 text-sm font-mono overflow-x-auto leading-relaxed">
        <code>
          <span className="text-pink-400">&lt;script</span>
          <br />
          {srcUrl && (
            <>
              {'  '}
              <span className="text-sky-300">src</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-amber-300">"{srcUrl}"</span>
              <br />
            </>
          )}
          {attributes.map((attr, i) => (
            <span key={i}>
              {'  '}
              <span className="text-sky-300">{attr.key}</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-amber-300">"{attr.value}"</span>
              <br />
            </span>
          ))}
          <span className="text-pink-400">&gt;&lt;/script&gt;</span>
        </code>
      </pre>
    </div>
  );
}

function RouterOSCodeBlock({ snippet }: { snippet: string }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.trim());
      toast({ title: 'Copié !', description: 'Le script a été copié dans le presse-papiers.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de copier le script.' });
    }
  };

  // Coloration syntaxique RouterOS ligne par ligne
  const colorize = (line: string) => {
    // Commentaires
    if (line.trimStart().startsWith('#')) {
      return <span className="text-gray-500 italic">{line}</span>;
    }
    // Commandes /tool, /ip, etc.
    if (line.trimStart().startsWith('/')) {
      return <span className="text-teal-400">{line}</span>;
    }
    // Déclarations :local
    if (line.trimStart().startsWith(':local')) {
      const parts = line.match(/^(\s*:local\s+)(\w+)(\s+"?)(.*)("?)$/);
      if (parts) {
        return (
          <>
            <span className="text-pink-400">{parts[1]}</span>
            <span className="text-sky-300">{parts[2]}</span>
            <span className="text-gray-400">{parts[3]}</span>
            <span className="text-amber-300">{parts[4]}{parts[5]}</span>
          </>
        );
      }
    }
    // Lignes de continuation (indentées avec &, ., etc.)
    return <span className="text-gray-300">{line}</span>;
  };

  const lines = snippet.split('\n');

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <Button
        variant="secondary"
        size="sm"
        className="absolute right-3 top-3 h-8 gap-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
        onClick={handleCopy}
      >
        <Clipboard className="h-3.5 w-3.5" />
        Copier
      </Button>
      <pre className="bg-[#0d1117] text-gray-100 p-6 pt-10 text-sm font-mono overflow-x-auto leading-relaxed">
        <code>
          {lines.map((line, i) => (
            <span key={i}>
              {colorize(line)}
              {i < lines.length - 1 && '\n'}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function StepBadge({ n, color = 'blue' }: { n: number; color?: 'blue' | 'amber' | 'teal' | 'indigo' }) {
  const colors = {
    blue: 'bg-blue-600 text-white',
    amber: 'bg-amber-500 text-white',
    teal: 'bg-teal-500 text-white',
    indigo: 'bg-indigo-600 text-white',
  };
  return (
    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold shadow', colors[color])}>
      {n}
    </div>
  );
}

interface IntegrationContentProps {
  /** Si true, masque le bandeau header et les cartes de résumé pour s'intégrer dans une page Settings */
  embedded?: boolean;
}

export function IntegrationContent({ embedded = false }: IntegrationContentProps) {
  const { formConfig, fetchFormConfig, fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [apiHost, setApiHost] = useState('');
  const mediaHost = formConfig?.media_host ?? null;

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
          setApiHost(url.host);
        } catch {
          setApiHost('domaine-invalide.com');
        }
      }
    }
  }, [formConfig]);

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    try {
      const response = await fetchWithAuth('/schema/rotate_key/', { method: 'POST' });
      if (!response.ok) throw new Error('Erreur serveur');
      await fetchFormConfig();
      toast({ title: 'Nouvelle clé générée !', description: 'Mettez à jour votre snippet immédiatement.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de générer une clé.' });
    } finally {
      setIsRotatingKey(false);
    }
  };

  const handleCopyHost = async (host: string) => {
    if (!host) return;
    try {
      await navigator.clipboard.writeText(host);
      toast({ title: 'Copié !', description: 'Le domaine a été copié dans le presse-papiers.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de copier le domaine.' });
    }
  };

  return (
    <div className={cn('space-y-8', !embedded && 'max-w-4xl mx-auto pb-12')}>

      {!embedded && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-300" />
                <span className="text-teal-300 text-sm font-semibold uppercase tracking-wider">Déploiement</span>
              </div>
              <h1 className="text-3xl font-bold font-headline leading-tight">
                Intégrez le Widget
              </h1>
              <p className="text-blue-200 max-w-lg text-sm leading-relaxed">
                3 étapes simples pour connecter votre portail Wi-Fi et commencer à identifier vos clients.
              </p>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm shrink-0">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400" />
              <span className="text-sm text-white/90 font-medium">Prêt au déploiement</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />
        </div>
      )}

      {!embedded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Code2, label: 'Widget', desc: 'Snippet du formulaire', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { icon: Activity, label: 'Tracking', desc: 'Suivi des sessions Wi-Fi', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
            { icon: Globe, label: 'Walled Garden', desc: 'Autorisez notre domaine', color: 'text-blue-700', bg: 'bg-blue-50/60 border-blue-100' },
            { icon: ShieldCheck, label: 'Validation', desc: 'Testez en live', color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
          ].map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className={cn('rounded-xl border p-4 flex flex-col gap-2 transition-shadow hover:shadow-md', bg)}>
              <Icon className={cn('h-5 w-5', color)} />
              <p className={cn('text-sm font-semibold', color)}>{label}</p>
              <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      )}

      <Card className="overflow-hidden border-border shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 w-full" />
        <CardHeader className="bg-muted/70 border-b">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="bg-blue-900 p-3 rounded-xl text-white shadow-md">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-headline text-lg">Étape 1 — Snippet d'intégration</CardTitle>
                <CardDescription>Collez ce code dans le HTML de votre portail captif.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Placez ce script à l'intérieur de la balise{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-blue-800 font-semibold text-xs">&lt;head&gt;</code>
            </p>
            {!formConfig?.integration_snippet ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : (
              <CodeBlock snippet={formConfig.integration_snippet} />
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/60 hover:bg-card transition-colors">
              <StepBadge n={1} />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">Accès administrateur</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Connectez-vous à votre routeur (UniFi, Mikrotik…) et ouvrez la gestion du Portail Captif.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/60 hover:bg-card transition-colors">
              <StepBadge n={2} />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">Modification HTML</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Éditez le fichier <strong>login.html</strong> ou <strong>index.html</strong> et collez le script dans la section <strong>head</strong>.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/40 border-t px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
            Clé de sécurité active
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isRotatingKey} className="text-muted-foreground hover:text-red-600 hover:bg-red-50 text-xs gap-2">
                <RefreshCw className={cn('h-3.5 w-3.5', isRotatingKey && 'animate-spin')} />
                Régénérer la clé
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline">Rotation de clé</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action invalidera votre snippet actuel. Vous devrez mettre à jour le code sur votre portail captif immédiatement.
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

      <Card className="overflow-hidden border-border shadow-lg">
        <div className="h-1 bg-gradient-to-r from-indigo-600 to-purple-500 w-full" />
        <CardHeader className="bg-muted/70 border-b">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-700 p-3 rounded-xl text-white shadow-md">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-headline text-lg">Étape 2 — Tracking des sessions Wi-Fi</CardTitle>
                <CardDescription>Collez ces deux scripts RouterOS dans WinBox pour suivre chaque connexion en temps réel.</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">

          {/* Explication contextuelle */}
          <Alert className="bg-indigo-50/60 border-indigo-100 text-indigo-900">
            <Info className="h-4 w-4 text-indigo-600" />
            <AlertTitle className="font-bold text-sm">Comment ça fonctionne ?</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Ces scripts sont exécutés directement par votre routeur MikroTik à chaque connexion et déconnexion.
              Aucun fichier HTML à modifier — tout se passe côté routeur, dans <strong>WinBox</strong> sous{' '}
              <code className="bg-indigo-100 px-1 rounded">IP › Hotspot › User Profiles</code>.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Script on-login */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-teal-500" />
                <label className="text-sm font-semibold text-foreground">Script On Login</label>
              </div>
              {!formConfig?.tracking_snippet?.on_login ? (
                <Skeleton className="h-32 w-full rounded-xl" />
              ) : (
                <RouterOSCodeBlock snippet={formConfig.tracking_snippet.on_login} />
              )}
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-teal-50/50 border-teal-100">
                <StepBadge n={1} color="teal" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Ouverture de session</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dans WinBox, ouvrez le profil hotspot concerné et collez ce script dans le champ{' '}
                    <strong>On Login</strong>. Il est exécuté dès qu'un client se connecte.
                  </p>
                </div>
              </div>
            </div>

            {/* Script on-logout */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <label className="text-sm font-semibold text-foreground">Script On Logout</label>
              </div>
              {!formConfig?.tracking_snippet?.on_logout ? (
                <Skeleton className="h-32 w-full rounded-xl" />
              ) : (
                <RouterOSCodeBlock snippet={formConfig.tracking_snippet.on_logout} />
              )}
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-indigo-50/50 border-indigo-100">
                <StepBadge n={2} color="indigo" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Fermeture de session</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Collez ce script dans le champ <strong>On Logout</strong> du même profil.
                    Il est exécuté à la déconnexion et envoie la durée réelle et les données consommées.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guide WinBox */}
          <div className="rounded-xl border bg-muted/40 p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Où coller ces scripts dans WinBox ?</p>
            <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
              {[
                { n: 1, label: 'Ouvrez WinBox et connectez-vous à votre routeur' },
                { n: 2, label: 'IP › Hotspot › User Profiles › double-cliquez sur votre profil' },
                { n: 3, label: 'Collez le script On Login dans le champ correspondant' },
                { n: 4, label: 'Collez le script On Logout, puis cliquez sur OK' },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-start gap-2 flex-1">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{n}</span>
                  <span className="leading-relaxed">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border shadow-md">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-400 w-full" />
        <CardHeader className="bg-muted/70 border-b">
          <div className="flex items-center gap-4">
            <div className="bg-blue-800 p-3 rounded-xl text-white shadow-md">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-headline text-lg">Étape 3 — Walled Garden</CardTitle>
              <CardDescription>
                Autorisez notre domaine pour que le widget se charge avant l'authentification.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ajoutez ces domaines à la liste blanche (<em>Walled Garden / Pre-Auth Access</em>) de votre contrôleur Wi-Fi :
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-card border border-border p-3 px-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">API</span>
                {apiHost
                  ? <code className="font-mono font-bold text-blue-800 text-base truncate">{apiHost}</code>
                  : <Skeleton className="h-6 w-48" />
                }
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-blue-700 hover:bg-blue-50 shrink-0 ml-2"
                onClick={() => handleCopyHost(apiHost)}
                disabled={!apiHost}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>

            {(mediaHost || !formConfig) && (
              <div className="flex items-center justify-between bg-card border border-border p-3 px-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Média</span>
                  {mediaHost
                    ? <code className="font-mono font-bold text-teal-700 text-base truncate">{mediaHost}</code>
                    : <Skeleton className="h-6 w-48" />
                  }
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-teal-700 hover:bg-teal-50 shrink-0 ml-2"
                  onClick={() => handleCopyHost(mediaHost ?? '')}
                  disabled={!mediaHost}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/60 hover:bg-card transition-colors">
              <StepBadge n={1} />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">Trouver les paramètres</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Cherchez "Walled Garden", "Allowed Hostnames" ou "Accès Pré-authentification" dans votre portail captif.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/60 hover:bg-card transition-colors">
              <StepBadge n={2} />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">Autoriser le domaine</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Ajoutez une nouvelle entrée, collez le domaine copié ci-dessus, puis sauvegardez.</p>
              </div>
            </div>
          </div>

          <Alert className="bg-blue-50/60 border-blue-100 text-blue-900">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-bold text-sm">Pourquoi est-ce nécessaire ?</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Sans cette étape, votre routeur bloque le chargement du script. Le formulaire ne peut pas s'afficher.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border shadow-md">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-300 w-full" />
        <CardHeader className="bg-muted/40 border-b">
          <div className="flex items-center gap-4">
            <div className="bg-teal-500 p-3 rounded-xl text-white shadow-md">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-headline text-lg">Fonctionnement & Validation</CardTitle>
              <CardDescription>Comment le widget interagit avec votre portail captif.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { n: '01', label: 'Apparition', desc: 'Le widget s\'affiche instantanément par-dessus le portail.', color: 'border-blue-100 bg-blue-50/50', badge: 'bg-blue-900 text-white' },
              { n: '02', label: 'Collecte', desc: 'L\'utilisateur remplit le formulaire. Données envoyées au dashboard.', color: 'border-blue-100 bg-blue-50/50', badge: 'bg-blue-900 text-white' },
              { n: '03', label: 'Retrait', desc: 'L\'overlay disparaît. L\'utilisateur accède à internet.', color: 'border-teal-100 bg-teal-50/50', badge: 'bg-teal-500 text-white' },
            ].map(({ n, label, desc, color, badge }) => (
              <div key={n} className={cn('p-4 rounded-xl border space-y-2', color)}>
                <span className={cn('inline-block text-xs font-bold px-2 py-0.5 rounded-md', badge)}>{n}</span>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="checklist" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-5 py-4 font-semibold text-foreground text-sm">
                <span className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                  Checklist de validation
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pt-4 pb-6">
                <div className="space-y-4">
                  {[
                    'Vérifiez que le formulaire s\'affiche automatiquement après l\'ouverture du portail captif.',
                    'Testez la validation : l\'overlay doit se fermer pour laisser place à votre portail d\'origine.',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded-full border-2 border-teal-500 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground italic mt-2">
                    "Utilisez un appareil qui ne s'est jamais connecté à ce réseau Wi-Fi pour le test."
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold font-headline">Besoin d'aide pour l'installation ?</h3>
            <p className="text-blue-200/80 text-sm max-w-md leading-relaxed">
              Vous n'arrivez pas à configurer votre <strong className="text-white">UniFi</strong> ou votre <strong className="text-white">Mikrotik</strong> ? Nos experts vous guident pas à pas, gratuitement.
            </p>
          </div>
          <Button size="lg" asChild className="bg-teal-400 text-blue-900 hover:bg-teal-300 font-bold px-8 shadow-lg shadow-black/20 shrink-0 gap-2">
            <Link href="https://wa.me/22964861850" target="_blank">
              Contacter le support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-24 -mt-24 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full -ml-16 -mb-16 blur-[60px]" />
      </div>
    </div>
  );
}
