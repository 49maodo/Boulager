import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, Edit, Trash2, Tag, Calendar as CalendarIcon, Percent, Gift, Clock, Loader2, Package } from 'lucide-react';
import { useGetPromotionsQuery, useCreatePromotionMutation, useUpdatePromotionMutation, useDeletePromotionMutation } from '@/store/api/promotionsApi';
import { useGetProductsQuery } from '@/store/api/productsApi';
import { Promotion } from '@/types/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export function PromotionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [newPromotion, setNewPromotion] = useState({
    nom: '',
    description: '',
    type: 'POURCENTAGE' as 'POURCENTAGE' | 'MONTANT_FIXE' | 'ACHETEZ_X_OBTENEZ_Y',
    valeur_remise: 0,
    date_debut: new Date().toISOString(),
    date_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    produits_ids: [] as number[],
  });

  const { data: promotionsResponse, isLoading, error, refetch } = useGetPromotionsQuery();

  const { data: productsResponse } = useGetProductsQuery();

  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  const promotions = promotionsResponse?.data || [];
  const products = productsResponse?.data || [];

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch = promotion.nom.toLowerCase().includes(searchTerm.toLowerCase()) || promotion.description.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const endDate = new Date(promotion.date_fin);
    const isExpired = endDate < now;

    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && !isExpired) || (statusFilter === 'expired' && isExpired);

    return matchesSearch && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'POURCENTAGE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'MONTANT_FIXE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ACHETEZ_X_OBTENEZ_Y':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'POURCENTAGE':
        return 'Pourcentage';
      case 'MONTANT_FIXE':
        return 'Montant fixe';
      case 'ACHETEZ_X_OBTENEZ_Y':
        return 'Achetez X obtenez Y';
      default:
        return type;
    }
  };

  const getStatusColor = (promotion: Promotion) => {
    const now = new Date();
    const endDate = new Date(promotion.date_fin);
    if (endDate < now) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const getStatusLabel = (promotion: Promotion) => {
    const now = new Date();
    const endDate = new Date(promotion.date_fin);
    if (endDate < now) return 'Expirée';
    return 'Active';
  };

  const handleCreatePromotion = async () => {
    try {
      await createPromotion(newPromotion).unwrap();
      toast.success('Promotion créée avec succès !');
      refetch();
    } catch (error) {
      console.error('Failed to create promotion:', error);
      toast.error('Erreur lors de la création de la promotion');
    }
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    resetForm();
    setIsDialogOpen(true);
  };
  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setNewPromotion({
      nom: promotion.nom,
      description: promotion.description,
      type: promotion.type as any,
      valeur_remise: parseFloat(promotion.valeur_remise),
      date_debut: promotion.date_debut,
      date_fin: promotion.date_fin,
      produits_ids: promotion.produits_ids || [],
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromotion(null);
    resetForm();
  };

  const handleUpdatePromotion = async () => {
    if (!editingPromotion) return;

    try {
      await updatePromotion({
        id: editingPromotion.id,
        data: newPromotion,
      }).unwrap();
      toast.success('Promotion modifiée avec succès !');
      refetch();
    } catch (error) {
      console.error('Failed to update promotion:', error);
      toast.error('Erreur lors de la modification de la promotion');
    }
  };

  const handleDeletePromotion = async (promotionId: number, promotionName: string) => {
    try {
      await deletePromotion(promotionId).unwrap();
      toast.success(`Promotion "${promotionName}" supprimée avec succès !`);
      refetch();
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      toast.error('Erreur lors de la suppression de la promotion');
    }
  };

  const resetForm = () => {
    setNewPromotion({
      nom: '',
      description: '',
      type: 'POURCENTAGE',
      valeur_remise: 0,
      date_debut: new Date().toISOString(),
      date_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      produits_ids: [],
    });
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <Tag className='mx-auto h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>Erreur de chargement</h3>
        <p className='text-muted-foreground'>Impossible de charger les promotions. Veuillez réessayer.</p>
        <Button onClick={() => refetch()} className='mt-4'>
          Réessayer
        </Button>
      </div>
    );
  }

  const now = new Date();
  const activePromotions = promotions.filter((p) => new Date(p.date_fin) > now);
  const expiredPromotions = promotions.filter((p) => new Date(p.date_fin) <= now);

  const stats = [
    {
      title: 'Promotions actives',
      value: activePromotions.length,
      icon: Tag,
      color: 'text-green-600',
    },
    {
      title: 'Promotions expirées',
      value: expiredPromotions.length,
      icon: Clock,
      color: 'text-red-600',
    },
    {
      title: 'Total promotions',
      value: promotions.length,
      icon: Gift,
      color: 'text-blue-600',
    },
    {
      title: 'Produits concernés',
      value: parseInt(promotions.reduce((sum, p) => sum + parseInt(p.NbProduits || '0'), 0).toString()),
      icon: Package,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Gestion des promotions</h2>
          <p className='text-muted-foreground'>Créez et gérez vos offres spéciales et promotions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{editingPromotion ? 'Modifier la promotion' : 'Nouvelle promotion'}</DialogTitle>
              <DialogDescription>{editingPromotion ? 'Modifiez les détails de la promotion' : 'Créez une nouvelle promotion pour vos clients'}</DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='nom'>Nom de la promotion</Label>
                  <Input id='nom' value={newPromotion.nom} onChange={(e) => setNewPromotion({ ...newPromotion, nom: e.target.value })} placeholder='Ex: Happy Hour Viennoiseries' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='type'>Type de promotion</Label>
                  <Select value={newPromotion.type} onValueChange={(value: any) => setNewPromotion({ ...newPromotion, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='POURCENTAGE'>Pourcentage</SelectItem>
                      <SelectItem value='MONTANT_FIXE'>Montant fixe</SelectItem>
                      <SelectItem value='ACHETEZ_X_OBTENEZ_Y'>Achetez X obtenez Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea id='description' value={newPromotion.description} onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })} placeholder='Décrivez votre promotion...' rows={3} />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='valeur_remise'>{newPromotion.type === 'POURCENTAGE' ? 'Pourcentage (%)' : newPromotion.type === 'MONTANT_FIXE' ? 'Montant (XOF)' : 'Quantité offerte'}</Label>
                <Input id='valeur_remise' type='number' value={newPromotion.valeur_remise} onChange={(e) => setNewPromotion({ ...newPromotion, valeur_remise: Number(e.target.value) })} placeholder='0' />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start text-left font-normal'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {format(new Date(newPromotion.date_debut), 'PPP', { locale: fr })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={new Date(newPromotion.date_debut)}
                        onSelect={(date) =>
                          date &&
                          setNewPromotion({
                            ...newPromotion,
                            date_debut: date.toISOString(),
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='space-y-2'>
                  <Label>Date de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-full justify-start text-left font-normal'>
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {format(new Date(newPromotion.date_fin), 'PPP', { locale: fr })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={new Date(newPromotion.date_fin)}
                        onSelect={(date) =>
                          date &&
                          setNewPromotion({
                            ...newPromotion,
                            date_fin: date.toISOString(),
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Produits applicables</Label>
                <div className='grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2'>
                  {products
                    .filter((p) => p.actif)
                    .map((product) => (
                      <div key={product.id} className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id={`product-${product.id}`}
                          checked={newPromotion.produits_ids.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewPromotion({
                                ...newPromotion,
                                produits_ids: [...newPromotion.produits_ids, product.id],
                              });
                            } else {
                              setNewPromotion({
                                ...newPromotion,
                                produits_ids: newPromotion.produits_ids.filter((id) => id !== product.id),
                              });
                            }
                          }}
                          className='rounded'
                        />
                        <Label htmlFor={`product-${product.id}`} className='text-sm'>
                          {product.nom}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button onClick={editingPromotion ? handleUpdatePromotion : handleCreatePromotion} disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {editingPromotion ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={handleOpenCreate}>
          <Plus className='mr-2 h-4 w-4' />
          Nouvelle promotion
        </Button>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Rechercher une promotion...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-8' />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <SelectValue placeholder='Statut' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Toutes</SelectItem>
            <SelectItem value='active'>Actives</SelectItem>
            <SelectItem value='expired'>Expirées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions ({filteredPromotions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{promotion.nom}</p>
                        <p className='text-sm text-muted-foreground line-clamp-2'>{promotion.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(promotion.type)}>{getTypeLabel(promotion.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        {promotion.type === 'POURCENTAGE' && <Percent className='mr-1 h-3 w-3' />}
                        {promotion.type === 'MONTANT_FIXE' && <span className='mr-1 text-xs'>XOF</span>}
                        <span className='font-medium'>
                          {promotion.valeur_remise}
                          {promotion.type === 'POURCENTAGE' && '%'}
                          {promotion.type === 'MONTANT_FIXE' && ' XOF'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <p>{format(new Date(promotion.date_debut), 'dd/MM/yyyy', { locale: fr })}</p>
                        <p className='text-muted-foreground'>au {format(new Date(promotion.date_fin), 'dd/MM/yyyy', { locale: fr })}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className='text-sm'>
                        {promotion.NbProduits} produit{parseInt(promotion.NbProduits) !== 1 ? 's' : ''}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(promotion)}>{getStatusLabel(promotion)}</Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant='outline' size='sm' onClick={() => handleEditPromotion(promotion)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                          </DialogTrigger>
                          {editingPromotion && <PromotionDialog isEdit />}
                        </Dialog> */}
                        <Button variant='outline' size='sm' onClick={() => handleOpenEdit(promotion)}>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant='outline' size='sm' className='text-red-600 hover:text-red-700' disabled={isDeleting}>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la promotion</AlertDialogTitle>
                              <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer la promotion "{promotion.nom}" ? Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePromotion(promotion.id, promotion.nom)} className='bg-red-600 hover:bg-red-700'>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredPromotions.length === 0 && (
              <div className='text-center py-12'>
                <Tag className='mx-auto h-12 w-12 text-muted-foreground' />
                <h3 className='mt-4 text-lg font-semibold'>Aucune promotion trouvée</h3>
                <p className='text-muted-foreground'>{promotions.length === 0 ? "Aucune promotion n'a encore été créée." : 'Essayez de modifier vos critères de recherche.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
