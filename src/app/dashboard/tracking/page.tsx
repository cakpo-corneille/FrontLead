'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Wifi,
  Users,
  Clock,
  Download,
  Coins,
  RefreshCcw,
  Calendar,
  Loader2,
  Inbox,
  CircleDot,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type {
  ConnectionSession,
  SessionOverview,
  SessionsByDay,
  SessionsByHour,
  TopSessionClient,
} from '@/lib/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

type Period = 'today' | 'week' | 'month';
const PERIOD_LABELS: Record<Period, string> = {
  today: "Aujourd'hui",
  week: 'Semaine',
  month: 'Mois',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFcfa = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';

const formatBytes = (mb: number) => {
  if (mb >= 1024) return (mb / 1024).toFixed(2) + ' GB';
  return mb.toFixed(1) + ' MB';
};

const formatDuration = (seconds: number) => {
  if (!seconds) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (!h) parts.push(`${s}s`);
  return parts.join(' ');
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

// ─── KPI ──────────────────────────────────────────────────────────────────────

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
  tone?: 'blue' | 'emerald' | 'amber' | 'violet';
}) {
  const tones: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center',
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();

  const [overview, setOverview] = useState<SessionOverview | null>(null);
  const [byDay, setByDay] = useState<SessionsByDay | null>(null);
  const [byHour, setByHour] = useState<SessionsByHour | null>(null);
  const [topClients, setTopClients] = useState<TopSessionClient[]>([]);
  const [sessions, setSessions] = useState<ConnectionSession[]>([]);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'active'>('all');
  const [period, setPeriod] = useState<Period>('today');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAll = useCallback(
    async (silent = false) => {
      if (!fetchWithAuth) return;
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        const [ovRes, dayRes, hourRes, topRes, sessRes] = await Promise.all([
          fetchWithAuth('/tracking-analytics/overview/'),
          fetchWithAuth('/tracking-analytics/by-day/?days=30'),
          fetchWithAuth('/tracking-analytics/by-hour/'),
          fetchWithAuth('/tracking-analytics/top-clients/'),
          fetchWithAuth('/sessions/'),
        ]);

        if (ovRes.ok) setOverview(await ovRes.json());
        if (dayRes.ok) setByDay(await dayRes.json());
        if (hourRes.ok) setByHour(await hourRes.json());
        if (topRes.ok) {
          const t = await topRes.json();
          setTopClients(Array.isArray(t) ? t : t.results || []);
        }
        if (sessRes.ok) {
          const s = await sessRes.json();
          setSessions(Array.isArray(s) ? s : s.results || []);
        }
      } catch (err) {
        if (!silent) {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de charger les données de tracking.',
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchWithAuth, toast],
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Auto-refresh toutes les 30s (sessions actives bougent vite)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden')
        return;
      loadAll(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const filteredSessions = useMemo(() => {
    const now = new Date();
    const cutoff =
      period === 'today' ? startOfDay(now) :
      period === 'week'  ? startOfWeek(now, { weekStartsOn: 1 }) :
                           startOfMonth(now);

    let result = sessions.filter((s) => {
      if (!s.started_at) return false;
      if (new Date(s.started_at) < cutoff) return false;
      if (sessionFilter === 'active' && s.status !== 'connecté') return false;
      return true;
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        [s.mac_address, s.ip_address, s.client_email, s.client_phone, s.plan_name, s.ticket_id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }

    return result;
  }, [sessions, period, sessionFilter, search]);

  const dayChartData = useMemo(
    () =>
      (byDay?.labels || []).map((label, i) => ({
        date: label,
        sessions: byDay?.data[i] || 0,
      })),
    [byDay],
  );

  const hourChartData = useMemo(
    () =>
      (byHour?.labels || []).map((label, i) => ({
        hour: `${label}h`,
        sessions: byHour?.data[i] || 0,
      })),
    [byHour],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Activity className="h-7 w-7 text-blue-600" />
            Activité Wi-Fi
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivez les sessions de vos clients en temps réel : connexions,
            consommation et revenus estimés.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAll(true)}
          disabled={isRefreshing}
        >
          <RefreshCcw
            className={cn('mr-2 h-3.5 w-3.5', isRefreshing && 'animate-spin')}
          />
          Actualiser
        </Button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={CircleDot}
          tone="emerald"
          label="Sessions actives"
          value={overview?.active_sessions ?? 0}
          hint="connectés en ce moment"
        />
        <KpiCard
          icon={Wifi}
          tone="blue"
          label="Sessions aujourd'hui"
          value={overview?.sessions_today ?? 0}
          hint={`${overview?.sessions_this_week ?? 0} sur 7 jours`}
        />
        <KpiCard
          icon={Coins}
          tone="amber"
          label="Revenus du jour"
          value={formatFcfa(overview?.estimated_revenue_today_fcfa ?? 0)}
          hint={`${formatFcfa(
            overview?.estimated_revenue_month_fcfa ?? 0,
          )} ce mois`}
        />
        <KpiCard
          icon={Clock}
          tone="violet"
          label="Durée moyenne"
          value={formatDuration(overview?.avg_session_seconds ?? 0)}
          hint={`${formatBytes(overview?.total_mb ?? 0)} consommés`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Sessions sur 30 jours
            </CardTitle>
            <CardDescription>
              Évolution quotidienne du nombre de connexions.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {dayChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Aucune donnée pour le moment.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dayChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                      })
                    }
                  />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString('fr-FR', {
                        dateStyle: 'medium',
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Heures de pointe</CardTitle>
            <CardDescription>
              Répartition des sessions par heure (toutes périodes).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {hourChartData.every((d) => d.sessions === 0) ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Aucune donnée pour le moment.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" fontSize={11} interval={2} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onglets : sessions & top clients */}
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="top">Top clients</TabsTrigger>
        </TabsList>

        {/* SESSIONS */}
        <TabsContent value="sessions" className="space-y-3">
          <Card>
            <CardHeader className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    Historique des sessions
                  </CardTitle>
                  <CardDescription>
                    {filteredSessions.length} session
                    {filteredSessions.length > 1 ? 's' : ''} affichée
                    {filteredSessions.length > 1 ? 's' : ''}.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex gap-1">
                    {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={period === p ? 'default' : 'outline'}
                        className="h-8 px-3 text-xs"
                        onClick={() => setPeriod(p)}
                      >
                        {PERIOD_LABELS[p]}
                      </Button>
                    ))}
                  </div>
                  <Tabs
                    value={sessionFilter}
                    onValueChange={(v) => setSessionFilter(v as typeof sessionFilter)}
                  >
                    <TabsList>
                      <TabsTrigger value="all">Toutes</TabsTrigger>
                      <TabsTrigger value="active">Actives</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <Input
                placeholder="Rechercher MAC, IP, client…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72"
              />
            </CardHeader>
            <CardContent>
              {filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
                  <Inbox className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">
                    Aucune session
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Les sessions apparaîtront dès le 1er heartbeat MikroTik.
                  </p>
                </div>
              ) : (
                <>
                  {/* Vue mobile : cards empilées */}
                  <div className="md:hidden space-y-3">
                    {filteredSessions.slice(0, 25).map((s, i) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {s.client_first_name || s.client_last_name || s.client_phone || s.client_email || `#${i + 1}`}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase truncate">
                              {s.mac_address}
                              {s.ip_address ? ` · ${s.ip_address}` : ''}
                            </div>
                          </div>
                          {s.status === 'connecté' ? (
                            <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Connecté
                            </Badge>
                          ) : s.status === 'expiré' ? (
                            <Badge className="shrink-0 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                              Expiré
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-foreground shrink-0">
                              Déconnecté
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {s.ticket_id && (
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                              {s.ticket_id}
                            </code>
                          )}
                          <Badge variant="outline" className="text-[11px]">
                            {s.plan_name || '—'}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Download className="h-3 w-3" />
                            {formatBytes(s.total_mb)}
                          </div>
                          <span className="text-muted-foreground ml-auto font-semibold">
                            {s.duration_human}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Démarré : {formatDate(s.started_at)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vue desktop / tablette : table */}
                  <div
                    className="hidden md:block w-full min-w-0 overflow-x-auto"
                    style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Statut</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Ticket</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Durée / Total</TableHead>
                          <TableHead>Conso.</TableHead>
                          <TableHead>Démarré</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessions.slice(0, 25).map((s, i) => (
                          <TableRow key={s.id}>
                            <TableCell>
                              {s.status === 'connecté' ? (
                                <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Connecté
                                </Badge>
                              ) : s.status === 'expiré' ? (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  Expiré
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-foreground">
                                  Déconnecté
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="font-medium">
                                {s.client_first_name || s.client_last_name || s.client_phone || s.client_email || `#${i + 1}`}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground uppercase">
                                {s.mac_address}
                              </div>
                            </TableCell>
                            <TableCell>
                              {s.ticket_id ? (
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                                  {s.ticket_id}
                                </code>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {s.plan_name || <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              <div className="font-semibold">{s.duration_human}</div>
                              {s.session_timeout_seconds ? (
                                <div className="text-[11px] text-muted-foreground">
                                  sur {formatDuration(s.session_timeout_seconds)}
                                </div>
                              ) : (
                                <div className="text-[11px] text-muted-foreground">Illimité</div>
                              )}
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Download className="h-3 w-3 text-muted-foreground" />
                                {formatBytes(s.total_mb)}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                ↓ {formatBytes(s.download_mb)} · ↑{' '}
                                {formatBytes(s.upload_mb)}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(s.started_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOP CLIENTS */}
        <TabsContent value="top" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top 10 clients les plus actifs
              </CardTitle>
              <CardDescription>
                Classés par nombre de sessions Wi-Fi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topClients.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Pas encore assez de données.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>MAC</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Temps total</TableHead>
                      <TableHead className="text-right">Conso.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.map((c, i) => (
                      <TableRow key={c.client_id}>
                        <TableCell className="font-semibold text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium">
                            {c.first_name || c.last_name || c.phone || c.email || `#${i + 1}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                            {c.mac_address}
                          </code>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {c.sessions_count}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatDuration(c.total_seconds)}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatBytes(c.total_mb)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
