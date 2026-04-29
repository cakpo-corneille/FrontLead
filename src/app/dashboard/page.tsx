'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  UserCheck,
  TrendingUp,
  Loader2,
  Zap,
  Wifi,
  Award,
  Activity,
  Coins,
  Clock,
  Radio,
  History,
  Download,
  LayoutGrid,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type {
  AnalyticsSummary,
  ConnectionSession,
  SessionOverview,
  SessionsByDay,
} from '@/lib/types';

interface HistoryEntry {
  month: string;
  month_label: string;
  leads: number;
  sessions: number;
  revenue: number;
}

const chartConfig = {
  leads: { label: 'Clients', color: 'hsl(var(--primary))' },
  sessions: { label: 'Sessions', color: 'hsl(217 91% 60%)' },
};

type Period = 'day' | 'week' | 'month';

function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return '0 s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${seconds} s`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'blue',
}: {
  icon: typeof Wifi;
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose';
}) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">
            {label}
          </p>
          <p className="text-xl font-semibold leading-tight truncate">
            {value}
          </p>
          {hint && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {hint}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [overview, setOverview] = useState<SessionOverview | null>(null);
  const [byDay, setByDay] = useState<SessionsByDay | null>(null);
  const [recentSessions, setRecentSessions] = useState<ConnectionSession[]>([]);
  const [period, setPeriod] = useState<Period>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasRouters, setHasRouters] = useState<boolean>(false);

  const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;

  useEffect(() => {
    if (!fetchWithAuth) return;
    let cancelled = false;

    const fetchAll = async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const [sumRes, ovRes, dayRes, sessRes, routerRes] = await Promise.all([
          fetchWithAuth(`/analytics/summary/?days=${periodDays}`),
          fetchWithAuth(`/session-analytics/overview/?days=${periodDays}`),
          fetchWithAuth(`/session-analytics/by-day/?days=${periodDays}`),
          fetchWithAuth('/sessions/?page_size=15'),
          fetchWithAuth('/routers/'),
        ]);
        const [sum, ov, day, sess, routers] = await Promise.all([
          sumRes.json(),
          ovRes.json(),
          dayRes.json(),
          sessRes.json(),
          routerRes.json(),
        ]);
        if (cancelled) return;
        setSummary(sum);
        setOverview(ov);
        setByDay(day);
        setRecentSessions(Array.isArray(sess) ? sess : sess.results ?? []);
        setHasRouters(Array.isArray(routers) ? routers.length > 0 : (routers.results ?? []).length > 0);
      } catch (e) {
        if (!silent && !cancelled) {
          toast({
            variant: 'destructive',
            title: 'Erreur de chargement',
            description: (e as Error).message || 'Impossible de charger les statistiques.',
          });
        }
      } finally {
        if (!silent && !cancelled) setIsLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchAll(true);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchWithAuth, toast, periodDays]);

  const fetchHistory = async () => {
    if (history.length > 0) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetchWithAuth('/analytics/history/');
      const data = await res.json();
      setHistory(data);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de charger l'historique.",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formattedChartData = useMemo(() => {
    if (!summary?.leads_series) return [];
    return summary.leads_series.map((item) => ({
      ...item,
      label: format(
        parseISO(item.label),
        period === 'day' ? 'HH:mm' : period === 'month' ? 'dd/MM' : 'EEE dd',
        { locale: fr },
      ),
    }));
  }, [summary?.leads_series, period]);

  const sessionsChartData = useMemo(() => {
    if (!byDay) return [];
    return byDay.labels.map((label, i) => ({
      label: format(parseISO(label), period === 'month' ? 'dd/MM' : 'EEE dd', { locale: fr }),
      count: byDay.data[i] ?? 0,
    }));
  }, [byDay, period]);

  const periodSessions =
    period === 'day'
      ? overview?.sessions_today ?? 0
      : period === 'week'
      ? overview?.sessions_this_week ?? 0
      : overview?.sessions_this_month ?? 0;

  const periodRevenue =
    period === 'day'
      ? overview?.estimated_revenue_today_fcfa ?? 0
      : period === 'week'
      ? overview?.estimated_revenue_week_fcfa ?? 0
      : overview?.estimated_revenue_month_fcfa ?? 0;

  const renderSkeleton = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </>
  );

  const renderEmptyState = () => (
    <Card>
      <CardContent className="p-12 text-center">
        <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">
          Bienvenue sur votre tableau de bord !
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Il n'y a pas encore de données à afficher. Pour commencer à collecter
          des informations, vous devez intégrer le portail captif sur votre
          routeur Wi-Fi.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/integration">
            Voir les instructions d'intégration
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const hasAnyData =
    (summary?.total_leads ?? 0) > 0 || (overview?.total_sessions ?? 0) > 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* En-tête harmonisé avec les autres pages */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <LayoutGrid className="h-7 w-7 text-primary" />
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivi en temps réel de vos accès Wi-Fi et de votre base clients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Sheet
            open={isHistoryOpen}
            onOpenChange={(open) => {
              setIsHistoryOpen(open);
              if (open) fetchHistory();
            }}
          >
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="mr-2 h-3.5 w-3.5" />
                Historique
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0">
              <div className="p-6 border-b sticky top-0 z-10 bg-background">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2 text-xl font-bold font-headline">
                    <History className="h-5 w-5 text-primary" />
                    Historique annuel
                  </SheetTitle>
                  <SheetDescription>
                    Performances mensuelles cumulées.
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div
                className="flex-1 overflow-y-auto p-4 sm:p-6"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain',
                }}
              >
                {isLoadingHistory ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mois</TableHead>
                          <TableHead className="text-center">Clients</TableHead>
                          <TableHead className="text-center">Sessions</TableHead>
                          <TableHead className="text-right">Revenus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                              Aucun historique disponible.
                            </TableCell>
                          </TableRow>
                        ) : (
                          history.map((entry, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium capitalize">
                                {entry.month_label}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                  {entry.leads}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                                  {entry.sessions}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {entry.revenue.toLocaleString('fr-FR')}
                                <span className="text-xs text-muted-foreground ml-1">F</span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <SheetFooter className="p-4 border-t bg-muted/30">
                <div className="flex items-center justify-between w-full gap-2">
                  <Button variant="ghost" onClick={() => setIsHistoryOpen(false)}>
                    Fermer
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter PDF
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="day">Aujourd'hui</TabsTrigger>
              <TabsTrigger value="week">7 jours</TabsTrigger>
              <TabsTrigger value="month">30 jours</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        renderSkeleton()
      ) : !hasAnyData ? (
        renderEmptyState()
      ) : (
        <>
          {/* KPIs leads */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={Users}
              tone="blue"
              label="Clients totaux"
              value={summary?.total_leads ?? 0}
              hint="Base globale"
            />
            <KpiCard
              icon={TrendingUp}
              tone="emerald"
              label="Nouveaux"
              value={summary?.period_leads ?? 0}
              hint="Sur la période"
            />
            <KpiCard
              icon={UserCheck}
              tone="violet"
              label="Vérifiés"
              value={summary?.period_verified_leads ?? 0}
              hint="Comptes validés"
            />
            <KpiCard
              icon={Award}
              tone="amber"
              label="Taux de retour"
              value={`${(summary?.period_return_rate ?? 0).toFixed(1)}%`}
              hint="Fidélité"
            />
          </div>

          {/* KPIs sessions / revenus */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={Radio}
              tone="emerald"
              label="Sessions actives"
              value={overview?.active_sessions ?? 0}
              hint="connectés en ce moment"
            />
            <KpiCard
              icon={Activity}
              tone="blue"
              label="Sessions"
              value={periodSessions}
              hint="sur la période"
            />
            <KpiCard
              icon={Coins}
              tone="amber"
              label="Chiffre d'affaires"
              value={`${periodRevenue.toLocaleString('fr-FR')} F`}
              hint="estimé"
            />
            <KpiCard
              icon={Clock}
              tone="violet"
              label="Durée moyenne"
              value={formatDuration(overview?.avg_session_seconds ?? 0)}
              hint="par session"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {period === 'day'
                    ? 'Activité (24h)'
                    : period === 'week'
                    ? 'Activité (7 jours)'
                    : 'Activité (30 jours)'}
                </CardTitle>
                <CardDescription>
                  Nombre de nouveaux clients identifiés.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 pl-2 pr-3">
                {formattedChartData && formattedChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <RechartsAreaChart
                      data={formattedChartData}
                      margin={{ left: 0, right: 0, top: 5, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} className="stroke-muted" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        allowDecimals={false}
                        fontSize={11}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Area
                        dataKey="count"
                        name="Clients"
                        type="monotone"
                        fill="url(#colorLeads)"
                        stroke="var(--color-leads)"
                        strokeWidth={2}
                      />
                    </RechartsAreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Wifi className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aucune activité récente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  {period === 'day'
                    ? 'Volume des sessions (24h)'
                    : period === 'week'
                    ? 'Volume des sessions (7j)'
                    : 'Volume des sessions (30j)'}
                </CardTitle>
                <CardDescription>
                  Nombre de connexions Wi-Fi enregistrées.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 pl-2 pr-3">
                {sessionsChartData && sessionsChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <RechartsAreaChart
                      data={sessionsChartData}
                      margin={{ left: 0, right: 0, top: 5, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} className="stroke-muted" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        allowDecimals={false}
                        fontSize={11}
                      />
                      <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Area
                        dataKey="count"
                        name="Sessions"
                        type="monotone"
                        fill="url(#colorSessions)"
                        stroke="var(--color-sessions)"
                        strokeWidth={2}
                      />
                    </RechartsAreaChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aucune session enregistrée
                    </p>
                    <Button variant="link" asChild className="text-xs">
                      <Link href="/dashboard/integration">Activer le tracking</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top clients + sessions récentes */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 items-stretch h-full">
            {/* Top clients */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  Top clients
                </CardTitle>
                <CardDescription>Vos clients les plus fidèles.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Client</TableHead>
                      <TableHead className="text-right pr-6">Fidélité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(summary?.top_clients || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-32 text-center text-sm text-muted-foreground">
                          Pas encore de top clients.
                        </TableCell>
                      </TableRow>
                    ) : (
                      summary!.top_clients.map((client, index) => (
                        <TableRow key={client.id}>
                          <TableCell className="pl-6 font-medium">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  'h-7 w-7 flex items-center justify-center rounded-md text-xs font-bold shrink-0',
                                  index === 0 && 'bg-amber-100 text-amber-700',
                                  index === 1 && 'bg-muted text-foreground',
                                  index === 2 && 'bg-orange-100 text-orange-700',
                                  index > 2 && 'bg-muted text-muted-foreground',
                                )}
                              >
                                {index + 1}
                              </div>
                              <span className="truncate">
                                {client.name || client.email || client.phone || client.mac_address}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6 font-semibold">
                            {client.loyalty_percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sessions récentes */}
            <Card className="lg:col-span-3 flex flex-col">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Sessions récentes
                </CardTitle>
                <CardDescription>
                  Les dernières connexions sur vos bornes.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {recentSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aucune session récente.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Vue mobile : cards */}
                    <div className="md:hidden divide-y">
                      {recentSessions.slice(0, 20).map((s) => (
                        <div key={s.id} className="px-4 py-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">
                                {s.client_email || s.client_phone || `Client #${s.client}`}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground uppercase truncate">
                                {s.mac_address}
                                {s.ip_address ? ` · ${s.ip_address}` : ''}
                              </div>
                            </div>
                            {s.is_active ? (
                              <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="shrink-0">
                                Terminée
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {s.ticket_id ? (
                              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                                {s.ticket_id}
                              </code>
                            ) : null}
                            <Badge variant="outline" className="text-[11px]">
                              {s.plan_name || 'Sans plan'}
                            </Badge>
                            {hasRouters && (
                              <span className="text-muted-foreground ml-auto">
                                {formatDuration(s.uptime_seconds || 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Vue desktop : table */}
                    <div className="hidden md:block w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-6">Client</TableHead>
                            <TableHead>MAC / IP</TableHead>
                            <TableHead>Ticket</TableHead>
                            <TableHead>Plan</TableHead>
                            {hasRouters && (
                                <>
                                    <TableHead>Durée</TableHead>
                                    <TableHead className="text-right pr-6">Statut</TableHead>
                                </>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentSessions.slice(0, 20).map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="pl-6">
                                <div className="font-medium text-sm">
                                  {s.client_email || s.client_phone || `Client #${s.client}`}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-[11px] font-mono text-muted-foreground uppercase">
                                  {s.mac_address}
                                </div>
                                {s.ip_address && (
                                  <div className="text-[11px] font-mono text-muted-foreground">
                                    {s.ip_address}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {s.ticket_id ? (
                                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                                    {s.ticket_id}
                                  </code>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[11px]">
                                  {s.plan_name || 'Sans plan'}
                                </Badge>
                              </TableCell>
                              {hasRouters && (
                                  <>
                                      <TableCell className="text-sm whitespace-nowrap">
                                        {formatDuration(s.uptime_seconds || 0)}
                                      </TableCell>
                                      <TableCell className="text-right pr-6">
                                        {s.is_active ? (
                                          <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline">Terminée</Badge>
                                        )}
                                      </TableCell>
                                  </>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
