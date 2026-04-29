'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Inbox,
  Coins,
  Clock,
  Download,
  Upload,
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
import type { TicketPlan } from '@/lib/types';

const formatFcfa = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
};

interface PlanForm {
  name: string;
  price_fcfa: string;
  duration_minutes: string;
  is_active: boolean;
}

const emptyForm: PlanForm = {
  name: '',
  price_fcfa: '',
  duration_minutes: '',
  is_active: true,
};

export default function TicketPlansPage() {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<TicketPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<TicketPlan | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<TicketPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPlans = useCallback(async () => {
    if (!fetchWithAuth) return;
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/ticket-plans/');
      if (!res.ok) throw new Error('Impossible de charger les plans.');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : data.results || []);
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
    loadPlans();
  }, [loadPlans]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };
  const openEdit = (plan: TicketPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      price_fcfa: String(plan.price_fcfa),
      duration_minutes: String(plan.duration_minutes),
      is_active: plan.is_active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!fetchWithAuth) return;
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Le nom est requis.' });
      return;
    }
    const price = Number(form.price_fcfa);
    const duration = Number(form.duration_minutes);
    if (!Number.isFinite(price) || price < 0) {
      toast({ variant: 'destructive', title: 'Prix invalide.' });
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      toast({ variant: 'destructive', title: 'Durée invalide.' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      price_fcfa: price,
      duration_minutes: duration,
      is_active: form.is_active,
    };

    setIsSaving(true);
    try {
      const url = editing ? `/ticket-plans/${editing.id}/` : '/ticket-plans/';
      const method = editing ? 'PATCH' : 'POST';
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.detail ||
            Object.values(data).flat().join(' ') ||
            'Échec de l\u2019enregistrement.',
        );
      }
      const saved: TicketPlan = await res.json();
      setPlans((prev) =>
        editing
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [...prev, saved],
      );
      toast({
        title: editing ? 'Plan mis à jour' : 'Plan créé',
        description: `Le plan « ${saved.name} » a été enregistré.`,
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

  const handleDelete = async () => {
    if (!deleteTarget || !fetchWithAuth) return;
    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/ticket-plans/${deleteTarget.id}/`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204)
        throw new Error('Échec de la suppression.');
      setPlans((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast({ title: 'Plan supprimé' });
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
            <Tag className="h-7 w-7 text-blue-600" />
            Plans tarifaires
          </h1>
          <p className="text-muted-foreground mt-1">
            Définissez vos tickets Wi-Fi (prix et durée). Les
            sessions seront automatiquement rapprochées du bon plan en fonction du temps alloué.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau plan
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-base font-medium">
              Aucun plan tarifaire
            </CardTitle>
            <CardDescription>
              Créez votre premier plan pour commencer à analyser vos revenus
              Wi-Fi.
            </CardDescription>
            <div className="pt-3">
              <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Créer un plan
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Coins className="h-3.5 w-3.5" />
                      {formatFcfa(plan.price_fcfa)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={plan.is_active ? 'default' : 'secondary'}
                    className={
                      plan.is_active
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : ''
                    }
                  >
                    {plan.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Durée : {formatDuration(plan.duration_minutes)}
                </div>
                <div className="flex justify-end gap-1 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(plan)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(plan)}
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
              {editing ? 'Modifier le plan' : 'Nouveau plan tarifaire'}
            </DialogTitle>
            <DialogDescription>
              Renseignez le prix et la durée du ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="plan-name">Nom du plan</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex : Ticket 1h"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="plan-price">Prix (FCFA)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  value={form.price_fcfa}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price_fcfa: e.target.value }))
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-duration">Durée (minutes)</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_minutes: e.target.value }))
                  }
                  placeholder="60"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="plan-active" className="text-sm font-medium">
                  Plan actif
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactif = ne sera plus utilisé pour matcher les nouvelles
                  sessions.
                </p>
              </div>
              <Switch
                id="plan-active"
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, is_active: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {editing ? 'Enregistrer' : 'Créer'}
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
            <AlertDialogTitle>Supprimer ce plan ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le plan « {deleteTarget?.name} » sera supprimé définitivement. Les
              sessions déjà rattachées conserveront leur référence.
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
