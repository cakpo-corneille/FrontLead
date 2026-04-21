'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  FilePenLine,
  Users,
  Settings,
  LogOut,
  Zap,
  Menu,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  HeadphonesIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { UserNav } from './user-nav';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord' },
  { href: '/dashboard/form-builder', icon: FilePenLine, label: 'Formulaire' },
  { href: '/dashboard/clients', icon: Users, label: 'Mes clients' },
  { href: '/dashboard/integration', icon: Zap, label: 'Intégration' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuration' },
];

const supportItems = [
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/22964861850', color: 'text-green-400' },
  { icon: Phone, label: 'Téléphone', href: 'tel:+22964861850', color: 'text-blue-400' },
  { icon: Mail, label: 'Email', href: 'mailto:support@leadwifi.com', color: 'text-purple-400' },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center gap-4 border-b bg-background px-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col bg-gray-900 p-0 text-white sm:max-w-xs border-r-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Naviguez vers les différentes sections du tableau de bord.</SheetDescription>
          </SheetHeader>
          <div className="flex h-[60px] items-center border-b border-gray-800 px-6">
            <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 font-semibold text-lg overflow-hidden">
              {profile?.logo_url ? (
                <Image
                  src={profile.logo_url}
                  alt="Business Logo"
                  width={32}
                  height={32}
                  className="w-8 h-auto rounded-md object-contain flex-shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold flex-shrink-0">
                  {profile?.business_name?.[0] || 'B'}
                </div>
              )}
              <span className="truncate">{profile?.business_name || 'Dashboard'}</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto py-2 sidebar-scroll-area">
            <nav className="grid items-start px-4 text-sm font-medium">
              <span className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">Plate-forme</span>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white',
                      isActive && 'bg-blue-600 text-white'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t border-gray-800 p-4 space-y-1">
            <button
              onClick={() => setIsSupportOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white text-sm font-medium"
            >
              <span className="flex items-center gap-3">
                <HeadphonesIcon className="h-4 w-4 text-teal-400" />
                Nous contacter
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', isSupportOpen && 'rotate-180')} />
            </button>
            {isSupportOpen && (
              <div className="ml-4 space-y-1 pb-1">
                {supportItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 text-sm transition-all hover:bg-gray-800 hover:text-white"
                  >
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
