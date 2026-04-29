'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Activity,
  FilePenLine,
  MoreHorizontal,
  LogOut,
  HeadphonesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { navItems, supportItems } from '@/lib/nav-config';
import { useAuth } from '@/contexts/auth-context';

const primaryItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Accueil', exact: true },
  { href: '/dashboard/clients', icon: Users, label: 'Clients' },
  { href: '/dashboard/tracking', icon: Activity, label: 'Wi-Fi' },
  { href: '/dashboard/form-builder', icon: FilePenLine, label: 'Formulaire' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const primaryHrefs = primaryItems.map((i) => i.href);
  const secondaryItems = navItems.filter(
    (item) => !primaryHrefs.includes(item.href),
  );

  const moreActive = secondaryItems.some((it) => pathname.startsWith(it.href));

  const handleLogout = () => {
    setMoreOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 sm:hidden border-t border-border bg-card/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid grid-cols-5 h-[64px]">
          {primaryItems.map((it) => {
            const active = isActive(it.href, it.exact);
            const Icon = it.icon;
            return (
              <li key={it.href} className="flex">
                <Link
                  href={it.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-w-0',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', active && 'text-primary')} />
                  <span
                    className={cn(
                      'text-[10px] leading-none font-semibold truncate max-w-full px-1',
                      active && 'text-primary',
                    )}
                  >
                    {it.label}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="flex">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-w-0',
                moreActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <MoreHorizontal className={cn('h-5 w-5 shrink-0', moreActive && 'text-primary')} />
              <span
                className={cn(
                  'text-[10px] leading-none font-semibold truncate max-w-full px-1',
                  moreActive && 'text-primary',
                )}
              >
                Plus
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="px-5 pt-5 pb-3 text-left">
            <SheetTitle className="font-headline text-base">Plus d'options</SheetTitle>
            <SheetDescription className="text-xs">
              Accédez aux autres sections de votre espace.
            </SheetDescription>
          </SheetHeader>

          <div className="px-3 pb-3">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Plate-forme
            </p>
            <div className="space-y-0.5">
              {secondaryItems.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Support
            </p>
            <div className="space-y-0.5">
              {supportItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', item.color)} />
                  <span className="flex-1">{item.label}</span>
                </a>
              ))}
              <a
                href="https://wa.me/22964861850"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <HeadphonesIcon className="h-5 w-5 shrink-0 text-accent" />
                <span className="flex-1">Centre d'aide</span>
              </a>
            </div>

            <div className="my-3 h-px bg-border" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">Se déconnecter</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
