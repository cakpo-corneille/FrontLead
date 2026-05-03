'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Loader2,
  Check,
  CheckCircle,
  Type,
  Mail,
  Phone,
  List,
  ToggleLeft,
  Pencil,
  UploadCloud,
  X,
  Hash,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { FormPreview } from '@/components/dashboard/form-preview';
import { FormOverlayPreview } from '@/components/dashboard/form-overlay-preview';
import { useAuth } from '@/contexts/auth-context';
import type { FormField as FormFieldType } from '@/lib/types';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditableFormField extends FormFieldType {
  id: string;
}

const FIELD_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  text:    { label: 'Texte',          icon: Type,       color: 'bg-blue-50 border-blue-200 text-blue-700' },
  email:   { label: 'E-mail',         icon: Mail,       color: 'bg-purple-50 border-purple-200 text-purple-700' },
  phone:   { label: 'Téléphone',      icon: Phone,      color: 'bg-green-50 border-green-200 text-green-700' },
  number:  { label: 'Nombre',         icon: Hash,       color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  choice:  { label: 'Sélecteur',      icon: List,       color: 'bg-orange-50 border-orange-200 text-orange-700' },
  boolean: { label: 'Case à cocher',  icon: ToggleLeft, color: 'bg-muted/50 border-border text-foreground' },
};

function LogoDropZone({
  previewUrl,
  onFileChange,
  onClear,
}: {
  previewUrl: string | null;
  onFileChange: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    onFileChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  if (previewUrl) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative group w-20 h-20 rounded-xl border border-border bg-card flex items-center justify-center shadow-sm overflow-hidden">
          <img src={previewUrl} alt="Logo" className="w-full h-full object-contain p-2" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <button
              type="button"
              onClick={onClear}
              className="text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Logo chargé</p>
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            Changer de logo
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
        isDragging
          ? 'border-blue-400 bg-blue-50'
          : 'border-border bg-muted/30 hover:border-blue-300 hover:bg-blue-50/40'
      )}
    >
      <div className={cn('rounded-full p-3 transition-colors', isDragging ? 'bg-blue-100' : 'bg-muted')}>
        <UploadCloud className={cn('h-6 w-6 transition-colors', isDragging ? 'text-blue-500' : 'text-muted-foreground')} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isDragging ? 'Déposez votre image ici' : 'Glissez votre logo ici'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">ou <span className="text-blue-600 underline">cliquez pour parcourir</span></p>
        <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP · max 2 MB</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
    </div>
  );
}

function SortableField({ field, onEdit, removeField }: {
  field: EditableFormField;
  onEdit: (field: EditableFormField) => void;
  removeField: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const meta = FIELD_TYPE_META[field.type];

  return (
    <div ref={setNodeRef} style={style} className="bg-card px-4 py-3 rounded-lg border shadow-sm flex items-center gap-3">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground flex-shrink-0">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {meta && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${meta.color}`}>
            <meta.icon className="h-3 w-3" />
            {meta.label}
          </span>
        )}
        <span className="text-sm font-medium text-foreground truncate">
          {field.label || <span className="text-muted-foreground italic">Sans libellé</span>}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50" onClick={() => onEdit(field)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50" onClick={() => removeField(field.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FieldConfigDialog({
  open,
  onOpenChange,
  field,
  onChange,
  onConfirm,
  confirmLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  field: EditableFormField | null;
  onChange: (updated: EditableFormField) => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  if (!field) return null;
  const meta = FIELD_TYPE_META[field.type];
  const isSpecial = field.name === 'email' || field.name === 'phone';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {meta && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full border ${meta.color}`}>
                <meta.icon className="h-3 w-3" />
                {meta.label}
              </span>
            )}
            <span>Configurer le champ</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="dlg-label">Libellé <span className="text-red-500">*</span></Label>
            <Input
              id="dlg-label"
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              placeholder={meta?.label || 'Libellé du champ'}
              autoFocus
              readOnly={isSpecial}
              className={isSpecial ? 'bg-muted cursor-not-allowed' : ''}
            />
          </div>
          {field.type !== 'boolean' && field.type !== 'choice' && (
            <div className="space-y-1.5">
              <Label htmlFor="dlg-placeholder">Texte indicatif</Label>
              <Input
                id="dlg-placeholder"
                value={field.placeholder || ''}
                onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
                placeholder="Ex: Entrez votre email..."
              />
            </div>
          )}
          {field.type === 'choice' && (
            <div className="space-y-1.5">
              <Label htmlFor="dlg-choices">Options <span className="text-xs text-muted-foreground">(une par ligne)</span></Label>
              <Textarea
                id="dlg-choices"
                value={field.choices?.join('\n') || ''}
                onChange={(e) => onChange({ ...field, choices: e.target.value.split('\n') })}
                placeholder={'Option 1\nOption 2\nOption 3'}
                rows={4}
              />
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Switch
              id="dlg-required"
              checked={field.required}
              onCheckedChange={(checked) => onChange({ ...field, required: checked })}
            />
            <Label htmlFor="dlg-required">Champ obligatoire</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={onConfirm} style={{ backgroundColor: '#1E40AF', color: 'white' }} className="hover:bg-blue-800">
            <Check className="mr-2 h-4 w-4" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FormBuilderEditorPage() {
  const [fields, setFields] = useState<EditableFormField[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [formTitle, setFormTitle] = useState('Bienvenue !');
  const [formDescription, setFormDescription] = useState('Remplissez ce formulaire pour vous connecter.');
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [formButtonLabel, setFormButtonLabel] = useState('Accéder au WiFi');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPreviewSubmitted, setIsPreviewSubmitted] = useState(false);
  const [mobileTab, setMobileTab] = useState<'config' | 'preview'>('config');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [draftField, setDraftField] = useState<EditableFormField | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<EditableFormField | null>(null);

  const [appearanceDialogOpen, setAppearanceDialogOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setIsLoading(true);
    if (formConfig) {
      if (formConfig.name === 'custom' && formConfig.schema?.fields) {
        setFields(formConfig.schema.fields.map((f, i) => ({ ...f, id: f.name + i + Date.now(), type: f.type })));
      } else if (formConfig.name === 'default') {
        setFields(formConfig.schema.fields.map((f, i) => ({ ...f, id: f.name + i + Date.now(), type: f.type })));
        setIsDefault(true);
      } else {
        setFields([]);
      }
      setFormTitle(formConfig.title || 'Bienvenue !');
      setFormDescription(formConfig.description || 'Remplissez ce formulaire pour vous connecter.');
      setExistingLogoUrl(formConfig.logo_url || null);
      setLogoFile(null);
      setLogoPreviewUrl(formConfig.logo_url || null);
      setFormButtonLabel(formConfig.button_label || 'Accéder au WiFi');
    }
    setIsLoading(false);
  }, [formConfig]);

  const openAddFieldDialog = (type: FormFieldType['type']) => {
    if (fields.length >= 5) {
      toast({ variant: 'destructive', title: 'Limite de champs atteinte', description: 'Un formulaire personnalisé ne peut pas contenir plus de 5 champs.' });
      return;
    }
    if (type === 'email' && fields.some(f => f.type === 'email')) {
      toast({ variant: 'destructive', title: 'Champ unique', description: "Un seul champ email est autorisé." });
      return;
    }
    const newId = `field_${Date.now()}`;
    let draft: EditableFormField = { id: newId, type, label: '', placeholder: '', required: false, name: `field_${Date.now()}` };
    if (type === 'email')        draft = { ...draft, label: 'Email', placeholder: 'Entrez votre e-mail', name: 'email', required: true };
    else if (type === 'text')    draft = { ...draft, label: '', placeholder: 'Entrez du texte' };
    else if (type === 'phone')   draft = { ...draft, label: 'Téléphone', placeholder: 'Entrez votre numéro', name: 'phone', required: true };
    else if (type === 'number')  draft = { ...draft, label: '', placeholder: 'Ex: 25' };
    else if (type === 'choice')  draft = { ...draft, label: '', placeholder: 'Choisissez une option', choices: ['Option 1', 'Option 2'] };
    else if (type === 'boolean') draft = { ...draft, label: '', name: `consent_${newId}`, required: true };
    setDraftField(draft);
    setAddDialogOpen(true);
  };

  const confirmAddField = () => {
    if (!draftField) return;
    if (!draftField.label.trim()) {
      toast({ variant: 'destructive', title: 'Libellé manquant', description: 'Veuillez saisir un libellé pour ce champ.' });
      return;
    }
    setFields(prev => [...prev, draftField]);
    setAddDialogOpen(false);
    setDraftField(null);
  };

  const openEditDialog = (field: EditableFormField) => {
    setEditingField({ ...field });
    setEditDialogOpen(true);
  };

  const confirmEditField = () => {
    if (!editingField) return;
    if (!editingField.label.trim()) {
      toast({ variant: 'destructive', title: 'Libellé manquant', description: 'Veuillez saisir un libellé pour ce champ.' });
      return;
    }
    setFields(prev => prev.map(f => f.id === editingField.id ? editingField : f));
    setEditDialogOpen(false);
    setEditingField(null);
  };

  const removeField = (id: string) => setFields(prev => prev.filter(f => f.id !== id));

  const handleLogoClear = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
  };

  const handleLogoFileChange = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Fichier trop grand', description: 'Le logo ne doit pas dépasser 2 MB.' });
      return;
    }
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!formConfig) {
      toast({ variant: 'destructive', title: 'Configuration non chargée' });
      return;
    }
    if (fields.length > 5) {
      toast({ variant: 'destructive', title: 'Trop de champs', description: 'Maximum 5 champs.' });
      return;
    }
    if (fields.some(f => !f.label.trim())) {
      toast({ variant: 'destructive', title: 'Champ invalide', description: 'Tous les champs doivent avoir un libellé.' });
      return;
    }
    const labels = fields.map(f => f.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) {
      toast({ variant: 'destructive', title: 'Libellés en double', description: 'Deux champs ont le même libellé. Utilisez des libellés uniques.' });
      return;
    }

    setIsSaving(true);
    if (!fetchWithAuth) return;

    const slugify = (label: string) =>
      label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '_');

    const finalFields = fields.map(({ id, ...f }) => {
      if (f.type !== 'email' && f.type !== 'phone') f.name = slugify(f.label);
      return f;
    });

    const names = finalFields.map(f => f.name);
    if (new Set(names).size !== names.length) {
      toast({ variant: 'destructive', title: 'Noms en double', description: 'Utilisez des libellés uniques.' });
      setIsSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', isDefault ? 'default' : 'custom');
    formData.append('enable', String(formConfig.enable ?? true));
    formData.append('schema', JSON.stringify({ fields: finalFields }));
    // Préserve les réglages OTP / stratégie de conflit configurés ailleurs
    formData.append('opt', String(formConfig.opt ?? false));
    formData.append('conflict_strategy', formConfig.conflict_strategy ?? 'ALLOW');
    formData.append('title', formTitle);
    formData.append('description', formDescription);
    formData.append('button_label', formButtonLabel);
    if (logoFile) formData.append('logo', logoFile);

    try {
      const response = await fetchWithAuth('/schema/update-schema/', { method: 'POST', body: formData });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.detail || `Erreur serveur (${response.status})`);
      }
      await fetchFormConfig();
      toast({ title: 'Succès', description: 'Formulaire personnalisé appliqué.' });
      router.push('/dashboard/form-builder');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiDescription.trim()) {
      toast({ variant: 'destructive', title: 'Description manquante' });
      return;
    }
    if (!fetchWithAuth) return;
    setIsGenerating(true);
    try {
      const response = await fetchWithAuth('/assistant/generate-form/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiDescription }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.detail || "L'assistant n'a pas pu générer de formulaire valide.",
        );
      }
      const generatedFields = Array.isArray(data.fields) ? data.fields : [];
      if (generatedFields.length === 0) {
        throw new Error("Aucun champ n'a été généré.");
      }
      setFields(
        generatedFields.map((field: any, index: number) => {
          const f: any = {
            ...field,
            id: `${field.name}_${Date.now()}_${index}`,
            required: field.required === true,
          };
          // Le backend renvoie déjà 'choice' avec 'options'.
          // Côté UI on stocke les options sous 'choices'.
          if (f.type === 'choice' && Array.isArray(f.options)) {
            f.choices = f.options;
            delete f.options;
          }
          return f;
        }),
      );
      // Le backend renvoie aussi titre, description et libellé du bouton :
      // on les applique pour gagner du temps à l'utilisateur.
      if (data.title) setFormTitle(data.title);
      if (data.description) setFormDescription(data.description);
      if (data.button_label) setFormButtonLabel(data.button_label);
      toast({
        title: 'Formulaire généré !',
        description: 'Modifiez-le selon vos besoins.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: (error as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPreviewLoading(true);
    toast({ title: 'Simulation en cours...', description: "Aperçu uniquement, aucune donnée envoyée." });
    setTimeout(() => {
      setIsPreviewLoading(false);
      setIsPreviewSubmitted(true);
      setTimeout(() => setIsPreviewSubmitted(false), 4000);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto md:overflow-hidden">

      {/* ── Dialogs (no layout impact) ── */}
      <FieldConfigDialog
        open={addDialogOpen}
        onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setDraftField(null); }}
        field={draftField}
        onChange={setDraftField}
        onConfirm={confirmAddField}
        confirmLabel="Ajouter au formulaire"
      />
      <FieldConfigDialog
        open={editDialogOpen}
        onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingField(null); }}
        field={editingField}
        onChange={setEditingField}
        onConfirm={confirmEditField}
        confirmLabel="Enregistrer les modifications"
      />

      {/* ── Appearance Dialog (popup) ── */}
      <Dialog open={appearanceDialogOpen} onOpenChange={setAppearanceDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Apparence du formulaire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="form-title">Titre</Label>
                <Input id="form-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Bienvenue !" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="form-button-label">Texte du bouton</Label>
                <Input id="form-button-label" value={formButtonLabel} onChange={(e) => setFormButtonLabel(e.target.value)} placeholder="Accéder au WiFi" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form-description">Description</Label>
              <Input id="form-description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Remplissez ce formulaire pour vous connecter." />
            </div>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <LogoDropZone
                previewUrl={logoPreviewUrl}
                onFileChange={handleLogoFileChange}
                onClear={handleLogoClear}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Page header ── */}
      <div className="flex-shrink-0 flex items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline">Éditeur de Formulaire</h1>
          <p className="text-sm text-muted-foreground">Concevez votre formulaire d'identification de vos clients.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setAppearanceDialogOpen(true)}
            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Personnaliser l'apparence</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formConfig}
            className="gap-2"
            style={{ backgroundColor: '#B45309', color: 'white' }}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>{isSaving ? 'Application...' : 'Appliquer'}</span>
          </Button>
        </div>
      </div>

      {/* ── Tabs mobile (Aperçu / Configurer) ── */}
      <div className="md:hidden">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as 'config' | 'preview')}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="config">Configurer</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ── Two-column area: left scrolls, right fixed (desktop) ── */}
      <div className="flex flex-col md:flex-row md:flex-1 md:min-h-0 gap-6">

        {/* Left column — scrollable */}
        <div
          className={cn(
            "min-w-0 space-y-4 md:flex-[3] md:overflow-y-auto md:pr-1 md:block",
            mobileTab === 'config' ? 'block' : 'hidden md:block'
          )}
        >

          {/* IA */}
          <div className="p-4 border rounded-lg bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <Label className="text-base font-semibold">Générer avec l'IA</Label>
            </div>
            <Textarea
              placeholder="Ex: Un formulaire pour un restaurant avec nom, email, et une question sur le plat préféré..."
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              rows={3}
            />
            <Button onClick={handleGenerateWithAi} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Générer le formulaire
            </Button>
          </div>

          {/* Ajouter un champ */}
          <div className="p-4 border border-dashed rounded-lg space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ajouter un champ</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(FIELD_TYPE_META) as [FormFieldType['type'], typeof FIELD_TYPE_META[string]][]).map(([type, m]) => (
                <button
                  key={type}
                  onClick={() => openAddFieldDialog(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all hover:shadow-sm hover:scale-[1.02] active:scale-100 ${m.color}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields list */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {fields.map(field => (
                      <SortableField key={field.id} field={field} onEdit={openEditDialog} removeField={removeField} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {fields.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Commencez par ajouter un champ ci-dessus.</p>
                </div>
              )}
            </>
          )}

          {/* bottom padding so last field isn't hidden */}
          <div className="h-4" />
        </div>

        {/* Right column — fixed on desktop, conditional on mobile */}
        <div className={cn(
          "md:flex md:flex-[2] md:flex-shrink-0 md:flex-col min-h-[400px]",
          mobileTab === 'preview' ? 'flex flex-col' : 'hidden md:flex'
        )}>
          <div className="flex flex-col rounded-lg border bg-card shadow-sm overflow-hidden flex-1">
            <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
              <FormPreview>
                <form onSubmit={handlePreviewSubmit} className="h-full w-full flex items-center justify-center">
                  <FormOverlayPreview
                    isInteractive={!isLoading}
                    isLoading={isPreviewLoading}
                    title={formTitle}
                    description={formDescription}
                    logoUrl={logoPreviewUrl || null}
                    buttonLabel={formButtonLabel}
                  >
                    {isPreviewSubmitted ? (
                      <div className="flex flex-col items-center justify-center text-center h-full py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h4 className="font-bold text-lg text-foreground">Connexion réussie !</h4>
                        <p className="text-sm text-muted-foreground">Vous pouvez maintenant accéder à internet.</p>
                      </div>
                    ) : (
                      <>
                        {fields.map((field) => {
                          if (field.type === 'boolean') {
                            return (
                              <div key={field.id} className="flex items-center space-x-2 pt-2">
                                <Checkbox id={`preview-${field.id}`} required={field.required} />
                                <Label htmlFor={`preview-${field.id}`} className="text-foreground font-normal">
                                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                              </div>
                            );
                          }
                          if (field.type === 'choice') {
                            return (
                              <div key={field.id}>
                                <Label className="text-foreground text-xs font-medium">
                                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <select required={field.required} className="appearance-none mt-1 bg-card h-8 w-full rounded-md border border-input px-3 py-1 text-sm">
                                  <option value="">{field.placeholder || '-- Choisissez --'}</option>
                                  {field.choices?.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          }
                          if (field.type === 'phone') {
                            return (
                              <div key={field.id}>
                                <Label className="text-foreground text-xs font-medium">
                                  {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <PhoneInput defaultCountry="BJ" placeholder={field.placeholder} required={field.required} className="mt-1 h-8" />
                              </div>
                            );
                          }
                          return (
                            <div key={field.id}>
                              <Label className="text-foreground text-xs font-medium">
                                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              <Input type={field.type} placeholder={field.placeholder} required={field.required} className="mt-1 h-8" />
                            </div>
                          );
                        })}
                      </>
                    )}
                  </FormOverlayPreview>
                </form>
              </FormPreview>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
