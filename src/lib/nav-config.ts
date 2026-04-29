import {
  LayoutGrid,
  FilePenLine,
  Users,
  Settings,
  Zap,
  MessageCircle,
  Phone,
  Mail,
  ShieldAlert,
  Activity,
  Tag,
  Router,
} from 'lucide-react';

export const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord' },
  { href: '/dashboard/form-builder', icon: FilePenLine, label: 'Formulaire' },
  { href: '/dashboard/clients', icon: Users, label: 'Mes clients' },
  { href: '/dashboard/tracking', icon: Activity, label: 'Activité Wi-Fi' },
  { href: '/dashboard/routers', icon: Router, label: 'Mes routeurs' },
  { href: '/dashboard/ticket-plans', icon: Tag, label: 'Plans tarifaires' },
  { href: '/dashboard/integration', icon: Zap, label: 'Intégration' },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
];

export const supportItems = [
  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/22964861850', color: 'text-green-400' },
  { icon: Phone, label: 'Téléphone', href: 'tel:+22964861850', color: 'text-blue-400' },
  { icon: Mail, label: 'Email', href: 'mailto:support@leadwifi.com', color: 'text-purple-400' },
];
