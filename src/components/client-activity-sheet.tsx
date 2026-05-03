'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity,
  Wifi,
  Clock,
  Coins,
  Download,
  Upload,
  Smartphone,
  Calendar,
  Loader2,
  MonitorSmartphone,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ClientDevice, ConnectionSession, Lead } from '@/lib/types';

interface Props {
  client: Lead | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function formatDuration(seconds: number) {
  if (!seconds || seconds < 0) return '0 s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 o';
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

export function ClientActivitySheet({ client, open, onOpenChange }: Props) {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ConnectionSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !client || !fetchWithAuth) return;
    let cancelled = false;
    setIsLoading(true);
    setSessions([]);

    (async () => {
      try {
        const res = await fetchWithAuth(`/sessions/?client=${client.id}&page_size=200`);
        const data = await res.json();
        if (cancelled) return;
        const list: ConnectionSession[] = Array.isArray(data) ? data : data.results ?? [];
        setSessions(list);
      } catch (e) {
        if (!cancelled) {
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de charger l\'activité du client.',
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, client, fetchWithAuth, toast]);

  const stats = useMemo(() => {
    const totalSessions = sessions.length;
    const activeSessions = sessions.filter((s) => s.status === 'connecté').length;
    const totalSeconds = sessions.reduce((acc, s) => acc + (s.uptime_seconds || 0), 0);
    const totalDown = sessions.reduce((acc, s) => acc + (s.bytes_downloaded || 0), 0);
    const totalUp = sessions.reduce((acc, s) => acc + (s.bytes_uploaded || 0), 0);
    const totalRevenue = sessions.reduce((acc, s) => acc + (s.plan_price_fcfa ?? 0), 0);
    const macs = new Set(sessions.map((s) => s.mac_address).filter(Boolean));
    const ips = new Set(sessions.map((s) => s.ip_address).filter(Boolean));

    const planCounts = new Map<string, number>();
    sessions.forEach((s) => {
      const name = s.plan_name ?? 'Sans plan';
      planCounts.set(name, (planCounts.get(name) ?? 0) + 1);
    });

    const sortedSessions = [...sessions].sort((a, b) => {
      const timeA = a.started_at ? new Date(a.started_at).getTime() : 0;
      const timeB = b.started_at ? new Date(b.started_at).getTime() : 0;
      return timeB - timeA;
    });

    return {
      totalSessions,
      activeSessions,
      totalSeconds,
      totalDown,
      totalUp,
      totalRevenue,
      devices: macs.size,
      ips: ips.size,
      planDistribution: Array.from(planCounts.entries()).sort((a, b) => b[1] - a[1]),
      first: sortedSessions[sortedSessions.length - 1] ?? null,
      last: sortedSessions[0] ?? null,
      sortedSessions,
    };
  }, [sessions]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activité Wi-Fi du client
          </SheetTitle>
          <SheetDescription>
            {client && (
              <span className="block">
                <span className="font-medium">
                  {client.email || client.phone || client.mac_address}
                </span>
                {client.email && client.phone && (
                  <span className="text-muted-foreground"> · {client.phone}</span>
                )}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
          }}
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border-blue-100 bg-blue-50/40">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Wifi className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Sessions
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {stats.totalSessions}
                    </div>
                    {stats.activeSessions > 0 && (
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        {stats.activeSessions} active{stats.activeSessions > 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-amber-100 bg-amber-50/40">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Coins className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Revenus
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-amber-900">
                      {stats.totalRevenue.toLocaleString('fr-FR')}
                      <span className="text-sm font-normal text-amber-700"> F</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-teal-100 bg-teal-50/40">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2 text-teal-700">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Connecté
                      </span>
                    </div>
                    <div className="text-xl font-bold text-teal-900">
                      {formatDuration(stats.totalSeconds)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-100 bg-purple-50/40">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        Appareils
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{stats.devices}</div>
                    <div className="text-xs text-purple-700">{stats.ips} IP utilisée{stats.ips > 1 ? 's' : ''}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Trafic + dates */}
              <div className="grid sm:grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Trafic total</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Download className="h-4 w-4 text-blue-600" /> Téléchargé
                      </span>
                      <span className="font-mono font-semibold">{formatBytes(stats.totalDown)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Upload className="h-4 w-4 text-teal-600" /> Envoyé
                      </span>
                      <span className="font-mono font-semibold">{formatBytes(stats.totalUp)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Historique
                    </h4>
                    <div className="text-xs text-muted-foreground">Première connexion</div>
                    <div className="text-sm font-medium">
                      {stats.first
                        ? format(parseISO(stats.first.started_at), 'dd MMM yyyy, HH:mm', { locale: fr })
                        : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground pt-1">Dernière connexion</div>
                    <div className="text-sm font-medium">
                      {stats.last
                        ? format(parseISO(stats.last.started_at), 'dd MMM yyyy, HH:mm', { locale: fr })
                        : '—'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Plans distribution */}
              {stats.planDistribution.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Plans utilisés</h4>
                    <div className="flex flex-wrap gap-2">
                      {stats.planDistribution.map(([name, count]) => (
                        <Badge key={name} variant="secondary" className="text-xs">
                          {name} · {count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appareils enregistrés */}
              {client && client.devices && client.devices.length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MonitorSmartphone className="h-4 w-4" />
                      Appareils enregistrés
                      <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {client.devices.length} appareil{client.devices.length > 1 ? 's' : ''}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {client.devices.map((device: ClientDevice) => (
                        <div key={device.id} className="flex flex-col gap-0.5 border rounded-lg p-3 bg-muted/30">
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-[11px] font-mono text-foreground uppercase">
                              {device.mac_address}
                            </code>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {format(parseISO(device.last_seen), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                          {device.user_agent && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {device.user_agent}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sessions table */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Sessions
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {sessions.length}
                  </span>
                </h4>

                {/* Vue mobile : cards */}
                <div className="md:hidden space-y-2">
                  {stats.sortedSessions.length === 0 ? (
                    <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
                      Aucune session enregistrée pour ce client.
                    </div>
                  ) : (
                    stats.sortedSessions.map((s) => (
                      <div key={s.id} className="border rounded-lg p-3 space-y-2 bg-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-muted-foreground">
                            {s.started_at
                              ? format(parseISO(s.started_at), 'dd/MM HH:mm', { locale: fr })
                              : '—'}
                          </div>
                          {s.status === 'connecté' ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 shrink-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
                              Connecté
                            </Badge>
                          ) : s.status === 'expiré' ? (
                            <Badge className="shrink-0 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                              Expiré
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs shrink-0">Déconnecté</Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground uppercase truncate">
                          {s.mac_address}
                          {s.ip_address ? ` · ${s.ip_address}` : ''}
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
                          <span className="text-muted-foreground ml-auto">
                            {formatDuration(s.uptime_seconds || 0)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Vue desktop : table */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Début</TableHead>
                        <TableHead>MAC / IP</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead className="text-right">Trafic</TableHead>
                        <TableHead className="text-right">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.sortedSessions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            Aucune session enregistrée pour ce client.
                          </TableCell>
                        </TableRow>
                      ) : (
                        stats.sortedSessions.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="text-xs whitespace-nowrap">
                              {s.started_at
                                ? format(parseISO(s.started_at), 'dd/MM HH:mm', { locale: fr })
                                : '—'}
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
                            <TableCell className="text-xs">
                              {s.plan_name ? (
                                <span>
                                  {s.plan_name}
                                  {s.plan_price_fcfa != null && (
                                    <span className="text-muted-foreground"> · {s.plan_price_fcfa} F</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {formatDuration(s.uptime_seconds || 0)}
                            </TableCell>
                            <TableCell className="text-xs text-right whitespace-nowrap">
                              {formatBytes((s.bytes_downloaded || 0) + (s.bytes_uploaded || 0))}
                            </TableCell>
                            <TableCell className="text-right">
                              {s.status === 'connecté' ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
                                  Connecté
                                </Badge>
                              ) : s.status === 'expiré' ? (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                  Expiré
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Déconnecté</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
