'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, Loader2, Zap, Wifi, Award } from 'lucide-react';
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
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AnalyticsSummary } from '@/lib/types';
import { cn } from '@/lib/utils';

const chartConfig = {
  leads: {
    label: 'Clients',
    color: 'hsl(var(--primary))',
  },
};

export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fetchWithAuth) return;

    let cancelled = false;

    async function fetchSummary(silent = false) {
      if (!fetchWithAuth) return;
      if (!silent) setIsLoading(true);

      try {
        const response = await fetchWithAuth('/analytics/summary/');
        const data = await response.json();
        if (!cancelled) setSummary(data);
      } catch (error) {
        if (!silent && !cancelled) {
          toast({
            variant: 'destructive',
            title: 'Erreur de chargement',
            description: (error as Error).message || 'Impossible de charger les statistiques.',
          });
        }
      } finally {
        if (!silent && !cancelled) setIsLoading(false);
      }
    }

    fetchSummary();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchSummary(true);
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchWithAuth, toast]);
  
  const formattedChartData = summary?.leads_by_hour?.map(item => ({
    ...item,
    hour: format(parseISO(item.hour), "HH:mm", { locale: fr }),
  })) || [];

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-500'; // Gold
    if (rank === 1) return 'text-gray-400'; // Silver
    if (rank === 2) return 'text-orange-400'; // Bronze
    return 'text-muted-foreground';
  }

  const renderSkeleton = () => (
    <>
      <div className="grid gap-2 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 md:gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
  
  const renderEmptyState = () => (
    <Card className="min-h-[450px] flex items-center justify-center">
      <div className="text-center p-4">
        <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Bienvenue sur votre tableau de bord !</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Il n'y a pas encore de données à afficher. Pour commencer à collecter des informations, vous devez intégrer le portail captif sur votre routeur WiFi.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/integration">Voir les instructions d'intégration</Link>
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
          <h1 className="text-3xl font-bold font-headline">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de vos performances WiFi marketing</p>
      </div>
      
      {isLoading ? (
        renderSkeleton()
      ) : !(summary?.total_leads && summary.total_leads > 0) ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid gap-2 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contacts Totaux</CardTitle>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100">
                        <Users className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.total_leads ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clients (cette semaine)</CardTitle>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.leads_this_week ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clients Vérifiés</CardTitle>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-purple-100">
                        <UserCheck className="h-4 w-4 text-purple-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.verified_leads ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taux de Retour</CardTitle>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-orange-100">
                        <Users className="h-4 w-4 text-orange-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.return_rate?.toFixed(1) ?? '0.0'}%</div>
                </CardContent>
              </Card>
          </div>

          <div className="grid grid-cols-1 gap-2 md:gap-4 lg:grid-cols-5 lg:items-start">
            <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Activité des dernières 24h</CardTitle>
                  <CardDescription>Nombre de clients identifiés heure par heure.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {formattedChartData && formattedChartData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <ChartContainer config={chartConfig} className="h-[350px] min-w-[600px] w-full">
                          <RechartsAreaChart data={formattedChartData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="hour"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                allowDecimals={false}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}                            />
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
                    </div>
                  ) : (
                    <div className="h-[350px] w-full flex flex-col items-center justify-center text-center">
                        <Wifi className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Aucune activité récente</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Aucun client n'a été identifié au cours des dernières 24 heures.
                        </p>
                    </div>
                  )}
                </CardContent>
            </Card>
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>Vos clients les plus fidèles.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Fidélité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(summary?.top_clients || []).map((client, index) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium flex items-center gap-3 whitespace-nowrap">
                            <Award className={cn("h-5 w-5", getRankColor(index))}/> 
                            <span>{client.name || client.mac_address}</span>
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">{client.loyalty_percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
