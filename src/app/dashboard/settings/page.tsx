'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, Loader2, Pencil, KeyRound, Mail, ArrowLeft } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { PasswordInput } from '@/components/ui/password-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';

// Schemas
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
  mainGoal: z.string({ required_error: "Vous devez choisir un objectif." }),
});

const passwordSchema = z.object({
    old_password: z.string().min(1, 'Ancien mot de passe requis.'),
    new_password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
});

const emailSchema = z.object({
    email: z.string().email("L'adresse e-mail est invalide."),
    password: z.string().min(1, 'Votre mot de passe est requis pour confirmer.'),
});

// Types
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type EmailFormValues = z.infer<typeof emailSchema>;
type SecurityView = 'view' | 'edit-email' | 'edit-password';

// Helper
const maskEmail = (email?: string): string => {
    if (!email) return "";
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
        return `${localPart[0]}•••@${domain}`;
    }
    return `${localPart[0]}${'•'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
}

// Main Component
function SettingsPageComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { fetchWithAuth, profile, fetchProfile } = useAuth();
  const [editableField, setEditableField] = useState<string | null>(null);
  const [securityView, setSecurityView] = useState<SecurityView>('view');

  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'profile';

  // Forms
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

  // Handlers
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          toast({ variant: "destructive", title: "Erreur", description: "Le fichier est trop grand. (Max 2MB)" });
          return;
      }
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      profileForm.setValue('logo', file, { shouldDirty: true });
    }
  };

  const onTabChange = (value: string) => {
    router.push(`/dashboard/settings?tab=${value}`);
    setSecurityView('view'); // Reset security view on tab change
  };

  // API Submissions
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    if (!fetchWithAuth || !fetchProfile) return;

    const submissionData = new FormData();

    submissionData.append('business_name', values.businessName);
    submissionData.append('nom', values.nom);
    if(values.prenom) submissionData.append('prenom', values.prenom);
    if(values.phone_contact) submissionData.append('phone_contact', values.phone_contact);
    if(values.whatsapp_contact) submissionData.append('whatsapp_contact', values.whatsapp_contact);
    submissionData.append('pays', values.pays);
    submissionData.append('ville', values.ville);
    submissionData.append('quartier', values.quartier);
    submissionData.append('main_goal', values.mainGoal);
    if (values.logo instanceof File) {
      submissionData.append('logo', values.logo);
    }

    try {
      const response = await fetchWithAuth('/accounts/profile/me/', {
        method: 'PATCH',
        body: submissionData,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Server error:', data);
        throw new Error(data.detail || 'Une erreur est survenue lors de la sauvegarde.');
      }

      toast({
        title: 'Profil mis à jour !',
        description: 'Vos informations ont été enregistrées.',
      });
      
      await fetchProfile();
      profileForm.reset(values);
      setEditableField(null);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsSaving(true);
    if (!fetchWithAuth) return;
    try {
        const response = await fetchWithAuth('/accounts/profile/change_password/', {
            method: 'POST',
            body: JSON.stringify(values),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Une erreur s'est produite.");
        toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été mis à jour.' });
        passwordForm.reset();
        setSecurityView('view');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Échec de la modification', description: (error as Error).message });
    } finally {
        setIsSaving(false);
    }
  };

  const onEmailSubmit = async (values: EmailFormValues) => {
    setIsSaving(true);
    if (!fetchWithAuth || !fetchProfile) return;
    try {
      const response = await fetchWithAuth('/accounts/profile/change_email/', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Une erreur s'est produite.");
      await fetchProfile(); // Re-fetch profile to get the new email
      toast({ title: 'Email modifié', description: 'Votre adresse e-mail a été mise à jour.' });
      setSecurityView('view');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Échec de la modification', description: (error as Error).message });
    } finally {
        setIsSaving(false);
    }
  };

  // --- RENDER COMPONENTS ---

  const renderProfileField = (name: keyof ProfileFormValues, label: string, component: React.ReactNode) => {
    const isEditing = editableField === name;
    const value = profileForm.watch(name);
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-2 border-b">
            <Label htmlFor={name} className="font-medium text-sm">{label}</Label>
            <div className="md:col-span-2 flex items-center gap-2">
                {isEditing ? (
                    <div className="flex-1">{component}</div>
                ) : (
                    <div className="flex-1 font-medium text-muted-foreground p-2 min-h-[40px] flex items-center">
                        {name === 'logo' ? (
                            <Image src={logoPreview || '/placeholder.svg'} alt="Logo" width={48} height={48} className="rounded-md" />
                        ) : (value || <span className="text-gray-400">Non défini</span>)}
                    </div>
                )}
                 <Button type="button" variant="ghost" size="icon" onClick={() => setEditableField(isEditing ? null : name)}>
                    <Pencil className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
  };
  
  const ProfileFormCard = () => (
    <Card>
        <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Gérez les informations de votre entreprise et de contact.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {renderProfileField("businessName", "Nom du Business", <FormField control={profileForm.control} name="businessName" render={({ field }) => ( <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("logo", "Logo", 
                <FormItem>
                  <Label htmlFor="logo-input" className="cursor-pointer group">
                    <div className={cn('relative w-32 h-20 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted hover:border-primary/80 transition-all duration-150 ease-in-out active:scale-95')}>
                      {logoPreview ? (
                        <Image src={logoPreview} alt="Aperçu du logo" fill className="object-contain p-2 rounded-lg" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </Label>
                  <Input id="logo-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} />
                </FormItem>
              )} 
              {renderProfileField("prenom", "Prénom", <FormField control={profileForm.control} name="prenom" render={({ field }) => (<FormItem><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("nom", "Nom", <FormField control={profileForm.control} name="nom" render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("phone_contact", "Contact", <FormField control={profileForm.control} name="phone_contact" render={({ field }) => (<FormItem><FormControl><PhoneInput defaultCountry="BJ" {...field} value={field.value || ''}/></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("whatsapp_contact", "WhatsApp", <FormField control={profileForm.control} name="whatsapp_contact" render={({ field }) => (<FormItem><FormControl><PhoneInput defaultCountry="BJ" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("pays", "Pays", <FormField control={profileForm.control} name="pays" render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("ville", "Ville", <FormField control={profileForm.control} name="ville" render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>)}
              {renderProfileField("quartier", "Quartier", <FormField control={profileForm.control} name="quartier" render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>)}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving || !profileForm.formState.isDirty}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sauvegarder
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );

  const SecurityInfoCard = () => (
    <Card>
        <CardHeader><CardTitle>Sécurité du compte</CardTitle><CardDescription>Gérez votre adresse e-mail et votre mot de passe.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-semibold tracking-wider">{maskEmail(profile?.email)}</p>
                </div>
                <Button variant="outline" onClick={() => setSecurityView('edit-email')}>Modifier</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div>
                    <Label className="text-xs text-muted-foreground">Mot de passe</Label>
                    <p className="font-semibold tracking-widest">••••••••</p>
                </div>
                <Button variant="outline" onClick={() => setSecurityView('edit-password')}>Modifier</Button>
            </div>
        </CardContent>
    </Card>
  );

  const EditPasswordCard = () => (
    <Card>
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <CardHeader>
              <Button variant="ghost" size="sm" className="w-fit p-0 h-auto mb-2 text-sm text-muted-foreground" onClick={() => setSecurityView('view')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
              <CardTitle className="flex items-center"><KeyRound className="mr-2"/> Changer le mot de passe</CardTitle>
              <CardDescription>Saisissez votre ancien et nouveau mot de passe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={passwordForm.control} name="old_password" render={({ field }) => (<FormItem><FormLabel>Ancien mot de passe</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={passwordForm.control} name="new_password" render={({ field }) => (<FormItem><FormLabel>Nouveau mot de passe</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>)}/>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving || !passwordForm.formState.isDirty}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer le changement
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );

  const EditEmailCard = () => (
    <Card>
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <CardHeader>
                <Button variant="ghost" size="sm" className="w-fit p-0 h-auto mb-2 text-sm text-muted-foreground" onClick={() => setSecurityView('view')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
                <CardTitle className="flex items-center"><Mail className="mr-2"/> Changer d'adresse e-mail</CardTitle>
                <CardDescription>Entrez votre nouvelle adresse et confirmez avec votre mot de passe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={emailForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Nouvelle adresse e-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={emailForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Mot de passe actuel</FormLabel><FormControl><PasswordInput {...field} /></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving || !emailForm.formState.isDirty}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer le changement
                </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );

  const renderSecurityContent = () => {
    if (isLoading) return <Skeleton className="h-64 w-full" />;
    switch (securityView) {
        case 'edit-email': return <EditEmailCard />;
        case 'edit-password': return <EditPasswordCard />;
        case 'view':
        default: return <SecurityInfoCard />;
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-headline md:text-3xl">Configuration</h1>
        <p className="text-muted-foreground">Gérez vos paramètres de compte et de sécurité.</p>
      </div>
      <Tabs value={tab} onValueChange={onTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">{isLoading ? <Skeleton className="h-96 w-full" /> : <ProfileFormCard />}</TabsContent>
        <TabsContent value="security">{renderSecurityContent()}</TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="space-y-4 max-w-4xl mx-auto"><Skeleton className="h-12 w-48" /><Skeleton className="h-10 w-full" /><Skeleton className="h-96 w-full" /></div>}>
            <SettingsPageComponent />
        </Suspense>
    )
}