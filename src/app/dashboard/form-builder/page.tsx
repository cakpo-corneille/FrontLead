'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import {
  Loader2,
  Pencil,
  Sparkles,
  Image as ImageIcon,
  Palette,
  Check,
  Smartphone,
  ShieldCheck,
  UserCheck,
  Users,
  UserPlus,
  GitMerge,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FormPreview } from '@/components/dashboard/form-preview';
import { FormOverlayPreview } from '@/components/dashboard/form-overlay-preview';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import type { ConflictStrategy } from '@/lib/types';

const FEATURES = [
  { icon: Sparkles, label: 'Génération assistée', desc: 'Créez votre formulaire en quelques secondes.' },
  { icon: Palette, label: 'Personnalisation', desc: 'Titre, description, couleurs et bouton sur mesure.' },
  { icon: ImageIcon, label: 'Logo & identité', desc: 'Ajoutez votre logo pour renforcer votre marque.' },
  { icon: Smartphone, label: 'Rendu mobile', desc: 'Aperçu temps réel sur l\u2019écran de vos clients.' },
  { icon: Check, label: 'Vérification par code', desc: 'Validez chaque numéro pour des contacts fiables.' },
];

type ConflictChoice = {
  value: ConflictStrategy | 'MERGE';
  title: string;
  desc: string;
  icon: typeof UserCheck;
  recommended?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
};

const CONFLICT_CHOICES: ConflictChoice[] = [
  {
    value: 'REQUIRE_OTP',
    title: 'Demander une vérification',
    desc: 'Le client doit confirmer son identité avec un code.',
    icon: ShieldCheck,
    recommended: true,
  },
  {
    value: 'MERGE',
    title: 'Fusionner les informations',
    desc: 'Associer le nouvel appareil au client déjà connu.',
    icon: GitMerge,
    disabled: true,
    comingSoon: true,
  },
  {
    value: 'ALLOW',
    title: 'Enregistrer comme nouveau client',
    desc: 'Créer une nouvelle fiche, sans vérification.',
    icon: UserPlus,
  },
];

export default function FormBuilderSelectionPage() {
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();
  const { toast } = useToast();

  const [isOpt, setIsOpt] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('ALLOW');
  const [isSaving, setIsSaving] = useState(false);

  const hasInitialized = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedConfig = useRef<{
    opt: boolean;
    isEnabled: boolean;
    conflictStrategy: ConflictStrategy;
  } | null>(null);

  useEffect(() => {
    if (!formConfig) {
      if (fetchFormConfig) fetchFormConfig();
      return;
    }
    if (!hasInitialized.current) {
      setIsOpt(formConfig.opt ?? false);
      setIsEnabled(formConfig.enable ?? true);
      setConflictStrategy(formConfig.conflict_strategy ?? 'ALLOW');
      lastSavedConfig.current = {
        opt: formConfig.opt ?? false,
        isEnabled: formConfig.enable ?? true,
        conflictStrategy: formConfig.conflict_strategy ?? 'ALLOW',
      };
      hasInitialized.current = true;
    }
  }, [formConfig, fetchFormConfig]);

  useEffect(() => {
    if (!hasInitialized.current || !formConfig || !fetchWithAuth) return;

    const configChanged =
      lastSavedConfig.current?.opt !== isOpt ||
      lastSavedConfig.current?.isEnabled !== isEnabled ||
      lastSavedConfig.current?.conflictStrategy !== conflictStrategy;

    if (!configChanged) return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    const saveConfiguration = async () => {
      setIsSaving(true);
      try {
        const response = await fetchWithAuth('/schema/update-schema/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formConfig.name,
            schema: formConfig.schema,
            enable: isEnabled,
            opt: isOpt,
            conflict_strategy: conflictStrategy,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.opt?.[0] || data.detail || 'Échec de la sauvegarde.');
        }
        lastSavedConfig.current = { opt: isOpt, isEnabled, conflictStrategy };
        if (fetchFormConfig) await fetchFormConfig();
      } catch (error) {
        toast({ title: 'Erreur', description: (error as Error).message, variant: 'destructive' });
        if (lastSavedConfig.current) {
          setIsOpt(lastSavedConfig.current.opt);
          setIsEnabled(lastSavedConfig.current.isEnabled);
          setConflictStrategy(lastSavedConfig.current.conflictStrategy);
        }
      } finally {
        setIsSaving(false);
      }
    };

    debounceTimeout.current = setTimeout(saveConfiguration, 1000);
    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [isOpt, isEnabled, conflictStrategy, formConfig, fetchWithAuth, toast, fetchFormConfig]);

  const renderFormFields = () => {
    const fields = formConfig?.schema?.fields ?? [];
    if (fields.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun champ défini. Cliquez sur Éditer pour configurer votre formulaire.
        </p>
      );
    }
    return fields.map((field) => (
      <div key={field.name}>
        <Label htmlFor={`preview-${field.name}`} className="text-xs font-medium text-foreground">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </Label>
        {field.type === 'phone' ? (
          <PhoneInput
            id={`preview-${field.name}`}
            value=""
            onChange={() => {}}
            disabled
            placeholder={field.placeholder}
            className="mt-1"
          />
        ) : (
          <Input
            id={`preview-${field.name}`}
            type={field.type}
            placeholder={field.placeholder}
            disabled
            className="mt-1 h-8 bg-muted"
          />
        )}
      </div>
    ));
  };

  if (!formConfig) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-headline">Formulaire</h1>
          <p className="text-muted-foreground">Configurez l&apos;identification de vos clients.</p>
        </div>
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Formulaire</h1>
        <p className="text-muted-foreground">
          Configurez la façon dont vos clients sont identifiés sur votre WiFi.
        </p>
      </div>

      {/* ─── Section 1 : Identification ─────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Identification des clients</CardTitle>
            <CardDescription>
              Collecter les informations des utilisateurs via le WiFi.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="form-enable" className="text-sm font-medium">
                Afficher le formulaire à la connexion
              </Label>
              <p className="text-xs text-muted-foreground">
                Vos clients voient le formulaire avant d&apos;accéder à internet.
              </p>
            </div>
            <Switch
              id="form-enable"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 2 : Vérification ──────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Vérification des informations</CardTitle>
            <CardDescription>
              S&apos;assurer que les coordonnées des clients sont valides.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 pr-4">
              <Label htmlFor="verification-toggle" className="text-sm font-medium">
                Vérifier le numéro par code{' '}
                <span className="text-xs font-normal text-emerald-700">
                  (recommandé)
                </span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Un code est envoyé au client pour confirmer son numéro.
                Nécessite un champ téléphone dans votre formulaire.
              </p>
            </div>
            <Switch
              id="verification-toggle"
              checked={isOpt}
              onCheckedChange={setIsOpt}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 3 : Client déjà enregistré ────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Client déjà enregistré</CardTitle>
            <CardDescription>
              Quand un client utilise des informations déjà connues sur un nouvel
              appareil. Toutes les situations sont visibles dans{' '}
              <Link
                href="/dashboard/alerts"
                className="underline underline-offset-2 text-blue-700 hover:text-blue-900"
              >
                Alertes
              </Link>.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div
            role="radiogroup"
            aria-label="Comportement quand un client est déjà enregistré"
            className="space-y-2"
          >
            {CONFLICT_CHOICES.map((choice) => {
              const isSelected =
                !choice.disabled && conflictStrategy === choice.value;
              const Icon = choice.icon;
              return (
                <button
                  key={choice.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={choice.disabled}
                  onClick={() => {
                    if (choice.disabled) return;
                    setConflictStrategy(choice.value as ConflictStrategy);
                  }}
                  className={cn(
                    'w-full text-left rounded-lg border p-4 transition-all flex items-start gap-3',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                      : 'border-border hover:border-border hover:bg-muted/50',
                    choice.disabled && 'opacity-60 cursor-not-allowed hover:border-border hover:bg-transparent',
                  )}
                >
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                      isSelected ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {choice.title}
                      </p>
                      {choice.recommended && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          recommandé
                        </span>
                      )}
                      {choice.comingSoon && (
                        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {choice.desc}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'mt-1 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-border bg-card',
                    )}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-card" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {isSaving && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-3">
              <Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde en cours…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Aperçu + Avantages côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aperçu du formulaire */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Aperçu du formulaire</CardTitle>
            <CardDescription>
              Rendu actuel affiché à vos clients sur le WiFi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center py-6">
            <FormPreview>
              <FormOverlayPreview>
                <>{renderFormFields()}</>
              </FormOverlayPreview>
            </FormPreview>
          </CardContent>
        </Card>

        {/* Fonctionnalités + bouton Éditer */}
        <Card className="flex flex-col bg-gradient-to-br from-blue-900 to-blue-950 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Ce que vous pouvez faire</CardTitle>
            <CardDescription className="text-blue-200">
              Personnalisez votre formulaire selon vos besoins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-6">
            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-blue-200/80 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="w-full bg-teal-400 text-blue-900 hover:bg-teal-300 font-bold shadow-lg"
            >
              <Link href="/dashboard/form-builder/edit">
                <Pencil className="mr-2 h-4 w-4" />
                Éditer le formulaire
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
