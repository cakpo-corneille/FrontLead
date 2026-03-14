'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, FilePenLine, Users, Settings, LogOut, Zap } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '../ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord' },
  { href: '/dashboard/form-builder', icon: FilePenLine, label: 'Formulaire' },
  { href: '/dashboard/clients', icon: Users, label: 'Mes clients' },
  { href: '/dashboard/integration', icon: Zap, label: 'Intégration' },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuration' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, profile } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-gray-900 text-white sm:flex">
      <div className="flex h-[60px] items-center border-b border-gray-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-lg overflow-hidden">
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
      <div className="mt-auto border-t border-gray-800 p-4">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white">
            <LogOut className="h-4 w-4" />
            Se déconnecter
        </Button>
      </div>
    </aside>
  );
}