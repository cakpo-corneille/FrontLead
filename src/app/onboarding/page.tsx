'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UploadCloud, Lightbulb, Zap, User, Shield, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhoneNumber } from 'react-phone-number-input';


const totalSteps = 4;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { fetchWithAuth, fetchProfile, profileStatus } = useAuth();

  const [formData, setFormData] = useState<any>({
    businessName: '',
    logoFile: null as File | null,
    nom: '',
    prenom: '',
    phone_contact: '',
    whatsapp_contact: '',
    pays: 'Bénin',
    ville: '',
    quartier: '',
    mainGoal: 'collect_leads',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profileStatus) {
      if (profileStatus.pass_onboading) {
        router.push('/dashboard');
      } else {
        setStep(1);
        setIsFetchingProfile(false);
      }
    }
  }, [profileStatus, router]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (formData.logoFile) {
      objectUrl = URL.createObjectURL(formData.logoFile);
      setLogoPreview(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [formData.logoFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

    const handlePhoneChange = (value: string, name: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le logo est trop volumineux (max 2MB).' });
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Format de fichier non supporté.' });
        return;
      }
      setFormData(prev => ({ ...prev, logoFile: file }));
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const validateStep = () => {
    if (step === 1) {
        if (!formData.businessName.trim() || formData.businessName.trim().toLowerCase().startsWith('wifi-zone')) {
            toast({ variant: 'destructive', title: 'Champ requis', description: "Le nom de l\'entreprise doit être personnalisé." });
            return false;
        }
        if (!formData.logoFile) {
             toast({ variant: 'destructive', title: 'Champ requis', description: 'Un logo personnalisé est obligatoire.' });
             return false;
        }
    } else if (step === 2) {
        if (!formData.nom.trim()) {
            toast({ variant: 'destructive', title: 'Champ requis', description: 'Le nom est obligatoire.' });
            return false;
        }
        if (!formData.phone_contact && !formData.whatsapp_contact) {
            toast({ variant: 'destructive', title: 'Champ requis', description: 'Au moins un contact (téléphone ou WhatsApp) est requis.' });
            return false;
        }
        if (formData.phone_contact && !isValidPhoneNumber(formData.phone_contact)) {
            toast({ variant: 'destructive', title: 'Numéro invalide', description: 'Le numéro de téléphone n\'est pas valide.' });
            return false;
        }
        if (formData.whatsapp_contact && !isValidPhoneNumber(formData.whatsapp_contact)) {
            toast({ variant: 'destructive', title: 'Numéro invalide', description: 'Le numéro WhatsApp n\'est pas valide.' });
            return false;
        }

    } else if (step === 3) {
      if (!formData.quartier.trim() || !formData.ville.trim() || !formData.pays.trim()) {
        toast({ variant: 'destructive', title: 'Champs requis', description: 'Pays, ville et quartier sont obligatoires.' });
        return false;
      }
    } else if (step === 4) {
        if (!formData.mainGoal) {
            toast({ variant: 'destructive', title: 'Champ requis', description: 'Veuillez sélectionner un objectif principal.' });
            return false;
        }
    }
    return true;
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < totalSteps) {
        nextStep();
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (!fetchWithAuth || !fetchProfile) return;

    setIsLoading(true);

    const submissionData = new FormData();
    submissionData.append('business_name', formData.businessName);
    if (formData.logoFile) {
      submissionData.append('logo', formData.logoFile);
    }
    submissionData.append('nom', formData.nom);
    if(formData.prenom) submissionData.append('prenom', formData.prenom);
    if(formData.phone_contact) submissionData.append('phone_contact', formData.phone_contact);
    if(formData.whatsapp_contact) submissionData.append('whatsapp_contact', formData.whatsapp_contact);
    submissionData.append('pays', formData.pays);
    submissionData.append('ville', formData.ville);
    submissionData.append('quartier', formData.quartier);
    if (formData.mainGoal) {
        submissionData.append('main_goal', formData.mainGoal);
    }
    
    try {
      const response = await fetchWithAuth('/accounts/profile/me/', {
        method: 'PATCH',
        body: submissionData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Une erreur est survenue.');
      }
      
      await fetchProfile(); // Update auth context

      toast({
        title: 'Configuration terminée !',
        description: 'Bienvenue sur votre tableau de bord.',
      });
      router.push('/dashboard');

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    // ... same renderStep function as before
     switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <Progress value={(step / totalSteps) * 100} className="mb-4" />
              <CardTitle className="font-headline break-words">Onboarding</CardTitle>
              <CardDescription className="break-words">Étape {step}/{totalSteps} : Personnalisez votre portail.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[380px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <Card className="p-4 flex flex-col"><Lightbulb className="w-8 h-8 text-yellow-500 mb-2" /><h3 className="font-semibold mb-1">Personnalisez</h3><p className="text-sm text-gray-600 break-words">Votre logo apparaîtra sur le formulaire WiFi</p></Card>
                  <Card className="p-4 flex flex-col"><Zap className="w-8 h-8 text-blue-500 mb-2" /><h3 className="font-semibold mb-1">Rapide</h3><p className="text-sm text-gray-600 break-words">Plus que quelques minutes avant le dashboard</p></Card>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nom de l'entreprise <span className="text-red-500">*</span></Label>
                  <Input id="businessName" name="businessName" required value={formData.businessName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo <span className="text-red-500">*</span></Label>
                  <label htmlFor="logo" className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    {logoPreview ? <Image src={logoPreview} alt="Aperçu du logo" fill className="object-contain p-2 rounded-lg" /> : <div className="flex flex-col items-center justify-center pt-5 pb-6"><UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Cliquez pour télécharger</span></p><p className="text-xs text-muted-foreground">SVG, PNG, JPG (MAX. 2Mo)</p></div>}
                    <Input id="logo" name="logo" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <Progress value={(step / totalSteps) * 100} className="mb-4" />
              <CardTitle className="font-headline break-words">Informations sur le propriétaire</CardTitle>
              <CardDescription className="break-words">Étape {step}/{totalSteps} : Parlez-nous un peu de vous.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[380px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <Card className="p-4 flex flex-col"><User className="w-8 h-8 text-blue-500 mb-2" /><h3 className="font-semibold mb-1">Contact</h3><p className="text-sm text-gray-600 break-words">Pour personnaliser votre expérience.</p></Card>
                  <Card className="p-4 flex flex-col"><Shield className="w-8 h-8 text-green-500 mb-2" /><h3 className="font-semibold mb-1">Sécurisé</h3><p className="text-sm text-gray-600 break-words">Vos données ne seront jamais partagées.</p></Card>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="prenom">Prénom</Label><Input id="prenom" name="prenom" value={formData.prenom} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label><Input id="nom" name="nom" required value={formData.nom} onChange={handleInputChange} /></div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone_contact">Contact téléphonique</Label>
                    <PhoneInput
                        id="phone_contact"
                        name="phone_contact"
                        value={formData.phone_contact}
                        onChange={(value) => handlePhoneChange(value, 'phone_contact')}
                        defaultCountry="BJ"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsapp_contact">WhatsApp</Label>
                    <PhoneInput
                        id="whatsapp_contact"
                        name="whatsapp_contact"
                        value={formData.whatsapp_contact}
                        onChange={(value) => handlePhoneChange(value, 'whatsapp_contact')}
                        defaultCountry="BJ"
                    />
                </div>
              </div>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <Progress value={(step / totalSteps) * 100} className="mb-4" />
              <CardTitle className="font-headline break-words">Localisation de l'entreprise</CardTitle>
              <CardDescription className="break-words">Étape {step}/{totalSteps} : Où se situe votre activité ?</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[380px]">
              <div className="space-y-6">
                <div className="p-4 border rounded-lg flex items-center gap-4 bg-muted/50"><MapPin className="h-8 w-8 text-primary" /><p className="text-sm text-muted-foreground">Ces informations aident à mieux comprendre votre clientèle.</p></div>
                <div className="space-y-2"><Label htmlFor="pays">Pays <span className="text-red-500">*</span></Label><Input id="pays" name="pays" required value={formData.pays} onChange={handleInputChange} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="ville">Ville <span className="text-red-500">*</span></Label><Input id="ville" name="ville" required value={formData.ville} onChange={handleInputChange} /></div>
                  <div className="space-y-2"><Label htmlFor="quartier">Quartier <span className="text-red-500">*</span></Label><Input id="quartier" name="quartier" required value={formData.quartier} onChange={handleInputChange} /></div>
                </div>
              </div>
            </CardContent>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader>
              <Progress value={(step / totalSteps) * 100} className="mb-4" />
              <CardTitle className="font-headline break-words">Votre objectif principal</CardTitle>
              <CardDescription className="break-words">Étape {step}/{totalSteps} : Cela nous aidera à personnaliser votre expérience.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[380px] flex items-center">
                <div className="space-y-4 w-full">
                    <Label>Quel est votre objectif principal avec WiFiLeads ? <span className="text-red-500">*</span></Label>
                    <RadioGroup name="mainGoal" required value={formData.mainGoal} onValueChange={(value) => setFormData(p => ({...p, mainGoal: value}))} className="space-y-4">
                        <Label htmlFor="collect_leads" className="flex items-center space-x-2 p-4 border rounded-md hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value="collect_leads" id="collect_leads" />
                            <span className="flex-1">Collecter les données des clients</span>
                        </Label>
                        <Label htmlFor="analytics" className="flex items-center space-x-2 p-4 border rounded-md hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value="analytics" id="analytics" />
                            <span className="flex-1">Comprendre le comportement des clients</span>
                        </Label>
                        <Label htmlFor="marketing" className="flex items-center space-x-2 p-4 border rounded-md hover:bg-muted/50 cursor-pointer">
                            <RadioGroupItem value="marketing" id="marketing" />
                            <span className="flex-1">Augmenter l'engagement des clients</span>
                        </Label>
                    </RadioGroup>
                </div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };
  
  if (isFetchingProfile) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent className="min-h-[380px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
        {renderStep()}
        <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading} className="w-full sm:w-auto">Précédent</Button>
          ) : (
            <div />
          )}
          
          {step === totalSteps ? (
            <Button type="button" onClick={handleSubmit} disabled={isLoading} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Terminer la configuration
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
              Suivant
            </Button>
          )}
        </CardFooter>
    </Card>
  );
}
