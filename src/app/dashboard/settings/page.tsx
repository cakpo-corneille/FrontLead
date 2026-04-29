'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  UploadCloud,
  Loader2,
  Pencil,
  KeyRound,
  Mail,
  ArrowLeft,
  User,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Target,
  X,
  Palette,
  Zap,
} from 'lucide-react';
import { IntegrationContent } from '@/components/dashboard/integration-content';
import { ThemeRadioGroup } from '@/components/dashboard/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ─── Schemas ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  businessName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  logo: z.any().optional(),
  nom: z.string().min(2, 'Le nom est requis.'),
  prenom: z.string().optional(),
  phone_contact: z.string().optional().refine(val => !val || isValidPhoneNumber(val), { message: 'Numéro de téléphone invalide.' }),
  whatsapp_contact: z.string().optional().refine(val => !val || isValidPhoneNumber(val), { message: 'Numéro WhatsApp invalide.' }),
  pays: z.string().min(2, 'Le pays est requis.'),
  ville: z.string().min(2, 'La ville est requise.'),
  quartier: z.string().min(2, 'Le quartier est requis.'),
  mainGoal: z.string({ required_error: 'Vous devez choisir un objectif.' }),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Ancien mot de passe requis.'),
  new_password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
});

const emailSchema = z.object({
  email: z.string().email("L'adresse e-mail est invalide."),
  password: z.string().min(1, 'Votre mot de passe est requis pour confirmer.'),
});

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type SecurityView = 'view' | 'edit-email' | 'edit-password';
type Tab = 'profil' | 'compte' | 'apparence' | 'integration' | 'facturation';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const maskEmail = (email?: string): string => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return `${localPart[0]}•••@${domain}`;
  return `${localPart[0]}${'•'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
};

// ─── Sidebar nav config ───────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Mon compte',
    items: [
      { id: 'profil' as Tab, label: 'Profil', icon: User },
      { id: 'compte' as Tab, label: 'Sécurité', icon: ShieldCheck },
    ],
  },
  {
    label: 'Préférences',
    items: [
      { id: 'apparence' as Tab, label: 'Apparence', icon: Palette },
    ],
  },
  {
    label: 'Plate-forme',
    items: [
      { id: 'integration' as Tab, label: 'Intégration', icon: Zap },
    ],
  },
  {
    label: 'Abonnement',
    items: [
      { id: 'facturation' as Tab, label: 'Facturation', icon: CreditCard, soon: true },
    ],
  },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-4 border-b border-border/60 last:border-0">
      <div className="sm:w-48 flex-shrink-0 flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />}
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function SettingsPageComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { fetchWithAuth, profile, fetchProfile } = useAuth();
  const [securityView, setSecurityView] = useState<SecurityView>('view');

  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = (searchParams.get('tab') as Tab) || 'profil';

  const profileForm = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), mode: 'onChange' });
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema), mode: 'onChange' });
  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema), mode: 'onChange' });

  useEffect(() => {
    if (profile) {
      setIsLoading(true);
      profileForm.reset({
        businessName: profile.business_name || '',
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        phone_contact: profile.phone_contact || '',
        whatsapp_contact: profile.whatsapp_contact || '',
        pays: profile.pays || '',
        ville: profile.ville || '',
        quartier: profile.quartier || '',
        mainGoal: profile.main_goal,
      });
      emailForm.reset({ email: profile.email });
      if (profile.logo_url) setLogoPreview(profile.logo_url);
      setIsLoading(false);
    }
  }, [profile, profileForm, emailForm]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le fichier est trop grand. (Max 2MB)' });
        return;
      }
      setLogoPreview(URL.createObjectURL(file));
      profileForm.setValue('logo', file, { shouldDirty: true });
    }
  };

  const navigateTo = (value: Tab) => {
    router.push(`/dashboard/settings?tab=${value}`);
    setSecurityView('view');
  };

  // ── API Submissions ────────────────────────────────────────────────────────

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    if (!fetchWithAuth || !fetchProfile) return;
    const fd = new FormData();
    fd.append('business_name', values.businessName);
    fd.append('nom', values.nom);
    if (values.prenom) fd.append('prenom', values.prenom);
    if (values.phone_contact) fd.append('phone_contact', values.phone_contact);
    if (values.whatsapp_contact) fd.append('whatsapp_contact', values.whatsapp_contact);
    fd.append('pays', values.pays);
    fd.append('ville', values.ville);
    fd.append('quartier', values.quartier);
    fd.append('main_goal', values.mainGoal);
    if (values.logo instanceof File) fd.append('logo', values.logo);
    try {
      const res = await fetchWithAuth('/accounts/profile/me/', { method: 'PATCH', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Une erreur est survenue.');
      toast({ title: 'Profil mis à jour !', description: 'Vos informations ont été enregistrées.' });
      await fetchProfile();
      profileForm.reset(values);
      setIsEditing(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true);
    if (!fetchWithAuth) return;
    try {
      const res = await fetchWithAuth('/accounts/profile/change_password/', { method: 'POST', body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur s'est produite.");
      toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été mis à jour.' });
      passwordForm.reset();
      setSecurityView('view');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Échec', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const onEmailSubmit = async (values: EmailFormValues) => {
    setIsSaving(true);
    if (!fetchWithAuth || !fetchProfile) return;
    try {
      const res = await fetchWithAuth('/accounts/profile/change_email/', { method: 'POST', body: JSON.stringify(values) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur s'est produite.");
      await fetchProfile();
      toast({ title: 'Email modifié', description: 'Votre adresse e-mail a été mise à jour.' });
      setSecurityView('view');
    } catch (err) {
      toast({ variant: 'destructive', title: 'Échec', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Tab content ────────────────────────────────────────────────────────────

  const handleCancelEdit = () => {
    if (profile) {
      profileForm.reset({
        businessName: profile.business_name || '',
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        phone_contact: profile.phone_contact || '',
        whatsapp_contact: profile.whatsapp_contact || '',
        pays: profile.pays || '',
        ville: profile.ville || '',
        quartier: profile.quartier || '',
        mainGoal: profile.main_goal,
      });
      if (profile.logo_url) setLogoPreview(profile.logo_url);
    }
    setIsEditing(false);
  };

  const ProfileSection = () => (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Profil</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Gérez les informations de votre établissement et de contact.</p>
          </div>
          {!isEditing && (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 shrink-0">
              <Pencil className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
        </div>

        {/* Logo */}
        <FieldRow label="Logo" hint="JPEG, PNG, WebP · max 5 MB" icon={Building2}>
          <div className="flex items-center gap-4">
            <Label htmlFor="logo-input" className={cn('group', isEditing ? 'cursor-pointer' : 'cursor-default pointer-events-none')}>
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center hover:border-primary/60 transition-colors">
                {logoPreview ? (
                  <Image src={logoPreview} alt="Logo" fill className="object-contain p-1" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-muted-foreground" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <Pencil className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </Label>
            <Input id="logo-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} disabled={!isEditing} />
            {isEditing && (
              <div className="text-xs text-muted-foreground">
                <p>Cliquez sur l&apos;icône pour changer le logo.</p>
                <p>Recommandé : 200×200 px ou plus.</p>
              </div>
            )}
          </div>
        </FieldRow>

        {/* Entreprise */}
        <FieldRow label="Nom du business" icon={Building2}>
          <FormField control={profileForm.control} name="businessName" render={({ field }) => (
            <FormItem>
              <FormControl><Input {...field} placeholder="Nom de votre établissement" disabled={!isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        {/* Identité */}
        <div className="mt-6 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identité</p>
        </div>

        <FieldRow label="Prénom" icon={User}>
          <FormField control={profileForm.control} name="prenom" render={({ field }) => (
            <FormItem>
              <FormControl><Input {...field} value={field.value || ''} placeholder="Votre prénom" disabled={!isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        <FieldRow label="Nom" icon={User}>
          <FormField control={profileForm.control} name="nom" render={({ field }) => (
            <FormItem>
              <FormControl><Input {...field} placeholder="Votre nom" disabled={!isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        {/* Contact */}
        <div className="mt-6 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
        </div>

        <FieldRow label="Téléphone" icon={Phone}>
          <FormField control={profileForm.control} name="phone_contact" render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="w-full min-w-0">
                  <PhoneInput defaultCountry="BJ" {...field} value={field.value || ''} disabled={!isEditing} className="w-full max-w-full !min-w-0" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        <FieldRow label="WhatsApp" icon={Phone}>
          <FormField control={profileForm.control} name="whatsapp_contact" render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="w-full min-w-0">
                  <PhoneInput defaultCountry="BJ" {...field} value={field.value || ''} disabled={!isEditing} className="w-full max-w-full !min-w-0" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        {/* Localisation */}
        <div className="mt-6 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Localisation</p>
        </div>

        <FieldRow label="Pays" icon={MapPin}>
          <FormField control={profileForm.control} name="pays" render={({ field }) => (
            <FormItem>
              <FormControl><Input {...field} placeholder="Bénin" disabled={!isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        <FieldRow label="Ville" icon={MapPin}>
          <FormField control={profileForm.control} name="ville" render={({ field }) => (
            <FormItem>
              <FormControl><Input {...field} placeholder="Cotonou" disabled={!isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        <FieldRow label="Quartier" icon={MapPin}>
          <FormField control={profileForm.control} name="quartier" render={({ field }) => (
            <FormItem>
              <FormControl><Input {...field} placeholder="Votre quartier" disabled={!isEditing} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        {/* Objectif */}
        <div className="mt-6 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objectif principal</p>
        </div>

        <FieldRow label="Objectif" icon={Target}>
          <FormField control={profileForm.control} name="mainGoal" render={({ field }) => (
            <FormItem>
              <FormControl>
                <select
                  {...field}
                  value={field.value || ''}
                  disabled={!isEditing}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Choisissez un objectif</option>
                  <option value="collect_leads">Identifier mes clients</option>
                  <option value="analytics">Analyser le trafic</option>
                  <option value="marketing">Marketing ciblé</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </FieldRow>

        {/* Footer */}
        {isEditing && (
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" /> Annuler
            </Button>
            <Button type="submit" disabled={isSaving || !profileForm.formState.isDirty}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </div>
        )}
      </form>
    </Form>
  );

  const SecuritySection = () => {
    if (securityView === 'edit-password') {
      return (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              onClick={() => setSecurityView('view')}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Retour
            </button>
            <SectionHeader title="Changer le mot de passe" description="Saisissez votre ancien mot de passe pour en définir un nouveau." />
            <div className="space-y-4 max-w-md">
              <FormField control={passwordForm.control} name="old_password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ancien mot de passe</FormLabel>
                  <FormControl><PasswordInput {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="new_password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl><PasswordInput {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end mt-8 pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving || !passwordForm.formState.isDirty}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer le changement
              </Button>
            </div>
          </form>
        </Form>
      );
    }

    if (securityView === 'edit-email') {
      return (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              onClick={() => setSecurityView('view')}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Retour
            </button>
            <SectionHeader title="Changer d'adresse e-mail" description="Entrez votre nouvelle adresse e-mail et confirmez avec votre mot de passe." />
            <div className="space-y-4 max-w-md">
              <FormField control={emailForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouvelle adresse e-mail</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={emailForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormControl><PasswordInput {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex justify-end mt-8 pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving || !emailForm.formState.isDirty}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer le changement
              </Button>
            </div>
          </form>
        </Form>
      );
    }

    return (
      <>
        <SectionHeader title="Sécurité du compte" description="Gérez votre adresse e-mail et votre mot de passe de connexion." />
        <div className="space-y-3 max-w-lg">
          <button
            type="button"
            onClick={() => setSecurityView('edit-email')}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Adresse e-mail</p>
                <p className="text-xs text-muted-foreground font-mono tracking-wider">{maskEmail(profile?.email)}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => setSecurityView('edit-password')}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/40 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Mot de passe</p>
                <p className="text-xs text-muted-foreground font-mono tracking-widest">••••••••</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </>
    );
  };

  const AppearanceSection = () => (
    <>
      <SectionHeader
        title="Apparence"
        description="Choisissez l'apparence du tableau de bord. « Système » suit automatiquement les préférences de votre appareil."
      />
      <ThemeRadioGroup />
      <p className="text-xs text-muted-foreground mt-4 max-w-md">
        Votre choix s'applique uniquement à votre espace de gestion. Les pages publiques (portail captif, page de connexion) restent inchangées.
      </p>
    </>
  );

  const BillingSection = () => (
    <>
      <SectionHeader title="Facturation" description="Gérez votre abonnement, vos factures et votre mode de paiement." />
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Bientôt disponible</h3>
        <p className="text-sm text-muted-foreground mt-1">
          La gestion de l&apos;abonnement et des factures sera disponible prochainement.
        </p>
      </div>
    </>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-8 space-y-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        </div>
      );
    }
    switch (tab) {
      case 'profil': return <ProfileSection />;
      case 'compte': return <SecuritySection />;
      case 'apparence': return <AppearanceSection />;
      case 'integration': return <IntegrationContent embedded />;
      case 'facturation': return <BillingSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headline md:text-3xl">Configuration</h1>
        <p className="text-muted-foreground mt-1">Gérez votre compte, votre profil et vos préférences.</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-52 flex-shrink-0 sticky top-24">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={cn(gi > 0 && 'mt-6')}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1">
                {group.label}
              </p>
              <nav className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon, soon }) => (
                  <button
                    key={id}
                    onClick={() => !soon && navigateTo(id)}
                    disabled={soon}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
                      tab === id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      soon && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {soon && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal border-muted-foreground/30 text-muted-foreground">
                        Soon
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          {/* Mobile nav */}
          <div className="flex md:hidden gap-1 mb-6 overflow-x-auto pb-1">
            {NAV_GROUPS.flatMap(g => g.items).map(({ id, label, icon: Icon, soon }) => (
              <button
                key={id}
                onClick={() => !soon && navigateTo(id)}
                disabled={soon}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  tab === id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent',
                  soon && 'opacity-40 cursor-not-allowed',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {soon && <span className="text-[9px] opacity-70">Soon</span>}
              </button>
            ))}
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-4 w-80 mb-8" />
          <div className="flex gap-8">
            <div className="hidden md:flex flex-col w-52 gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)}
            </div>
            <div className="flex-1 space-y-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          </div>
        </div>
      }
    >
      <SettingsPageComponent />
    </Suspense>
  );
}
