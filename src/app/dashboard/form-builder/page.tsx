'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { FormPreview } from '@/components/dashboard/form-preview';
import { FormOverlayPreview } from '@/components/dashboard/form-overlay-preview';
import type { FormSchema, FormField } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PhoneInput } from '@/components/ui/phone-input';

const TemplatePreviewCard = ({
  title,
  description,
  children,
  href,
  isActive,
  headerActions,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  href?: string;
  isActive?: boolean;
  headerActions?: React.ReactNode;
}) => {
  const Wrapper = href ? Link : 'div';
  
  return (
    <Wrapper href={href || '#'}>
      <Card
        className={cn(
          'h-full flex flex-col transform transition-all duration-300 hover:shadow-xl',
          !href && 'cursor-default',
          isActive && 'ring-2 ring-primary'
        )}
      >
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <CardTitle>{title}</CardTitle>
            {headerActions}
          </div>
          <CardDescription className="pt-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center relative">
          <FormPreview>{children}</FormPreview>
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default function FormBuilderSelectionPage() {
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();
  const { toast } = useToast();
  
  const [defaultSchema, setDefaultSchema] = useState<FormSchema | null>(null);
  const [customSchema, setCustomSchema] = useState<FormSchema | null>(null);

  const [isDoubleOptIn, setIsDoubleOptIn] = useState(false);
  const [preferredChannel, setPreferredChannel] = useState<'email' | 'phone'>('email');
  
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const hasInitialized = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSavedConfig = useRef<{
    doubleOptIn: boolean;
    preferredChannel: 'email' | 'phone';
  } | null>(null);

  const generateDefaultFallback = useCallback((channel: 'email' | 'phone') => {
      const fields: FormField[] = [
        { name: 'nom', label: 'Nom', type: 'text', placeholder: 'Votre nom complet', required: true },
      ];
      if (channel === 'phone') {
          fields.push({ name: 'phone', label: 'Téléphone', type: 'phone', placeholder: 'Votre numéro de téléphone', required: true });
      } else {
          fields.push({ name: 'email', label: 'Email', type: 'email', placeholder: 'Votre adresse email', required: true });
      }
      return { name: 'default', is_default: true, schema: { fields } } as FormSchema;
  }, []);

  const generateCustomFallback = () => {
    return { name: 'custom', is_default: false, schema: { fields: [] } } as FormSchema;
  };

  useEffect(() => {
    if (!formConfig) {
      if(fetchFormConfig) fetchFormConfig();
      return;
    }

    if (!hasInitialized.current) {
        setIsDoubleOptIn(formConfig.double_opt_enable);
        setPreferredChannel(formConfig.preferred_channel);
        lastSavedConfig.current = {
          doubleOptIn: formConfig.double_opt_enable,
          preferredChannel: formConfig.preferred_channel,
        };
        hasInitialized.current = true;
    }

    if (formConfig.is_default) {
        setDefaultSchema(formConfig);
        setCustomSchema(generateCustomFallback());
    } else {
        setCustomSchema(formConfig);
        setDefaultSchema(generateDefaultFallback(formConfig.preferred_channel));
    }
  }, [formConfig, generateDefaultFallback, fetchFormConfig]);

  useEffect(() => {
    if (!hasInitialized.current || !formConfig || !fetchWithAuth) return;

    const configChanged = 
      lastSavedConfig.current?.doubleOptIn !== isDoubleOptIn ||
      lastSavedConfig.current?.preferredChannel !== preferredChannel;

    if (!configChanged) return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    const saveConfiguration = async () => {
        setIsSaving(true);
        try {
            const response = await fetchWithAuth('/schema/update_schema/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formConfig.name,
                    schema: formConfig.schema,
                    is_default: formConfig.is_default,
                    double_opt_enable: isDoubleOptIn,
                    preferred_channel: preferredChannel,
                }),
            });

            if (!response.ok) throw new Error("Échec de la sauvegarde.");
            
            lastSavedConfig.current = {
              doubleOptIn: isDoubleOptIn,
              preferredChannel: preferredChannel,
            };

            if (fetchFormConfig) await fetchFormConfig();

        } catch (error) {
            toast({ title: 'Erreur', description: (error as Error).message, variant: 'destructive'});
            if (lastSavedConfig.current) {
              setIsDoubleOptIn(lastSavedConfig.current.doubleOptIn);
              setPreferredChannel(lastSavedConfig.current.preferredChannel);
            }
        } finally {
            setIsSaving(false);
        }
    };

    debounceTimeout.current = setTimeout(saveConfiguration, 1000);

    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [isDoubleOptIn, preferredChannel, formConfig, fetchWithAuth, toast, fetchFormConfig]);

  const activeTemplateName = formConfig?.is_default ? 'default' : 'custom';
  const isLoading = !formConfig || !defaultSchema || !customSchema;

  const handleApplyDefault = async () => {
    if (!fetchWithAuth || !formConfig) return;
    setIsApplying(true);
    
    const schemaToApply = generateDefaultFallback(preferredChannel);

    try {
      const response = await fetchWithAuth('/schema/update_schema/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: 'default', 
            schema: schemaToApply.schema, 
            is_default: true, 
            double_opt_enable: isDoubleOptIn,
            preferred_channel: preferredChannel
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de l'application du template par défaut.");
      }
      
      if(fetchFormConfig) await fetchFormConfig();

      toast({
        title: 'Succès',
        description: 'Le formulaire par défaut a été appliqué.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: (error as Error).message,
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  const renderFormFields = (schema: FormSchema | null) => {
    if (!schema || !schema.schema || schema.schema.fields.length === 0) {
        return <p className="text-sm text-muted-foreground">Aucun champ n'est défini pour ce formulaire.</p>;
    }

    return schema.schema.fields.map((field) => (
      <div key={field.name}>
        <Label
          htmlFor={`preview-${field.name}`}
          className="text-xs font-medium text-gray-700"
        >
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

  if (isLoading) {
    return (
        <div className="space-y-6 max-w-6xl mx-auto p-1 sm:p-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Formulaire</h1>
                <p className="text-muted-foreground mb-4">
                Choisissez un modèle pour commencer ou modifiez votre formulaire
                existant.
                </p>
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                <Skeleton className="h-[600px] w-full" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
       <div>
        <h1 className="text-3xl font-bold font-headline">Formulaire</h1>
        <p className="text-muted-foreground mb-4">
          Choisissez un modèle pour commencer ou modifiez votre formulaire
          existant.
        </p>
         <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Formulaire actif :</span>
            <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700 font-semibold">
                <Check className="mr-1 h-3 w-3"/>
                {activeTemplateName === 'default' ? 'Formulaire par Défaut' : 'Formulaire Personnalisé'}
            </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Configuration Générale</CardTitle>
            <CardDescription>
                Configurez les options globales de votre formulaire. Les changements sont sauvegardés automatiquement.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-background">
                <div className="space-y-0.5">
                    <Label htmlFor="double-opt-in" className="text-base">Activer le Double Opt-In</Label>
                    <p className="text-sm text-muted-foreground">
                        Exige des utilisateurs qu'ils confirment leur inscription par email ou SMS.
                    </p>
                </div>
                <Switch
                    id="double-opt-in"
                    checked={isDoubleOptIn}
                    onCheckedChange={setIsDoubleOptIn}
                    aria-label="Activer le double opt-in"
                />
            </div>
             <div className="rounded-lg border p-4 bg-background">
                 <div className="space-y-2 mb-3">
                    <Label className="text-base">Canal de Contact Préféré</Label>
                     <p className="text-sm text-muted-foreground">
                        Définit le champ de contact principal (email ou téléphone) pour le formulaire par défaut.
                    </p>
                 </div>
                 <RadioGroup
                    value={preferredChannel}
                    onValueChange={(value) => setPreferredChannel(value as 'email' | 'phone')}
                    className="mt-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6"
                 >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="r-email" />
                        <Label htmlFor="r-email" className="cursor-pointer">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="r-phone" />
                        <Label htmlFor="r-phone" className="cursor-pointer">Téléphone</Label>
                    </div>
                 </RadioGroup>
            </div>
        </CardContent>
    </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TemplatePreviewCard
          title="Formulaire par Défaut"
          description="Un formulaire simple et efficace pour une connexion rapide."
          isActive={activeTemplateName === 'default'}
          headerActions={
            activeTemplateName !== 'default' && (
              <Button
                onClick={handleApplyDefault}
                disabled={isApplying || isSaving}
                className="text-white hover:bg-[#92400E] active:bg-[#78350F]"
                style={{ backgroundColor: '#B45309' }}
              >
                {(isApplying) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}                Appliquer
              </Button>
            )
          }
        >
          <FormOverlayPreview>
            <>{renderFormFields(defaultSchema)}</>
          </FormOverlayPreview>
        </TemplatePreviewCard>

        <TemplatePreviewCard
          title="Formulaire Personnalisé"
          description="Modifiez votre formulaire, partez de zéro, ou laissez l'IA le construire pour vous."
          isActive={activeTemplateName === 'custom'}
          headerActions={
            <Button asChild style={{ backgroundColor: '#1E40AF', color: 'white' }} className="hover:bg-blue-800" disabled={isSaving}>
                <Link href="/dashboard/form-builder/edit">Éditer</Link>
            </Button>
          }
        >
          <FormOverlayPreview>
              <>{renderFormFields(customSchema)}</>
          </FormOverlayPreview>
        </TemplatePreviewCard>
      </div>
    </div>
  );
}
