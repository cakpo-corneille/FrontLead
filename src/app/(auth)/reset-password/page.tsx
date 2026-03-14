
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import React, { useState, useEffect, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context'; // Importation

const resetPasswordSchema = z
  .object({
    code: z.string().min(6, { message: 'Le code doit contenir 6 chiffres.' }).max(6),
    newPassword: z
      .string()
      .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
      .max(15, { message: 'Le mot de passe ne peut pas dépasser 15 caractères.' })
      .regex(/[A-Z]/, { message: 'Doit contenir au moins une majuscule.' })
      .regex(/[a-z]/, { message: 'Doit contenir au moins une minuscule.' })
      .regex(/[0-9]/, { message: 'Doit contenir au moins un chiffre.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth(); // Utilisation du contexte

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    const userId = sessionStorage.getItem('user_id_for_reset');

    if (!userId) {
        toast({
            variant: 'destructive',
            title: 'Erreur de session',
            description: "Impossible de trouver l'identifiant. Veuillez refaire la demande.",
        });
        setIsLoading(false);
        router.push('/forgot-password');
        return;
    }
    
    try {
      const payload = {
        user_id: parseInt(userId),
        code: data.code,
        new_password: data.newPassword,
      };

      await resetPassword(payload);
      
      toast({
        title: 'Succès',
        description: 'Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.',
      });

      router.push('/login');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Échec de la réinitialisation',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email manquant',
        description: 'Veuillez recommencer la procédure de mot de passe oublié.',
      });
      router.push('/forgot-password');
    }
  }, [email, router, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Réinitialiser le mot de passe</CardTitle>
        <CardDescription>
          Un code a été envoyé à <strong>{email}</strong>. Entrez-le ci-dessous.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleResetPassword)} className="grid gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de vérification</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Réinitialiser le mot de passe
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordComponent />
        </Suspense>
    )
}
