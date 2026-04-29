'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  ChevronDown,
  HeadphonesIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ConflictAlert } from '@/lib/types';
import { navItems, supportItems } from '@/lib/nav-config';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, profile, fetchWithAuth, user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const router = useRouter();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [pendingAlerts, setPendingAlerts] = useState<number>(0);
  const prefersReducedMotion = useReducedMotion();
  const sidebarTransition = prefersReducedMotion
    ? { duration: 0.15, ease: 'easeOut' as const }
    : { type: 'spring' as const, stiffness: 300, damping: 30 };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!user || !fetchWithAuth) return;
    let cancelled = false;

    const fetchPending = async () => {
      try {
        const res = await fetchWithAuth('/alerts/?status=PENDING');
        if (!res.ok) return;
        const data = await res.json();
        const list: ConflictAlert[] = Array.isArray(data)
          ? data
          : data.results || [];
        if (!cancelled) {
          setPendingAlerts(
            list.filter((a) => a.status === 'PENDING').length,
          );
        }
      } catch {
        // silencieux
      }
    };

    fetchPending();
    const interval = setInterval(fetchPending, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, fetchWithAuth, pathname]);

  const badgeFor = (key?: 'alerts'): number =>
    key === 'alerts' ? pendingAlerts : 0;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={sidebarTransition}
      className="hidden h-screen flex-col bg-sidebar text-sidebar-foreground sm:flex relative z-40 shadow-2xl border-r border-white/10"
    >
      {/* Logo & Toggle Section */}
      <div className="flex h-[72px] items-center px-3 border-b border-white/10 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex items-center gap-3 overflow-hidden ml-1"
            >
              <Link href="/dashboard" className="flex items-center gap-3 font-bold text-lg">
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
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0",
            isCollapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-6 px-2.5 sidebar-scroll-area space-y-8">
        <div>
          {!isCollapsed && (
            <p className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Plate-forme
            </p>
          )}
          <nav className="space-y-1.5">
            {navItems
              .filter(item => item.label !== 'Paramètres' && item.label !== 'Intégration')
              .map((item) => {
              const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200',
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-sidebar-primary-foreground")} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-semibold truncate flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  
                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 space-y-2 border-t border-white/10 bg-black/5">
        {/* SUPPORT */}
        {isCollapsed ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-full flex items-center justify-center rounded-xl px-0 py-3 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Support"
              >
                <HeadphonesIcon className="h-5 w-5 text-accent shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              sideOffset={12}
              className="w-60 p-2 rounded-2xl border border-border bg-card shadow-xl"
            >
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Support
              </div>
              <div className="space-y-0.5">
                {supportItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className={cn('h-4 w-4', item.color)} />
                    {item.label}
                  </a>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <button
              onClick={() => setIsSupportOpen((v) => !v)}
              className="w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <HeadphonesIcon className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm font-semibold flex-1 text-left">Support</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', isSupportOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {isSupportOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-2 space-y-1 overflow-hidden"
                >
                  {supportItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-4 py-2 text-white/50 text-xs hover:text-white transition-colors"
                    >
                      <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                      {item.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* CONFIGURATION */}
        {isCollapsed ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-full flex items-center justify-center rounded-xl px-0 py-3 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                aria-label="Configuration"
              >
                <Settings className="h-5 w-5 text-accent shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              sideOffset={12}
              className="w-64 p-2 rounded-2xl border border-border bg-card shadow-xl"
            >
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {profile?.business_name || 'Configuration'}
              </div>
              <div className="space-y-0.5">
                {navItems
                  .filter((item) => item.label === 'Paramètres' || item.label === 'Intégration')
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  ))}
              </div>
              <div className="my-1 h-px bg-muted" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <button
              onClick={() => setIsConfigOpen((v) => !v)}
              className="w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm font-semibold flex-1 text-left">Configuration</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', isConfigOpen && 'rotate-180')} />
            </button>
            <AnimatePresence initial={false}>
              {isConfigOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-2 space-y-1 pt-1 overflow-hidden"
                >
                  {navItems
                    .filter((item) => item.label === 'Paramètres' || item.label === 'Intégration')
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-4 py-2 text-white/70 text-xs hover:text-white transition-colors"
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </Link>
                    ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-lg px-4 py-2 text-white/70 text-xs hover:text-white transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Se déconnecter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.aside>
  );
}
