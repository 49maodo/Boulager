import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, AlertCircle } from 'lucide-react';
import { useGetCategoriesQuery, useCreateProductMutation, useUpdateProductMutation } from '@/store/api/productsApi';
import { Product } from '@/types/api';
import { toast } from 'sonner';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductForm({ open, onOpenChange, product, onSuccess }: ProductFormProps) {
  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating, error: createError }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, error: updateError }] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    quantite_stock: '',
    categorie_id: '',
    actif: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEdit = !!product;
  const isLoading = isCreating || isUpdating;
  // const error = createError || updateError;
  const [error, SetError] = useState(createError || updateError || null);

  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom || '',
        description: product.description || '',
        prix: product.prix?.toString() || '',
        quantite_stock: product.quantite_stock?.toString() || '',
        categorie_id: product.categorie?.id?.toString() || '',
        actif: product.actif ?? true,
      });
      setImagePreview(product.image ? `${import.meta.env.VITE_API_URL}${product.image}` : '');
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      prix: '',
      quantite_stock: '',
      categorie_id: '',
      actif: true,
    });
    setImageFile(null);
    setImagePreview('');
    setValidationErrors({});
    //netoyer les erreurs
    SetError(null);
  };

  // Validation côté client
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      errors.nom = 'Le nom du produit est requis';
    }

    if (!formData.description.trim()) {
      errors.description = 'La description est requise';
    }

    if (!formData.prix || isNaN(parseFloat(formData.prix)) || parseFloat(formData.prix) <= 0) {
      errors.prix = 'Le prix doit être un nombre supérieur à 0';
    }

    if (!formData.quantite_stock || isNaN(parseInt(formData.quantite_stock)) || parseInt(formData.quantite_stock) < 0) {
      errors.quantite_stock = 'La quantité en stock doit être un nombre supérieur ou égal à 0';
    }

    if (!formData.categorie_id) {
      errors.categorie_id = 'La catégorie est requise';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation de fichier
      if (file.size > 5 * 1024 * 1024) {
        // 5MB max
        setValidationErrors((prev) => ({ ...prev, image: "L'image ne peut pas dépasser 5MB" }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setValidationErrors((prev) => ({ ...prev, image: 'Seuls les fichiers image sont acceptés' }));
        return;
      }

      setImageFile(file);
      setValidationErrors((prev) => {
        const { image, ...rest } = prev;
        return rest;
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 Form submitted with data:', formData);

    // Validation côté client
    if (!validateForm()) {
      console.log('❌ Client validation failed:', validationErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    console.log('✅ Client validation passed');

    try {
      // Préparer le payload pour l'API
      const payload: any = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        prix: parseFloat(formData.prix),
        quantite_stock: parseInt(formData.quantite_stock),
        categorie_id: parseInt(formData.categorie_id),
        actif: formData.actif,
      };

      // Ajouter l'image seulement si elle existe
      if (imageFile) {
        payload.image = imageFile;
      }

      console.log('📦 Payload prepared:', payload);

      if (isEdit && product) {
        console.log(`🔄 Updating product ${product.id}`);
        payload.id = product.id;
        // await updateProduct(payload).unwrap();
        await updateProduct({ id: product.id, ...payload }).unwrap();
        toast.success('Produit modifié avec succès !');
      } else {
        console.log('➕ Creating new product');
        await createProduct(payload).unwrap();
        toast.success('Produit créé avec succès !');
      }

      console.log('✅ API call successful');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ API call failed:', err);
      console.error('Error details:', {
        status: err?.status,
        data: err?.data,
        message: err?.message,
      });

      // Gestion des erreurs de validation du serveur
      if (err?.data?.errors) {
        console.log('📋 Server validation errors:', err.data.errors);
        const serverErrors: Record<string, string> = {};

        // Convertir les erreurs Laravel (arrays) en strings
        Object.entries(err.data.errors).forEach(([key, value]) => {
          serverErrors[key] = Array.isArray(value) ? value[0] : (value as string);
        });

        setValidationErrors(serverErrors);
        toast.error('Erreurs de validation du serveur');
      } else {
        toast.error(isEdit ? 'Erreur lors de la modification' : 'Erreur lors de la création');
      }
    }
  };

  const categories = categoriesResponse?.data || [];

  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName] || '';
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Modifiez les informations du produit' : 'Créez un nouveau produit pour votre catalogue'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{'data' in error && error.data ? (error.data as any).message || "Erreur lors de l'opération" : "Erreur lors de l'opération"}</AlertDescription>
            </Alert>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='nom'>Nom du produit *</Label>
              <Input
                id='nom'
                value={formData.nom}
                onChange={(e) => {
                  setFormData({ ...formData, nom: e.target.value });
                  if (validationErrors.nom) {
                    setValidationErrors((prev) => {
                      const { nom, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder='Ex: Baguette Tradition'
                className={getFieldError('nom') ? 'border-red-500' : ''}
              />
              {getFieldError('nom') && <p className='text-sm text-red-500 mt-1'>{getFieldError('nom')}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='categorie_id'>Catégorie *</Label>
              <Select
                value={formData.categorie_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, categorie_id: value });
                  if (validationErrors.categorie_id) {
                    setValidationErrors((prev) => {
                      const { categorie_id, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
              >
                <SelectTrigger className={getFieldError('categorie_id') ? 'border-red-500' : ''}>
                  <SelectValue placeholder='Sélectionner une catégorie' />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.actif)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nom}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {getFieldError('categorie_id') && <p className='text-sm text-red-500 mt-1'>{getFieldError('categorie_id')}</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description *</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (validationErrors.description) {
                  setValidationErrors((prev) => {
                    const { description, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              placeholder='Décrivez votre produit...'
              rows={3}
              className={getFieldError('description') ? 'border-red-500' : ''}
            />
            {getFieldError('description') && <p className='text-sm text-red-500 mt-1'>{getFieldError('description')}</p>}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='prix'>Prix (XOF) *</Label>
              <Input
                id='prix'
                type='number'
                step='1'
                min='1'
                value={formData.prix}
                onChange={(e) => {
                  setFormData({ ...formData, prix: e.target.value });
                  if (validationErrors.prix) {
                    setValidationErrors((prev) => {
                      const { prix, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder='0'
                className={getFieldError('prix') ? 'border-red-500' : ''}
              />
              {getFieldError('prix') && <p className='text-sm text-red-500 mt-1'>{getFieldError('prix')}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='quantite_stock'>Stock *</Label>
              <Input
                id='quantite_stock'
                type='number'
                min='0'
                value={formData.quantite_stock}
                onChange={(e) => {
                  setFormData({ ...formData, quantite_stock: e.target.value });
                  if (validationErrors.quantite_stock) {
                    setValidationErrors((prev) => {
                      const { quantite_stock, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder='0'
                className={getFieldError('quantite_stock') ? 'border-red-500' : ''}
              />
              {getFieldError('quantite_stock') && <p className='text-sm text-red-500 mt-1'>{getFieldError('quantite_stock')}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div className='space-y-2'>
            <Label htmlFor='image'>Image du produit</Label>
            <div className='space-y-4'>
              {imagePreview && (
                <div className='relative inline-block'>
                  <img src={imagePreview} alt='Aperçu' className='h-32 w-32 object-cover rounded-lg border' />
                  <Button type='button' variant='destructive' size='icon' className='absolute -top-2 -right-2 h-6 w-6' onClick={removeImage}>
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              )}
              <div className='flex items-center space-x-2'>
                <Input id='image' type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
                <Button type='button' variant='outline' onClick={() => document.getElementById('image')?.click()}>
                  <Upload className='mr-2 h-4 w-4' />
                  {imagePreview ? "Changer l'image" : 'Ajouter une image'}
                </Button>
              </div>
              {getFieldError('image') && <p className='text-sm text-red-500 mt-1'>{getFieldError('image')}</p>}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch id='actif' checked={formData.actif} onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })} />
            <Label htmlFor='actif'>Produit actif</Label>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
