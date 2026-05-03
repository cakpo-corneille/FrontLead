'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Download,
  Calendar,
  Users,
  ArrowUp,
  ArrowDown,
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  SendHorizonal,
  Trash2,
  Tag,
  StickyNote,
  Loader2,
  X,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { Label } from '@/components/ui/label';
import type { Lead } from '@/lib/types';
import { ClientActivitySheet } from '@/components/client-activity-sheet';

export default function ClientsPage() {
  const [activityClient, setActivityClient] = useState<Lead | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const openActivity = (c: Lead) => {
    setActivityClient(c);
    setIsActivityOpen(true);
  };
  const [clients, setClients] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'last_seen', direction: 'descending' });
  const [filters, setFilters] = useState<Record<string, any>>({});

  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
    currentPage: 1,
    pageSize: 20,
  });

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetNotes, setSheetNotes] = useState('');
  const [sheetTagInput, setSheetTagInput] = useState('');
  const [sheetTags, setSheetTags] = useState<string[]>([]);
  const [isSavingCRM, setIsSavingCRM] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasRouters, setHasRouters] = useState<boolean>(false);

  const [resendingIds, setResendingIds] = useState<Set<number>>(new Set());

  const { toast } = useToast();
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();

  useEffect(() => {
    const checkRouters = async () => {
      try {
        const res = await fetchWithAuth('/routers/');
        const data = await res.json();
        setHasRouters(Array.isArray(data) ? data.length > 0 : (data.results ?? []).length > 0);
      } catch (e) {}
    };
    checkRouters();
  }, [fetchWithAuth]);

  const schemaFields = useMemo(() => formConfig?.schema?.fields || [], [formConfig]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === undefined || value === null || value === 'all') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };

  const clearFilters = () => setFilters({});
  const isFiltered = useMemo(() => Object.keys(filters).length > 0, [filters]);

  const buildUrl = useCallback((page: number, pageSize: number, currentFilters: Record<string, any>) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    for (const [key, value] of Object.entries(currentFilters)) {
      if (value !== undefined) params.append(key, String(value));
    }
    return `/leads/?${params.toString()}`;
  }, []);

  const fetchClients = useCallback(async (url: string, silent = false) => {
    if (!fetchWithAuth) { if (!silent) setIsLoading(false); return; }
    if (!silent) setIsLoading(true);
    try {
      const response = await fetchWithAuth(url);
      const data = await response.json();
      setClients(data.results || []);
      setPagination(prev => ({
        ...prev,
        count: data.count,
        next: data.next,
        previous: data.previous,
      }));
    } catch (error) {
      if (!silent) {
        toast({ variant: 'destructive', title: 'Erreur de chargement', description: "Impossible de charger les données des clients." });
        setClients([]);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [fetchWithAuth, toast]);

  useEffect(() => {
    if (formConfig) {
      const url = buildUrl(1, pagination.pageSize, filters);
      fetchClients(url);
      setPagination(p => ({ ...p, currentPage: 1 }));
    } else if (fetchFormConfig) {
      fetchFormConfig();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formConfig, fetchFormConfig, filters]);

  useEffect(() => {
    if (!formConfig) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const url = buildUrl(pagination.currentPage, pagination.pageSize, filters);
      fetchClients(url, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [formConfig, pagination.currentPage, pagination.pageSize, filters, buildUrl, fetchClients]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.count / pagination.pageSize)) return;
    const url = buildUrl(newPage, pagination.pageSize, filters);
    fetchClients(url);
    setPagination(p => ({ ...p, currentPage: newPage }));
  };

  const filteredClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];
    if (!searchTerm) return clients;
    const search = searchTerm.toLowerCase();
    return clients.filter((client) => {
      const payload = client.payload || {};
      const valuesToSearch = [
        client.mac_address, 
        client.email, 
        client.phone, 
        ...Object.values(payload)
      ];
      return valuesToSearch.some(value => value && String(value).toLowerCase().includes(search));
    });
  }, [clients, searchTerm]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedClients = useMemo(() => {
    if (!Array.isArray(filteredClients)) return [];
    let sortableClients = [...filteredClients];
    if (sortConfig !== null) {
      sortableClients.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        if (['mac_address', 'last_seen', 'is_verified', 'sessions_count'].includes(sortConfig.key)) {
          aValue = a[sortConfig.key as keyof Lead];
          bValue = b[sortConfig.key as keyof Lead];
        } else {
          aValue = (a.payload || {})[sortConfig.key];
          bValue = (b.payload || {})[sortConfig.key];
        }
        if (sortConfig.key === 'last_seen') {
          aValue = a.last_seen ? new Date(a.last_seen).getTime() : 0;
          bValue = b.last_seen ? new Date(b.last_seen).getTime() : 0;
        }
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableClients;
  }, [filteredClients, sortConfig]);

  const openLeadSheet = (lead: Lead) => {
    setSelectedLead(lead);
    setSheetNotes(lead.notes || '');
    setSheetTags(lead.tags || []);
    setSheetTagInput('');
    setIsSheetOpen(true);
  };

  const persistTags = async (newTags: string[]) => {
    if (!selectedLead || !fetchWithAuth) return;
    const previous = sheetTags;
    setSheetTags(newTags);
    try {
      const response = await fetchWithAuth(`/leads/${selectedLead.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags }),
      });
      if (!response.ok) throw new Error('Échec de la sauvegarde des tags.');
      const updated = await response.json();
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
      setSelectedLead(updated);
    } catch (error) {
      setSheetTags(previous);
      toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
    }
  };

  const addTag = async () => {
    const tag = sheetTagInput.trim();
    setSheetTagInput('');
    if (!tag || sheetTags.includes(tag)) return;
    await persistTags([...sheetTags, tag]);
  };

  const removeTag = async (tag: string) => {
    await persistTags(sheetTags.filter(t => t !== tag));
  };

  const handleSaveCRM = async () => {
    if (!selectedLead || !fetchWithAuth) return;
    setIsSavingCRM(true);
    try {
      const response = await fetchWithAuth(`/leads/${selectedLead.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: sheetNotes }),
      });
      if (!response.ok) throw new Error('Échec de la sauvegarde.');
      const updated = await response.json();
      setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
      toast({ title: 'Notes enregistrées', description: 'Les notes ont été mises à jour.' });
      setIsSheetOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
    } finally {
      setIsSavingCRM(false);
    }
  };

  const handleResendOTP = async (lead: Lead) => {
    if (!fetchWithAuth) return;
    setResendingIds(prev => new Set(prev).add(lead.id));
    try {
      const response = await fetchWithAuth(`/leads/${lead.id}/resend-verification/`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Erreur lors du renvoi.');
      toast({ title: 'Code renvoyé', description: data.detail });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
    } finally {
      setResendingIds(prev => { const s = new Set(prev); s.delete(lead.id); return s; });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !fetchWithAuth) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`/leads/${deleteTarget.id}/`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) throw new Error('Échec de la suppression.');
      setClients(prev => prev.filter(c => c.id !== deleteTarget.id));
      setPagination(prev => ({ ...prev, count: prev.count - 1 }));
      toast({ title: 'Client supprimé', description: 'Les données ont été supprimées (RGPD).' });
      setDeleteTarget(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: (error as Error).message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (fmt: 'csv' | 'pdf') => {
    if (pagination.count === 0) { toast({ title: 'Aucune donnée à exporter' }); return; }
    if (!fetchWithAuth) return;
    toast({ title: "Préparation de l'exportation...", description: 'Veuillez patienter.' });
    try {
      const params = new URLSearchParams({ export_format: fmt });
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) params.append(key, String(value));
      }
      const response = await fetchWithAuth(`/leads/export/?${params.toString()}`);
      if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);
      const blob = await response.blob();
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', urlBlob);
      link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.${fmt}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);
      toast({ title: 'Exportation réussie' });
    } catch (e) {
      toast({ variant: 'destructive', title: "Erreur d'exportation", description: (e as Error).message });
    }
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowDownUp className="ml-2 h-3 w-3 inline text-muted-foreground/50" />;
    if (sortConfig.direction === 'ascending') return <ArrowUp className="ml-2 h-3 w-3 inline" />;
    return <ArrowDown className="ml-2 h-3 w-3 inline" />;
  };

  const renderSkeleton = () => (
    <Card>
      <CardHeader><Skeleton className="h-10 w-full" /></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>{Array.from({ length: 5 }).map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center h-[450px]">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Aucun client trouvé</h3>
      <p className="mt-2 text-sm text-muted-foreground">Essayez de modifier vos filtres ou de commencer à collecter des données.</p>
      <Button className="mt-6" asChild>
        <Link href="/dashboard/form-builder">Configurer mon formulaire</Link>
      </Button>
    </div>
  );

  const renderClientsTable = () => {
    const visibleColumnsCount = schemaFields.length + 4;
    return (
      <Card className="min-w-0">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client (sur la page actuelle)..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          <div
            className="w-full min-w-0 overflow-x-auto"
            style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  {schemaFields.map((field) => (
                    <TableHead key={field.name} className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort(field.name)}>
                      {field.label} {getSortIcon(field.name)}
                    </TableHead>
                  ))}
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('is_verified')}>
                    Statut {getSortIcon('is_verified')}
                  </TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-center" onClick={() => requestSort('sessions_count')}>
                    Sessions {getSortIcon('sessions_count')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('last_seen')}>
                    Vu dernièrement {getSortIcon('last_seen')}
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.length > 0 ? (
                  sortedClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-muted/30" onClick={() => openLeadSheet(client)}>
                      {schemaFields.map((field) => (
                        <TableCell key={field.name} className="max-w-[200px] truncate font-medium">
                          {(client.payload || {})[field.name] || '–'}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Badge variant={client.is_verified ? 'default' : 'secondary'} className={client.is_verified ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                          {client.is_verified ? 'Vérifié' : 'Non vérifié'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(client.tags || []).slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                          {(client.tags || []).length > 2 && (
                            <Badge variant="outline" className="text-xs">+{client.tags.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono tabular-nums">
                          {client.sessions_count ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>
                            {client.last_seen 
                              ? format(new Date(client.last_seen), 'dd MMM yyyy', { locale: fr })
                              : '–'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openLeadSheet(client)}>
                              <StickyNote className="mr-2 h-4 w-4" /> Notes & Tags
                            </DropdownMenuItem>
                            {!client.is_verified && (
                              <DropdownMenuItem
                                onClick={() => handleResendOTP(client)}
                                disabled={resendingIds.has(client.id)}
                              >
                                {resendingIds.has(client.id)
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <SendHorizonal className="mr-2 h-4 w-4" />}
                                Demander vérification
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openActivity(client)}>
                              <Activity className="mr-2 h-4 w-4" /> Voir l'activité
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(client)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumnsCount} className="h-24 text-center">
                      {searchTerm ? 'Aucun client ne correspond à votre recherche.' : (Object.keys(filters).length > 0 ? 'Aucun client ne correspond à vos filtres.' : 'Aucun client trouvé sur cette page.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} sur {Math.ceil(pagination.count / pagination.pageSize) || 1}
            </span>
            <div className="flex items-center justify-center flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.previous}>
                <ChevronLeft className="mr-2 h-4 w-4" />Précédent
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.next}>
                Suivant<ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const [pendingAlerts, setPendingAlerts] = useState(0);

  useEffect(() => {
    if (!fetchWithAuth) return;
    const fetchAlerts = async () => {
      try {
        const res = await fetchWithAuth('/alerts/?status=PENDING');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.results || [];
          setPendingAlerts(list.filter((a: any) => a.status === 'PENDING').length);
        }
      } catch (e) {}
    };
    fetchAlerts();
  }, [fetchWithAuth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mes clients</h1>
          <p className="text-muted-foreground">{pagination.count} clients identifiés</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 self-end sm:self-auto">
          <Button variant="outline" asChild className="relative">
            <Link href="/dashboard/alerts">
              <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" />
              Alertes
              {pendingAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white border-2 border-white">
                  {pendingAlerts}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={isFiltered ? 'secondary' : 'outline'}>
                <Filter className="mr-2 h-4 w-4" />Filtrer
                {isFiltered && <div className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Statut de vérification</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={filters.is_verified === true ? 'verified' : filters.is_verified === false ? 'unverified' : 'all'}
                onValueChange={(value) => {
                  if (value === 'all') handleFilterChange('is_verified', undefined);
                  else handleFilterChange('is_verified', value === 'verified');
                }}
              >
                <DropdownMenuRadioItem value="all">Tous</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="verified">Client vérifié</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="unverified">Client non vérifié</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Contact</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.has_email === true}
                onCheckedChange={(checked) => handleFilterChange('has_email', checked ? true : undefined)}
              >Avec email</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.has_phone === true}
                onCheckedChange={(checked) => handleFilterChange('has_phone', checked ? true : undefined)}
              >Avec téléphone</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFilters} disabled={!isFiltered} className="text-red-600 focus:text-red-600">
                Effacer les filtres
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={pagination.count === 0} variant="outline">
                <Download className="mr-2 h-4 w-4" />Exporter<ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>Exporter en CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>Exporter en PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? renderSkeleton() : (pagination.count === 0 && !isFiltered) ? renderEmptyState() : renderClientsTable()}

      {/* Panneau CRM - Notes & Tags */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Fiche client</SheetTitle>
            <SheetDescription>
              {selectedLead && (
                <span className="font-mono text-xs">{selectedLead.mac_address}</span>
              )}
            </SheetDescription>
          </SheetHeader>

          {selectedLead && (
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-6">
              <div className="space-y-2 text-sm">
                {selectedLead.email && <div><span className="text-muted-foreground">Email :</span> {selectedLead.email}</div>}
                {selectedLead.phone && <div><span className="text-muted-foreground">Tél :</span> {selectedLead.phone}</div>}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Statut :</span>
                  <Badge variant={selectedLead.is_verified ? 'default' : 'secondary'} className={selectedLead.is_verified ? 'bg-green-100 text-green-700 border-green-200' : ''}>
                    {selectedLead.is_verified ? 'Vérifié' : 'Non vérifié'}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Vu le :</span>{' '}
                  {selectedLead.last_seen 
                    ? format(new Date(selectedLead.last_seen), 'dd MMMM yyyy, HH:mm', { locale: fr })
                    : '–'
                  }
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Tag className="h-4 w-4" />Tags</Label>
                <div className="flex flex-wrap gap-2 min-h-8">
                  {sheetTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex : habitué, à recontacter, promo café…"
                    value={sheetTagInput}
                    onChange={(e) => setSheetTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={addTag}>Ajouter</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><StickyNote className="h-4 w-4" />Notes internes</Label>
                <Textarea
                  placeholder="Ex : habite près de la station, préfère WhatsApp, doit 2000F…"
                  value={sheetNotes}
                  onChange={(e) => setSheetNotes(e.target.value)}
                  rows={5}
                />
              </div>

            </div>
          )}

          <SheetFooter className="border-t pt-4">
            <Button onClick={handleSaveCRM} disabled={isSavingCRM} className="w-full">
              {isSavingCRM && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmation de suppression RGPD */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données personnelles de ce client seront définitivement supprimées conformément au RGPD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientActivitySheet
        client={activityClient}
        open={isActivityOpen}
        onOpenChange={setIsActivityOpen}
        hasRouters={hasRouters}
      />
    </div>
  );
}
