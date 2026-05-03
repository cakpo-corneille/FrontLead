'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FormOverlayPreview = ({
  children,
  isInteractive = false,
  isLoading = false,
  title,
  description,
  logoUrl,
  buttonLabel,
}: {
  children: React.ReactNode;
  isInteractive?: boolean;
  isLoading?: boolean;
  title?: string;
  description?: string;
  logoUrl?: string | null;
  buttonLabel?: string;
}) => {
  const { profile, formConfig } = useAuth();

  const displayTitle = title ?? formConfig?.title ?? profile?.business_name ?? 'Bienvenue !';
  const displayDescription = description ?? formConfig?.description ?? 'Remplissez ce formulaire pour vous connecter.';
  const displayLogoUrl = logoUrl !== undefined ? logoUrl : (formConfig?.logo_url ?? profile?.logo_url ?? null);
  const displayButtonLabel = buttonLabel ?? formConfig?.button_label ?? 'Accéder au WiFi';

  return (
    <div className={cn(
        "bg-card/90 backdrop-blur-md rounded-xl text-left",
        "w-full max-w-[98%] max-h-[90%]", 
        "flex flex-col"
    )}>
      
      <div className={cn(
          "overflow-y-auto space-y-4",
          "px-4 py-6",
          "scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent scrollbar-thumb-rounded-full"
        )}>

        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-start gap-2 mb-2">
            {displayLogoUrl ? (
              <Image
                src={displayLogoUrl}
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Logo className="h-5 w-5 text-primary" />
              </div>
            )}
            <h3 className="font-bold text-lg text-foreground">
              {displayTitle}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {displayDescription}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-2 flex-grow">
            {children}
        </div>

        {/* Footer Button */}
        <div className="flex-shrink-0">
          <Button
            type={isInteractive ? 'submit' : 'button'}
            className="w-full h-9"
            disabled={!isInteractive || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Connexion...' : displayButtonLabel}
          </Button>
        </div>

      </div>
    </div>
  );
};
