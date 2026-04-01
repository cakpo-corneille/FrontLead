'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
    password: z
      .string()
      .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
      .max(15, { message: 'Le mot de passe ne peut pas dépasser 15 caractères.' })
      .regex(/[A-Z]/, { message: 'Doit contenir au moins une majuscule.' })
      .regex(/[a-z]/, { message: 'Doit contenir au moins une minuscule.' })
      .regex(/[0-9]/, { message: 'Doit contenir au moins un chiffre.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        email: "",
        password: "",
        confirmPassword: "",
    },
  });

  const handleSignup = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const payload = { email: data.email, password: data.password };
      const responseData = await signup(payload);

      if (responseData.user_id) {
        sessionStorage.setItem('user_id_for_verification', responseData.user_id);
      }

      toast({
        title: 'Inscription réussie',
        description: responseData.message || 'Un code de vérification a été envoyé à votre e-mail.',
      });

      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);

    } catch (error: any) {
      let title = 'Échec de l\'inscription';
      let description = 'Une erreur inattendue est survenue. Veuillez réessayer.';

      switch (error.status) {
        case 403: // Étape 8: Gestion de l'erreur 403
          title = 'Compte non vérifié';
          description = 'Cet e-mail est déjà utilisé. Nous vous redirigeons pour finaliser la vérification.';
          toast({
            title: title,
            description: description,
          });
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          break;

        case 400:
          title = 'Données invalides';
          // Utilisation des messages d'erreur de l'API pour plus de précision
          if (error.data?.email) {
            description = error.data.email[0];
          } else if (error.data?.password) {
            description = error.data.password[0];
          } else {
            description = error.message || 'Veuillez vérifier les informations saisies.';
          }
          toast({ variant: 'destructive', title, description });
          break;

        case 500:
          title = 'Erreur du serveur';
          description = 'Impossible de créer le compte pour le moment. Veuillez réessayer plus tard.';
          toast({ variant: 'destructive', title, description });
          break;

        default:
          description = error.message || description;
          toast({ variant: 'destructive', title, description });
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez WiFiLeads et commencez à collecter des leads.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignup)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmez le mot de passe</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer un compte
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Vous avez déjà un compte?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
