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
import { Loader2, Pencil, Sparkles, Image as ImageIcon, Palette, Check, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FormPreview } from '@/components/dashboard/form-preview';
import { FormOverlayPreview } from '@/components/dashboard/form-overlay-preview';
import { Switch } from '@/components/ui/switch';
import { PhoneInput } from '@/components/ui/phone-input';

const FEATURES = [
  { icon: Sparkles, label: 'Génération IA', desc: 'Créez votre formulaire en quelques secondes grâce à l\'IA.' },
  { icon: Palette, label: 'Personnalisation', desc: 'Titre, description, couleurs et bouton sur mesure.' },
  { icon: ImageIcon, label: 'Logo & branding', desc: 'Ajoutez votre logo pour renforcer votre identité visuelle.' },
  { icon: Smartphone, label: 'Rendu mobile', desc: 'Aperçu temps réel du widget sur le portail captif.' },
  { icon: Check, label: 'Double Opt-In', desc: 'Vérification SMS pour des leads certifiés.' },
];

export default function FormBuilderSelectionPage() {
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();
  const { toast } = useToast();

  const [isDoubleOptIn, setIsDoubleOptIn] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasInitialized = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedConfig = useRef<{ doubleOptIn: boolean; isEnabled: boolean } | null>(null);

  useEffect(() => {
    if (!formConfig) {
      if (fetchFormConfig) fetchFormConfig();
      return;
    }
    if (!hasInitialized.current) {
      setIsDoubleOptIn(formConfig.double_opt_enable ?? false);
      setIsEnabled(formConfig.enable ?? true);
      lastSavedConfig.current = {
        doubleOptIn: formConfig.double_opt_enable ?? false,
        isEnabled: formConfig.enable ?? true,
      };
      hasInitialized.current = true;
    }
  }, [formConfig, fetchFormConfig]);

  useEffect(() => {
    if (!hasInitialized.current || !formConfig || !fetchWithAuth) return;

    const configChanged =
      lastSavedConfig.current?.doubleOptIn !== isDoubleOptIn ||
      lastSavedConfig.current?.isEnabled !== isEnabled;

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
            double_opt_enable: isDoubleOptIn,
          }),
        });
        if (!response.ok) throw new Error('Échec de la sauvegarde.');
        lastSavedConfig.current = { doubleOptIn: isDoubleOptIn, isEnabled };
        if (fetchFormConfig) await fetchFormConfig();
      } catch (error) {
        toast({ title: 'Erreur', description: (error as Error).message, variant: 'destructive' });
        if (lastSavedConfig.current) {
          setIsDoubleOptIn(lastSavedConfig.current.doubleOptIn);
          setIsEnabled(lastSavedConfig.current.isEnabled);
        }
      } finally {
        setIsSaving(false);
      }
    };

    debounceTimeout.current = setTimeout(saveConfiguration, 1000);
    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [isDoubleOptIn, isEnabled, formConfig, fetchWithAuth, toast, fetchFormConfig]);

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
        <Label htmlFor={`preview-${field.name}`} className="text-xs font-medium text-gray-700">
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
            className="mt-1 h-8 bg-gray-100"
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
          <p className="text-muted-foreground">Configurez votre formulaire de collecte de leads.</p>
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
        <p className="text-muted-foreground">Configurez votre formulaire de collecte de leads.</p>
      </div>

      {/* Configuration générale */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration générale</CardTitle>
          <CardDescription>
            Les changements sont sauvegardés automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="widget-enable" className="text-base">
                Activer le widget sur le portail captif
              </Label>
              <p className="text-sm text-muted-foreground">
                Active ou désactive l'affichage du formulaire sur votre portail WiFi.
              </p>
            </div>
            <Switch
              id="widget-enable"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
            <div className="space-y-0.5">
              <Label htmlFor="double-opt-in" className="text-base">
                Activer le Double Opt-In{' '}
                <span className="text-xs font-medium text-muted-foreground">(soon)</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité à venir — vérification SMS pour des leads certifiés.
              </p>
            </div>
            <Switch
              id="double-opt-in"
              checked={false}
              disabled={true}
            />
          </div>
          {isSaving && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
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
              Rendu actuel affiché sur votre portail WiFi.
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
