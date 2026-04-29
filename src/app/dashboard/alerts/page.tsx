'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Wifi,
  Inbox,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import type {
  ConflictAlert,
  ConflictAlertStatus,
  ConflictField,
} from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  ConflictAlertStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    label: 'En attente',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  RESOLVED: {
    label: 'Résolue',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle2,
  },
  IGNORED: {
    label: 'Ignorée',
    className: 'bg-muted text-foreground border-border',
    icon: XCircle,
  },
};

const FIELD_META: Record<
  ConflictField,
  { label: string; icon: typeof Mail }
> = {
  email: { label: 'Email', icon: Mail },
  phone: { label: 'Téléphone', icon: Phone },
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

const TAB_FILTERS: { id: 'ALL' | ConflictAlertStatus; label: string }[] = [
  { id: 'PENDING', label: 'En attente' },
  { id: 'RESOLVED', label: 'Résolues' },
  { id: 'IGNORED', label: 'Ignorées' },
  { id: 'ALL', label: 'Tout l\u2019historique' },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function AlertCard({
  alert,
  onAction,
  pendingAction,
}: {
  alert: ConflictAlert;
  onAction: (id: number, action: 'resolve' | 'ignore') => Promise<void>;
  pendingAction: 'resolve' | 'ignore' | null;
}) {
  const fieldMeta = FIELD_META[alert.conflict_field];
  const statusMeta = STATUS_META[alert.status];
  const FieldIcon = fieldMeta.icon;
  const StatusIcon = statusMeta.icon;

  const existingValue =
    alert.conflict_field === 'email'
      ? alert.existing_client_email
      : alert.existing_client_phone;
  const offendingValue = alert.offending_payload?.[alert.conflict_field];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <FieldIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Conflit sur {fieldMeta.label.toLowerCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                Client #{alert.existing_client} · {formatDate(alert.created_at)}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn('gap-1 font-medium', statusMeta.className)}
          >
            <StatusIcon className="h-3 w-3" />
            {statusMeta.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Client existant
            </p>
            <p className="text-sm font-medium text-foreground break-all">
              {existingValue || '—'}
            </p>
          </div>
          <div className="rounded-lg border bg-amber-50/50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1">
              Soumission entrante
            </p>
            <p className="text-sm font-medium text-foreground break-all">
              {offendingValue || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi className="h-3.5 w-3.5" />
          <span>Appareil :</span>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            {alert.offending_mac}
          </code>
        </div>

        {alert.offending_payload &&
          Object.keys(alert.offending_payload).length > 0 && (
            <details className="group rounded-lg border bg-muted/20">
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                <span className="group-open:hidden">
                  Voir le payload soumis
                </span>
                <span className="hidden group-open:inline">
                  Masquer le payload
                </span>
              </summary>
              <pre className="overflow-x-auto px-3 pb-3 text-[11px] leading-relaxed text-foreground/80">
                {JSON.stringify(alert.offending_payload, null, 2)}
              </pre>
            </details>
          )}

        {alert.status === 'PENDING' && (
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              disabled={pendingAction !== null}
              onClick={() => onAction(alert.id, 'ignore')}
            >
              {pendingAction === 'ignore' ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-3.5 w-3.5" />
              )}
              Ignorer
            </Button>
            <Button
              size="sm"
              disabled={pendingAction !== null}
              onClick={() => onAction(alert.id, 'resolve')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {pendingAction === 'resolve' ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
              )}
              Exiger une vérification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlertsPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<ConflictAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tab, setTab] = useState<'ALL' | ConflictAlertStatus>('PENDING');
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [pendingActionType, setPendingActionType] = useState<
    'resolve' | 'ignore' | null
  >(null);

  const loadAlerts = useCallback(
    async (silent = false) => {
      if (!fetchWithAuth) return;
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      try {
        const res = await fetchWithAuth('/alerts/');
        if (!res.ok) throw new Error('Impossible de charger les alertes.');
        const data = await res.json();
        const list: ConflictAlert[] = Array.isArray(data)
          ? data
          : data.results || [];
        setAlerts(list);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: (err as Error).message,
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchWithAuth, toast],
  );

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleAction = useCallback(
    async (id: number, action: 'resolve' | 'ignore') => {
      if (!fetchWithAuth) return;
      setPendingActionId(id);
      setPendingActionType(action);
      try {
        const res = await fetchWithAuth(`/alerts/${id}/${action}/`, {
          method: 'POST',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.detail || data.error || `Action impossible (${res.status})`,
          );
        }
        const newStatus: ConflictAlertStatus =
          action === 'resolve' ? 'RESOLVED' : 'IGNORED';
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
        );
        toast({
          title:
            action === 'resolve' ? 'Alerte résolue' : 'Alerte ignorée',
          description:
            action === 'resolve'
              ? 'L\u2019alerte a été marquée comme résolue.'
              : 'L\u2019alerte ne sera plus affichée par défaut.',
        });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: (err as Error).message,
        });
      } finally {
        setPendingActionId(null);
        setPendingActionType(null);
      }
    },
    [fetchWithAuth, toast],
  );

  const counts = useMemo(() => {
    const c = { PENDING: 0, RESOLVED: 0, IGNORED: 0 } as Record<
      ConflictAlertStatus,
      number
    >;
    for (const a of alerts) c[a.status] += 1;
    return c;
  }, [alerts]);

  const filtered = useMemo(() => {
    if (tab === 'ALL') return alerts;
    return alerts.filter((a) => a.status === tab);
  }, [alerts, tab]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-amber-600" />
            Alertes de conflit
          </h1>
          <p className="text-muted-foreground mt-1">
            Quand un client utilise des informations déjà connues sur un nouvel
            appareil, une alerte apparaît ici. Choisissez de l&apos;ignorer ou
            d&apos;exiger une vérification.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAlerts(true)}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCcw
            className={cn(
              'mr-2 h-3.5 w-3.5',
              isRefreshing && 'animate-spin',
            )}
          />
          Actualiser
        </Button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-3">
        {(['PENDING', 'RESOLVED', 'IGNORED'] as ConflictAlertStatus[]).map(
          (s) => {
            const meta = STATUS_META[s];
            const Icon = meta.icon;
            return (
              <Card key={s}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-lg flex items-center justify-center border',
                      meta.className,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold leading-none">
                      {counts[s]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {meta.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>

      {/* Tabs filtre */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TAB_FILTERS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
              {t.label}
              {t.id !== 'ALL' && counts[t.id as ConflictAlertStatus] > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                  {counts[t.id as ConflictAlertStatus]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-base font-medium">
              Aucune alerte à afficher
            </CardTitle>
            <CardDescription>
              {tab === 'PENDING'
                ? 'Tout est sous contrôle, aucune action requise.'
                : 'Cette catégorie est vide pour le moment.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAction={handleAction}
              pendingAction={
                pendingActionId === alert.id ? pendingActionType : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
