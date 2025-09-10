import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/store/api/productsApi';
import { Category } from '@/types/api';
import { toast } from 'sonner';

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess?: () => void;
}

export function CategoryForm({ open, onOpenChange, category, onSuccess }: CategoryFormProps) {
  const [createCategory, { isLoading: isCreating, error: createError }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, error: updateError }] = useUpdateCategoryMutation();
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    actif: true
  });

  const isEdit = !!category;
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  useEffect(() => {
    if (category) {
      setFormData({
        nom: category.nom,
        description: category.description,
        actif: category.actif || true
      });
    } else {
      resetForm();
    }
  }, [category]);

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      actif: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEdit && category) {
        await updateCategory({ id: category.id, ...formData }).unwrap();
        toast.success('Catégorie modifiée avec succès !');
      } else {
        await createCategory(formData).unwrap();
        toast.success('Catégorie créée avec succès !');
      }
      
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error('Category operation failed:', err);
      toast.error(isEdit ? 'Erreur lors de la modification' : 'Erreur lors de la création');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie de produits'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {'data' in error && error.data ? 
                  (error.data as any).message || 'Erreur lors de l\'opération' :
                  'Erreur lors de l\'opération'
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nom">Nom de la catégorie *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex: Viennoiseries"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez cette catégorie..."
              rows={3}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
            />
            <Label htmlFor="actif">Catégorie active</Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}