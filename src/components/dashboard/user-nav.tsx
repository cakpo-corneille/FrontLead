'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

// Helper function to generate a color from a string
const generateColorFromString = (str: string) => {
  let hash = 0;
  if (!str || str.length === 0) return 'hsl(0, 0%, 80%)';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash % 360);
  // Using fixed saturation and lightness for pleasant pastel colors
  return `hsl(${hue}, 70%, 85%)`;
};

export function UserNav() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  }

  const avatarColor = React.useMemo(() => {
    if (!profile) return undefined;
    return generateColorFromString(profile.user.email || profile.nom || 'user');
  }, [profile]);


  if (!profile) {
    return (
       <div className="flex items-center gap-3">
         <div className='text-right hidden sm:block'>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
         </div>
         <Skeleton className="h-9 w-9 rounded-full" />
       </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto rounded-full px-0 sm:px-2">
            <div className="flex items-center gap-3">
                <div className='text-right hidden sm:block'>
                    <p className="text-sm font-medium leading-none">{profile.prenom} {profile.nom}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {profile.user.email}
                    </p>
                </div>
                <Avatar className="h-9 w-9">
                    <AvatarFallback 
                      style={{ backgroundColor: avatarColor, color: 'hsl(0, 0%, 25%)' }}
                    >
                      {getInitials(profile.prenom, profile.nom)}
                    </AvatarFallback>
                </Avatar>
            </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.prenom} {profile.nom}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Profil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Facturation</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Configuration</Link>
          </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
