'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Router,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  HardDrive,
  Globe,
  Wifi,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { MikroTikRouter } from '@/lib/types';

const getTimeAgo = (dateStr: string | null) => {
  if (!dateStr) return 'Jamais';
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return 'il y a plus d\'un jour';
};

interface RouterForm {
  name: string;
  host: string;
  port: string;
  username: string;
  password?: string;
  is_active: boolean;
}

const emptyForm: RouterForm = {
  name: '',
  host: '',
  port: '8728',
  username: '',
  password: '',
  is_active: true,
};

export default function RoutersPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [routers, setRouters] = useState<MikroTikRouter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<number | null>(null);
  const [editing, setEditing] = useState<MikroTikRouter | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RouterForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<MikroTikRouter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRouters = useCallback(async () => {
    if (!fetchWithAuth) return;
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/routers/');
      if (!res.ok) throw new Error('Impossible de charger les routeurs.');
      const data = await res.json();
      setRouters(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, toast]);

  useEffect(() => {
    loadRouters();
  }, [loadRouters]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (router: MikroTikRouter) => {
    setEditing(router);
    setForm({
      name: router.name,
      host: router.host,
      port: String(router.port),
      username: router.username,
      password: '',
      is_active: router.is_active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!fetchWithAuth) return;
    if (!form.name.trim() || !form.host.trim() || !form.username.trim()) {
      toast({ variant: 'destructive', title: 'Tous les champs sont requis.' });
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      host: form.host.trim(),
      port: Number(form.port) || 8728,
      username: form.username.trim(),
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;

    setIsSaving(true);
    try {
      const url = editing ? `/routers/${editing.id}/` : '/routers/';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Échec de l\u2019enregistrement.');
      }
      await loadRouters();
      toast({
        title: editing ? 'Routeur mis à jour' : 'Routeur créé',
        description: `Le routeur « ${payload.name} » a été enregistré.`,
      });
      setOpen(false);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: (err as Error).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (id: number) => {
    if (!fetchWithAuth) return;
    setIsTesting(id);
    try {
      const res = await fetchWithAuth(`/routers/${id}/test-connection/`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        toast({
          title: 'Connexion réussie',
          description: `Connecté avec succès. ${data.active_clients} clients actifs détectés.`,
          className: 'bg-emerald-50 border-emerald-200',
        });
        await loadRouters();
      } else {
        toast({
          variant: 'destructive',
          title: 'Échec de connexion',
          description: data.error || 'Impossible de joindre le routeur.',
        });
        await loadRouters();
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors du test.',
      });
    } finally {
      setIsTesting(null);
    }
  };

  const handleSyncNow = async (id: number) => {
    if (!fetchWithAuth) return;
    setIsSyncing(id);
    try {
      const res = await fetchWithAuth(`/routers/${id}/sync-now/`, { method: 'POST' });
      const data = await res.json();
      toast({
        title: 'Synchronisation terminée',
        description: `${data.updated_count} sessions mises à jour, ${data.closed_count} fermées.`,
      });
      await loadRouters();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'La synchronisation a échoué.',
      });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !fetchWithAuth) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/routers/${deleteTarget.id}/`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204)
        throw new Error('Échec de la suppression.');
      setRouters((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast({ title: 'Routeur supprimé' });
      setDeleteTarget(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: (err as Error).message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Router className="h-7 w-7 text-blue-600" />
            Mes Routeurs MikroTik
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurez vos routeurs pour une synchronisation automatique des sessions WiFi.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un routeur
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : routers.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <HardDrive className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-base font-medium">
              Aucun routeur configuré
            </CardTitle>
            <CardDescription>
              Ajoutez votre premier routeur MikroTik pour automatiser le suivi des clients.
            </CardDescription>
            <div className="pt-4">
              <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Configurer mon routeur
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routers.map((router) => (
            <Card key={router.id} className="overflow-hidden">
              <CardHeader className="pb-3 border-b bg-muted/50/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{router.name}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-mono">
                      <Globe className="h-3 w-3" />
                      {router.host}:{router.port}
                    </div>
                  </div>
                  <Badge
                    variant={router.is_healthy ? 'default' : 'destructive'}
                    className={cn(
                      "capitalize",
                      router.is_healthy ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''
                    )}
                  >
                    {router.is_healthy ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Connecté
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Erreur
                      </span>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Clients actifs</p>
                    <p className="text-xl font-bold text-blue-900">{router.active_clients_count}</p>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Dernière synchro</p>
                    <p className="text-xs font-semibold mt-1">
                      {getTimeAgo(router.last_synced_at)}
                    </p>
                  </div>
                </div>

                {!router.is_healthy && router.last_error && (
                  <div className="p-2 rounded bg-red-50 text-[11px] text-red-700 border border-red-100 flex gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <p>{router.last_error}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestConnection(router.id)}
                    disabled={isTesting === router.id}
                  >
                    {isTesting === router.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wifi className="h-3.5 w-3.5 mr-1" />
                    )}
                    Tester
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSyncNow(router.id)}
                    disabled={isSyncing === router.id}
                  >
                    {isSyncing === router.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                    )}
                    Sync
                  </Button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(router)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-red-50"
                    onClick={() => setDeleteTarget(router)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog création / édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifier le routeur' : 'Nouveau routeur MikroTik'}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations de connexion API de votre routeur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="router-name">Nom du routeur</Label>
              <Input
                id="router-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex : Point d'accès Marché"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="router-host">IP ou Domaine</Label>
                <Input
                  id="router-host"
                  value={form.host}
                  onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                  placeholder="192.168.88.1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="router-port">Port API</Label>
                <Input
                  id="router-port"
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
                  placeholder="8728"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="router-user">Utilisateur API</Label>
                <Input
                  id="router-user"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="admin"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="router-pass">Mot de passe</Label>
                <Input
                  id="router-pass"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={editing ? "••••••••" : ""}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="router-active">Activer la synchronisation</Label>
                <p className="text-[11px] text-muted-foreground">
                  Le serveur interrogera ce routeur toutes les 2 minutes.
                </p>
              </div>
              <Switch
                id="router-active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {editing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce routeur ?</AlertDialogTitle>
            <AlertDialogDescription>
              La synchronisation pour « {deleteTarget?.name} » sera arrêtée.
              Les sessions existantes seront conservées en historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
