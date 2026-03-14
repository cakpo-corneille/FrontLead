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
}: {
  children: React.ReactNode;
  isInteractive?: boolean;
  isLoading?: boolean;
}) => {
  const { profile } = useAuth();

  return (
    // Outer container: Handles background, blur, and rounded corners.
    <div className={cn(
        "bg-white/90 backdrop-blur-md rounded-xl text-left",
        "w-full max-w-[98%] max-h-[90%]", 
        "flex flex-col"
    )}>
      
      {/* Scrollable inner container */}
      <div className={cn(
          "overflow-y-auto space-y-4",
          "px-4 py-6",
          // Custom scrollbar with a TRANSPARENT track
          "scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent scrollbar-thumb-rounded-full"
        )}>

        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-start gap-2 mb-2">
            {profile?.logo_url ? (
              <Image
                src={profile.logo_url}
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
            <h3 className="font-bold text-lg text-gray-900">
              {profile?.business_name || 'Votre Business'}
            </h3>
          </div>
          <p className="text-xs text-gray-600">
            Remplissez ce formulaire pour vous connecter.
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
            {isLoading ? 'Connexion...' : 'Accéder au WiFi'}
          </Button>
        </div>

      </div>
    </div>
  );
};