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
import { Label } from '@/components/ui/label';
import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CountdownTimer } from '@/components/auth/CountdownTimer';
import { useAuth } from '@/contexts/auth-context'; // Importation

function VerifyOtpComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const { verifyOtp, resendOtp } = useAuth(); // Utilisation du contexte

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timerKey, setTimerKey] = useState(0); // Key for resetting the timer

  const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>(
    Array(6).fill(0).map(() => React.createRef())
  );

  const handleResend = useCallback(async () => {
    if (!canResend) return;

    setIsResending(true);
    const userId = sessionStorage.getItem('user_id_for_verification');

    if (!userId) {
      toast({ variant: 'destructive', title: 'Erreur de session', description: "Veuillez réessayer de vous inscrire." });
      setIsResending(false);
      router.push('/signup');
      return;
    }

    try {
      const responseData = await resendOtp({ user_id: parseInt(userId) });

      toast({ title: 'Code renvoyé !', description: responseData.message || 'Un nouveau code a été envoyé.' });

      setIsExpired(false);
      setTimerKey(prevKey => prevKey + 1); // Reset the countdown timer
      setOtp(new Array(6).fill(''));
      inputRefs.current[0].current?.focus();
      setCanResend(false);
      setResendCooldown(60);

      const cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Échec du renvoi', description: error.message });
    } finally {
      setIsResending(false);
    }
  }, [canResend, router, toast, resendOtp]);

  const handleTimerExpire = useCallback(() => {
    setIsExpired(true);
    setCanResend(true);
  }, []);

  useEffect(() => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Email manquant', description: "Veuillez vous inscrire à nouveau." });
      router.push('/signup');
    }
  }, [email, router, toast]);
  
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].current?.focus();
    } else if (newOtp.every(val => val !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].current?.focus();
    }
  };

  const handleVerify = async (fullOtp: string) => {
    setIsLoading(true);
    const userId = sessionStorage.getItem('user_id_for_verification');

    if (!userId) {
        toast({ variant: 'destructive', title: 'Erreur de session', description: "Veuillez réessayer de vous inscrire." });
        setIsLoading(false);
        router.push('/signup');
        return;
    }

    try {
        await verifyOtp({ user_id: parseInt(userId), code: fullOtp });
        toast({ title: 'Compte vérifié !', description: 'Vous allez être redirigé.' });
        // La redirection est gérée par le contexte
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Échec de la vérification', description: error.message });
        setOtp(new Array(6).fill(''));
        inputRefs.current[0].current?.focus();
    } finally {
        setIsLoading(false);
    }
  };

  const resendButtonDisabled = !canResend || isLoading || isResending || resendCooldown > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Vérifier votre email</CardTitle>
        <CardDescription>
          Un code a été envoyé à <strong>{email}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center my-4">
          <CountdownTimer key={timerKey} initialSeconds={180} onExpire={handleTimerExpire} />
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="otp-1">Code de vérification</Label>
            <div className="flex justify-center gap-2">
              {otp.map((data, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  name="otp"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  ref={inputRefs.current[index]}
                  className="w-12 h-12 text-center text-lg"
                  disabled={isLoading || isExpired}
                />
              ))}
            </div>
          </div>
           {isLoading && <div className="flex justify-center mt-4"><Loader2 className="mr-2 h-6 w-6 animate-spin" /></div>}
        </form>
        <div className="mt-4 text-center text-sm">
          {isExpired ? (
            <p className="text-red-600 mb-2">Le code a expiré.</p>
          ) : (
            <p>Vous n'avez pas reçu de code? </p>
          )}
          <Button variant="link" className="underline p-0 h-auto" onClick={handleResend} disabled={resendButtonDisabled}>
            {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Renvoyer {resendCooldown > 0 && `(${resendCooldown}s)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpComponent />
        </Suspense>
    )
}
