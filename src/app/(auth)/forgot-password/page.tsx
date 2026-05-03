
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
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context'; // Importation

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Veuillez entrer une adresse email valide.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth(); // Utilisation du contexte

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleForgotPassword = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const responseData = await forgotPassword(data);
      
      toast({
        title: 'Email envoyé',
        description: responseData.message || 'Un code de réinitialisation a été envoyé à votre email.',
      });
      
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Échec de la demande',
        description: error.message || 'Vérifiez l\'adresse e-mail et réessayez.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Mot de passe oublié</CardTitle>
        <CardDescription>
          Entrez votre email pour recevoir un code de réinitialisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleForgotPassword)} className="grid gap-4">
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
            <Button type="submit" className="w-full" disabled={isLoading} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le code
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="font-semibold text-primary hover:underline inline-flex items-center gap-1">
             <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
