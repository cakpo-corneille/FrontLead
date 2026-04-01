'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Download, Calendar, Users, ArrowUp, ArrowDown, ArrowDownUp, ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
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
import type { Lead, FormField as FormSchemaField } from '@/lib/types';


export default function ClientsPage() {
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

  const { toast } = useToast();
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();
  
  const schemaFields = useMemo(() => formConfig?.schema.fields || [], [formConfig]);

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

  const clearFilters = () => {
    setFilters({});
  };

  const buildUrl = useCallback((page: number, pageSize: number, currentFilters: Record<string, any>) => {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    for (const [key, value] of Object.entries(currentFilters)) {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    }

    return `/analytics/leads/?${params.toString()}`;
  }, []);

  const fetchClients = useCallback(async (url: string) => {
    if (!fetchWithAuth) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
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
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: "Impossible de charger les données des clients.",
      });
      setClients([]);
    } finally {
      setIsLoading(false);
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

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.count / pagination.pageSize)) return;
    const url = buildUrl(newPage, pagination.pageSize, filters);
    fetchClients(url);
    setPagination(p => ({ ...p, currentPage: newPage }));
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const search = searchTerm.toLowerCase();
    return clients.filter((client) => {
      const valuesToSearch = [
        client.mac_address,
        client.email,
        client.phone,
        ...Object.values(client.payload)
      ];

      return valuesToSearch.some(value => 
        value && String(value).toLowerCase().includes(search)
      );
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
    let sortableClients = [...filteredClients];
    if (sortConfig !== null) {
      sortableClients.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (['mac_address', 'last_seen', 'is_verified'].includes(sortConfig.key)) {
            aValue = a[sortConfig.key as keyof Lead];
            bValue = b[sortConfig.key as keyof Lead];
        } else {
            aValue = a.payload[sortConfig.key];
            bValue = b.payload[sortConfig.key];
        }
        
        if (sortConfig.key === 'last_seen') {
            aValue = new Date(a.last_seen);
            bValue = new Date(b.last_seen);
        }

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        
        return 0;
      });
    }
    return sortableClients;
  }, [filteredClients, sortConfig]);

  const handleExportCSV = async () => {
     if (pagination.count === 0) {
      toast({
        title: 'Aucune donnée à exporter',
        description: 'Le tableau est actuellement vide.',
      });
      return;
    }

    if (!fetchWithAuth) return;

    toast({ title: 'Préparation de l\'exportation...', description: 'Veuillez patienter.' });
    
    try {
        const url = buildUrl(1, pagination.count, filters);
        const response = await fetchWithAuth(url);
        const allClientsData = await response.json();
        const exportableClients = allClientsData.results || [];

        const headers = schemaFields.map((field) => field.label);
        headers.push('Adresse MAC', 'Vu dernièrement', 'Vérifié', 'Niveau de Reconnaissance');

        const rows = exportableClients.map((client: Lead) => {
          const values = schemaFields.map(
            (field) => client.payload[field.name] || ''
          );
          values.push(client.mac_address);
          values.push(format(new Date(client.last_seen), 'P', { locale: fr }));
          values.push(client.is_verified ? 'Oui' : 'Non');
          values.push(String(client.recognition_level));

          return values
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(',');
        });

        let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `clients_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Exportation réussie',
          description: 'Le fichier CSV a été téléchargé.',
        });
    } catch(e) {
         toast({
          variant: 'destructive',
          title: "Erreur d'exportation",
          description: 'Impossible de télécharger toutes les données.',
        });
    }
  };

  const handleExportJSON = async () => {
    if (pagination.count === 0) {
      toast({ title: 'Aucune donnée à exporter', description: 'Le tableau est actuellement vide.' });
      return;
    }
    if (!fetchWithAuth) return;

    toast({ title: 'Préparation de l\'exportation...', description: 'Veuillez patienter.' });

    try {
        const url = buildUrl(1, pagination.count, filters);
        const response = await fetchWithAuth(url);
        const allClients = await response.json();
        
        const jsonContent = JSON.stringify(allClients.results || [], null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const urlBlob = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', urlBlob);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `clients_${date}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);

        toast({ title: 'Exportation réussie', description: 'Le fichier JSON a été téléchargé.' });

    } catch (error) {
        toast({ variant: 'destructive', title: "Erreur d'exportation", description: 'Impossible de télécharger toutes les données.' });
    }
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowDownUp className="ml-2 h-3 w-3 inline text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-2 h-3 w-3 inline" />;
    }
    return <ArrowDown className="ml-2 h-3 w-3 inline" />;
  };

  const renderSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-10 w-full" />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-5 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
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
      <p className="mt-2 text-sm text-muted-foreground">
        Essayez de modifier vos filtres ou de commencer à collecter des données.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/dashboard/form-builder">Configurer mon formulaire</Link>
      </Button>
    </div>
  );

  const renderClientsTable = () => {
    const visibleColumnsCount = schemaFields.length + 3; // +3 for MAC, Verified, Last Seen

    return (
      <Card>
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
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {schemaFields.map((field) => (
                    <TableHead key={field.name} className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort(field.name)}>
                      {field.label} {getSortIcon(field.name)}
                    </TableHead>
                  ))}
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('mac_address')}>
                    Adresse MAC {getSortIcon('mac_address')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('is_verified')}>
                    Vérifié {getSortIcon('is_verified')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('last_seen')}>
                    Vu dernièrement {getSortIcon('last_seen')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.length > 0 ? (
                  sortedClients.map((client) => (
                    <TableRow key={client.id}>
                      {schemaFields.map((field) => (
                        <TableCell key={field.name} className="max-w-[200px] truncate font-medium">
                          {client.payload[field.name] || '–'}
                        </TableCell>
                      ))}
                      <TableCell className="max-w-[150px] truncate">{client.mac_address}</TableCell>
                      <TableCell>{client.is_verified ? 'Oui' : 'Non'}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>{format(new Date(client.last_seen), 'dd MMMM yyyy, HH:mm', { locale: fr })}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumnsCount}
                      className="h-24 text-center"
                    >
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.previous}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.next}
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isFiltered = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Mes clients</h1>
          <p className="text-muted-foreground">
            {pagination.count} leads collectés
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 self-end sm:self-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={isFiltered ? 'secondary' : 'outline'}>
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
                {isFiltered && <div className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel>Statut de vérification</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={
                  filters.is_verified === true
                    ? 'verified'
                    : filters.is_verified === false
                    ? 'unverified'
                    : 'all'
                }
                onValueChange={(value) => {
                  if (value === 'all') {
                    handleFilterChange('is_verified', undefined);
                  } else {
                    handleFilterChange('is_verified', value === 'verified');
                  }
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
              >
                Avec email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.has_phone === true}
                onCheckedChange={(checked) => handleFilterChange('has_phone', checked ? true : undefined)}
              >
                Avec téléphone
              </DropdownMenuCheckboxItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={clearFilters} disabled={!isFiltered} className="text-red-600 focus:text-red-600">
                Effacer les filtres
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={pagination.count === 0} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                Exporter en JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading
        ? renderSkeleton()
        : (pagination.count === 0 && !isFiltered)
        ? renderEmptyState()
        : renderClientsTable()}
    </div>
  );
}
