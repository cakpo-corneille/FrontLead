'use client';

import { useEffect, useState } from 'react';
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
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Loader2,
  Check,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { generateForm } from '../actions';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { FormPreview } from '@/components/dashboard/form-preview';
import { FormOverlayPreview } from '@/components/dashboard/form-overlay-preview';
import { useAuth } from '@/contexts/auth-context';
import type { FormField as FormFieldType } from '@/lib/types';
import { PhoneInput } from '@/components/ui/phone-input';

interface EditableFormField extends FormFieldType {
  id: string;
}

function SortableField({ field, updateField, removeField }: { field: EditableFormField; updateField: (id: string, key: keyof EditableFormField, value: any) => void; removeField: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSpecialNameField = field.name === 'email' || field.name === 'phone';

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded-lg border shadow-sm flex items-start gap-3">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground pt-3">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-grow space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`label-${field.id}`}>Libellé</Label>
          <Input
            id={`label-${field.id}`}
            value={field.label}
            onChange={(e) => updateField(field.id, 'label', e.target.value)}
            readOnly={isSpecialNameField}
            className={isSpecialNameField ? 'bg-muted border-none cursor-not-allowed' : ''}
          />
        </div>

        {field.type !== 'boolean' && field.type !== 'choice' && (
            <div className="space-y-2">
              <Label htmlFor={`placeholder-${field.id}`}>Texte de substitution</Label>
              <Input
                id={`placeholder-${field.id}`}
                value={field.placeholder}
                onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
              />
            </div>
        )}

        {field.type === 'choice' && (
          <div className="space-y-2">
            <Label htmlFor={`options-${field.id}`}>Options (une par ligne)</Label>
            <Textarea
              id={`options-${field.id}`}
              value={field.choices?.join('\n') || ''}
              onChange={(e) => updateField(field.id, 'choices', e.target.value.split('\n'))}
              placeholder={'Option 1\nOption 2\nOption 3'}
              rows={4}
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Switch
                    id={`required-${field.id}`}
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(field.id, 'required', checked)}
                />
                <Label htmlFor={`required-${field.id}`}>Obligatoire</Label>
            </div>
        </div>
      </div>
      <button onClick={() => removeField(field.id)} className="text-muted-foreground hover:text-destructive pt-3">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function FormBuilderEditorPage() {
  const [fields, setFields] = useState<EditableFormField[]>([]);
  const [formName, setFormName] = useState('custom');
  const [isDefault, setIsDefault] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPreviewSubmitted, setIsPreviewSubmitted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { fetchWithAuth, formConfig, fetchFormConfig } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  useEffect(() => {
    setIsLoading(true);
    if (formConfig) {
        if (formConfig.name === 'custom' && formConfig.schema?.fields) {
            const fieldsWithId = formConfig.schema.fields.map((f, index) => ({
                ...f, 
                id: f.name + index + Date.now(),
                type: f.type,
            }));
            setFields(fieldsWithId);
        } else if(formConfig.name === 'default') {
             const fieldsWithId = formConfig.schema.fields.map((f, index) => ({
                ...f, 
                id: f.name + index + Date.now(),
                type: f.type,
            }));
            setFields(fieldsWithId);
            setIsDefault(true);
            setFormName('default');
        } else {
            setFields([]);
        }
    }
    setIsLoading(false);
  }, [formConfig]);
  

  const addField = (type: FormFieldType['type']) => {
    if (fields.length >= 5) {
      toast({
        variant: 'destructive',
        title: 'Limite de champs atteinte',
        description: 'Un formulaire personnalisé ne peut pas contenir plus de 5 champs.',
      });
      return;
    }

    if (type === 'email' && fields.some(f => f.type === 'email')) {
      toast({ variant: 'destructive', title: 'Champ unique', description: "Un seul champ email est autorisé." });
      return;
    }

    const newId = `field_${Date.now()}`;
    let newField: EditableFormField = {
      id: newId,
      type: type,
      label: 'Nouveau champ',
      placeholder: '',
      required: false,
      name: `field_${Date.now()}`,
    };
    if(type === 'email') {
        newField = { ...newField, label: 'Email', placeholder: 'Entrez votre e-mail', name: 'email', required: true };
    } else if (type === 'text') {
        newField = { ...newField, label: 'Texte', placeholder: 'Entrez du texte' };
    } else if (type === 'phone') {
        newField = { ...newField, label: 'Téléphone', placeholder: 'Entrez votre numéro', name: 'phone', required: true };
    } else if (type === 'choice') {
        newField = { ...newField, label: 'Sélection', placeholder: 'Choisissez une option', choices: ['Option 1', 'Option 2'] };
    } else if (type === 'boolean') {
        newField = { ...newField, label: 'Accepter les conditions', name: `consent_${Date.now()}`, required: true };
    }
    
    setFields((prev) => [...prev, newField]);
  };

  const updateField = (id: string, key: keyof EditableFormField, value: any) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, [key]: value } : field))
    );
  };
  
  const removeField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async (apply: boolean = true) => {
    if (!formConfig) {
      toast({
        variant: 'destructive',
        title: 'Configuration non chargée',
        description: 'Veuillez attendre que la configuration soit complètement chargée avant de sauvegarder.',
      });
      return;
    }

    if (fields.length > 5) {
      toast({ variant: 'destructive', title: 'Trop de champs', description: 'Le formulaire ne peut pas contenir plus de 5 champs.'});
      return;
    }
    const hasEmailOrPhone = fields.some(f => f.type === 'email' || f.type === 'phone');
    if (!hasEmailOrPhone) {
      toast({ variant: 'destructive', title: 'Champ de contact manquant', description: 'Le formulaire doit contenir un champ "Email" ou "Téléphone".' });
      return;
    }
    if (fields.some(f => !f.label.trim())) {
        toast({ variant: 'destructive', title: 'Champ invalide', description: 'Tous les champs doivent avoir un libellé.' });
        return;
    }

    setIsSaving(true);
    if (!fetchWithAuth) return;

    const generateNameFromLabel = (label: string) => {
      return label.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '_');
    };

    const finalFields = fields.map(field => {
      const { id, ...apiField } = field;
      if (apiField.type !== 'email' && apiField.type !== 'phone') {
        apiField.name = generateNameFromLabel(apiField.label);
      }
      return apiField;
    });

    const names = finalFields.map(f => f.name);
    if (new Set(names).size !== names.length) {
      toast({ variant: 'destructive', title: 'Noms de champs en double', description: 'Plusieurs champs génèrent le même nom technique. Veuillez utiliser des libellés uniques.' });
      setIsSaving(false);
      return;
    }

    const payload = {
      name: isDefault ? 'default' : 'custom',
      is_default: isDefault,
      schema: { fields: finalFields },
      double_opt_enable: formConfig.double_opt_enable,
      preferred_channel: formConfig.preferred_channel,
    };
    
    try {
        const response = await fetchWithAuth('/schema/update_schema/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || data.detail || `Erreur serveur (${response.status})`);
        }
        
        await fetchFormConfig();

        if (apply) {
             toast({ title: 'Succès', description: 'Formulaire personnalisé appliqué.' });
             router.push('/dashboard/form-builder');
        } else {
             toast({ title: 'Succès', description: 'Formulaire enregistré.' });
        }

    } catch(error) {
        toast({ variant: 'destructive', title: 'Erreur de sauvegarde', description: (error as Error).message });
    } finally {
        setIsSaving(false);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiDescription.trim()) {
      toast({ variant: 'destructive', title: 'Description manquante', description: 'Veuillez décrire le formulaire que vous souhaitez générer.' });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateForm(aiDescription);

      if (result.error || !result.formSchema) {
        throw new Error(result.error || "L'IA n'a pas pu générer de formulaire valide.");
      }
      
      const newFields = result.formSchema.fields.map((field, index) => {
        const editableField: any = {
            ...field,
            id: `${field.name}_${Date.now()}_${index}`,
            required: field.required === true,
        };
        if(editableField.type === 'select'){
            editableField.type = 'choice';
            editableField.choices = editableField.options;
            delete editableField.options;
        }
        return editableField;
      });

      setFields(newFields);
      toast({ title: 'Formulaire généré !', description: "Le formulaire a été créé par l'IA. Vous pouvez maintenant le modifier." });

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur de génération IA', description: (error as Error).message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPreviewLoading(true);
    toast({ title: 'Simulation en cours...', description: "Ceci est un aperçu. Aucune donnée n'est réellement envoyée." });
    setTimeout(() => {
      setIsPreviewLoading(false);
      setIsPreviewSubmitted(true);
      setTimeout(() => setIsPreviewSubmitted(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Éditeur de Formulaire</h1>
        <p className="text-muted-foreground">Concevez votre formulaire de collecte de leads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
            <div className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <Label htmlFor="ai-description" className="text-base font-semibold">Générer avec l'IA</Label>
              </div>
              <Textarea id="ai-description" placeholder="Ex: Un formulaire pour un restaurant avec nom, email, et une question sur le plat préféré..." value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} rows={3} />
              <Button onClick={handleGenerateWithAi} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Générer le formulaire
              </Button>
            </div>
            
            <div className="p-4 border border-dashed rounded-lg flex flex-wrap gap-2 justify-center sm:justify-start">
                 <Button variant="outline" onClick={() => addField('text')}><Plus className="mr-2 h-4 w-4" />Texte</Button>
                 <Button variant="outline" onClick={() => addField('email')}><Plus className="mr-2 h-4 w-4" />E-mail</Button>
                 <Button variant="outline" onClick={() => addField('phone')}><Plus className="mr-2 h-4 w-4" />Téléphone</Button>
                 <Button variant="outline" onClick={() => addField('choice')}><Plus className="mr-2 h-4 w-4" />Sélecteur</Button>
                 <Button variant="outline" onClick={() => addField('boolean')}><Plus className="mr-2 h-4 w-4" />Case à cocher</Button>
            </div>
             
             {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
             ) : (
                <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                            {fields.map(field => (
                                <SortableField key={field.id} field={field} updateField={updateField} removeField={removeField} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                {fields.length === 0 && <div className="text-center py-12 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">Commencez par ajouter un champ à votre formulaire.</p></div>}
                </>
             )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col lg:flex-col-reverse">
              <div className="p-4 flex items-center justify-center">
                <FormPreview>
                  <form
                    onSubmit={handlePreviewSubmit}
                    className="h-full w-full flex items-center justify-center"
                  >
                    <FormOverlayPreview
                      isInteractive={!isLoading}
                      isLoading={isPreviewLoading}
                    >
                      {isPreviewSubmitted ? (
                        <div className="flex flex-col items-center justify-center text-center h-full py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                          <h4 className="font-bold text-lg text-gray-900">
                            Connexion réussie !
                          </h4>
                          <p className="text-sm text-gray-600">
                            Vous pouvez maintenant accéder à internet.
                          </p>
                        </div>
                      ) : (
                        <>
                          {fields.map((field) => {
                            if (field.type === 'boolean') {
                              return (
                                <div
                                  key={field.id}
                                  className="flex items-center space-x-2 pt-2"
                                >
                                  <Checkbox
                                    id={`preview-${field.id}`}
                                    required={field.required}
                                  />
                                  <Label
                                    htmlFor={`preview-${field.id}`}
                                    className="text-gray-700 font-normal"
                                  >
                                    {field.label}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </Label>
                                </div>
                              );
                            }
                            if (field.type === 'choice') {
                              return (
                                <div key={field.id}>
                                  <Label className="text-gray-700 text-xs font-medium">
                                    {field.label}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </Label>
                                  <select
                                    required={field.required}
                                    className="appearance-none mt-1 bg-white h-8 w-full rounded-md border border-input px-3 py-1 text-sm"
                                  >
                                    <option value="">
                                      {field.placeholder || '-- Choisissez --'}
                                    </option>
                                    {field.choices?.map((option, index) => (
                                      <option key={index} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }
                            if (field.type === 'phone') {
                              return (
                                <div key={field.id}>
                                  <Label className="text-gray-700 text-xs font-medium">
                                    {field.label}
                                    {field.required && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </Label>
                                  <PhoneInput
                                    defaultCountry="BJ"
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className="mt-1 h-8"
                                  />
                                </div>
                              );
                            }
                            return (
                              <div key={field.id}>
                                <Label className="text-gray-700 text-xs font-medium">
                                  {field.label}
                                  {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </Label>
                                <Input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  required={field.required}
                                  className="mt-1 h-8"
                                />
                              </div>
                            );
                          })}
                        </>
                      )}
                    </FormOverlayPreview>
                  </form>
                </FormPreview>
              </div>
              <div className="p-4 border-t lg:border-b lg:border-t-0">
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving || !formConfig}
                  style={{ backgroundColor: '#B45309', color: 'white' }}
                  className="w-full hover:bg-[#92400E] active:bg-[#78350F]"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? 'Application...' : 'Appliquer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
