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

const loginSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
  password: z.string().min(1, { message: 'Veuillez entrer votre mot de passe.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch (error: any) {
      let title = 'Échec de la connexion';
      let description = 'Une erreur inattendue est survenue. Veuillez réessayer.';

      switch (error.status) {
        case 400: // Identifiants incorrects
          title = 'Identifiants incorrects';
          description = "L'adresse email ou le mot de passe que vous avez entré n'est pas valide. Veuillez vérifier et réessayer.";
          break;
        case 403: // Email non vérifié
          if (error.data?.redirect) {
            if (error.data.user_id) {
              sessionStorage.setItem('user_id_for_verification', error.data.user_id);
            }
            // CORRECTION: Remplacer la redirection de l'API par la bonne URL en dur
            router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
            toast({
              variant: 'destructive',
              title: 'Email non vérifié',
              description: error.message || 'Votre compte n\'est pas activé. Veuillez vérifier votre boîte de réception.',
            });
            return; // Sortir de la fonction pour éviter le toast générique
          }
          break;
        case 500: // Erreur interne du serveur
          title = 'Erreur du serveur';
          description = 'Un problème est survenu de notre côté. Notre équipe a été notifiée. Veuillez réessayer plus tard.';
          break;
        default:
          description = error.message || description;
          break;
      }

      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Connexion</CardTitle>
        <CardDescription>
          Accédez à votre tableau de bord WiFiLeads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
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
                   <div className="flex items-center">
                    <FormLabel>Mot de passe</FormLabel>
                    <Link href="/forgot-password" className="ml-auto inline-block text-sm text-primary hover:underline">
                        Mot de passe oublié?
                    </Link>
                    </div>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Pas encore de compte?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            S'inscrire
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
