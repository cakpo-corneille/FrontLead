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
import { ThemeToggle } from './theme-toggle';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

import { navItems, supportItems } from '@/lib/nav-config';

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

  const currentNav = navItems.find((item) => pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard'));
  const pageTitle = currentNav ? currentNav.label : '';

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-6 md:px-8">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="sm:hidden shrink-0 hover:bg-muted">
            <Menu className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <div className="flex flex-1 items-center sm:hidden">
          <span className="font-bold text-sm truncate font-headline">{pageTitle}</span>
        </div>
        <SheetContent side="left" className="flex flex-col bg-sidebar p-0 text-sidebar-foreground sm:max-w-xs border-r-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Naviguez vers les différentes sections du tableau de bord.</SheetDescription>
          </SheetHeader>
          <div className="flex h-[72px] items-center border-b border-white/10 px-6">
            <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 font-bold text-lg overflow-hidden">
              {profile?.logo_url ? (
                <Image
                  src={profile.logo_url}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-contain bg-white/10 p-1"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
                  {profile?.business_name?.[0] || 'W'}
                </div>
              )}
              <span className="truncate font-headline tracking-tight">{profile?.business_name || 'WiFiLeads'}</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4 sidebar-scroll-area">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
                      isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', isActive && "text-sidebar-primary-foreground")} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t border-white/10 p-4 space-y-2 bg-black/5">
            <button
              onClick={() => setIsSupportOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-white/70 transition-all hover:bg-white/10 hover:text-white text-sm font-semibold"
            >
              <span className="flex items-center gap-3">
                <HeadphonesIcon className="h-5 w-5 text-accent" />
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
                    className="flex items-center gap-3 rounded-lg px-4 py-2 text-white/50 text-xs hover:text-white"
                  >
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    {item.label}
                  </a>
                ))}
              </div>
            )}
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-white/60 hover:bg-destructive/20 hover:text-white font-semibold text-sm">
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden sm:flex flex-col">
          <h2 className="text-lg font-bold font-headline text-foreground leading-none">{pageTitle}</h2>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{profile?.business_name || 'WiFiLeads Platform'}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <div className="hidden md:flex h-8 w-[1px] bg-muted" />
        <UserNav />
      </div>
    </header>
  );
}
