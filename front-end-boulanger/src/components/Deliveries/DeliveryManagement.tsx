import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Truck, MapPin, Clock, CheckCircle, AlertCircle, Navigation, Phone, User, Loader2 } from 'lucide-react';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api/ordersApi';
import { Order } from '@/types/api';
import { toast } from 'sonner';

export function DeliveryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Order | null>(null);

  const { data: ordersResponse, isLoading, error, refetch } = useGetOrdersQuery({ per_page: 100 });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = ordersResponse?.data || [];

  // Filter only delivery orders
  const deliveries = orders.filter((order) => ['confirmee', 'en_preparation', 'en_livraison', 'livree'].includes(order.statut || ''));

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch = delivery.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) || delivery.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || delivery.adresse_livraison.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmee':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'en_preparation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'en_livraison':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'livree':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'annulee':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmee':
        return 'Confirmée';
      case 'en_preparation':
        return 'En préparation';
      case 'en_livraison':
        return 'En livraison';
      case 'livree':
        return 'Livrée';
      case 'annulee':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getPriorityColor = (deliveryDate: string, status: string) => {
    if (status === 'livree') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const timeDiff = delivery.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (hoursDiff < 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  };

  const getPriorityLabel = (deliveryDate: string, status: string) => {
    if (status === 'livree') return 'Normal';
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const timeDiff = delivery.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 0) return 'En retard';
    if (hoursDiff < 2) return 'Urgent';
    return 'Normal';
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus({
        id: orderId,
        statut: newStatus as any,
      }).unwrap();
      setSelectedDelivery(null);
      toast.success('Statut mis à jour avec succès !');
      refetch();
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const DeliveryDetailDialog = ({ delivery }: { delivery: Order }) => (
    <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
      <DialogHeader>
        <DialogTitle>Livraison {delivery.numero_commande}</DialogTitle>
        <DialogDescription>
          Détails de la livraison pour {delivery.client.firstname} {delivery.client.name}
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-6'>
        {/* Status and Priority */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium'>Statut</label>
            <div className='mt-1'>
              <Badge className={getStatusColor(delivery.statut || '')}>{getStatusLabel(delivery.statut || '')}</Badge>
            </div>
          </div>
          <div>
            <label className='text-sm font-medium'>Priorité</label>
            <div className='mt-1'>
              <Badge className={getPriorityColor(delivery.date_livraison, delivery.statut)}>{getPriorityLabel(delivery.date_livraison, delivery.statut)}</Badge>
            </div>
          </div>
        </div>

        {/* Customer and Address */}
        <div>
          <h4 className='font-medium mb-2'>Informations de livraison</h4>
          <div className='bg-muted/50 p-3 rounded-lg space-y-2'>
            <div className='flex items-center'>
              <User className='mr-2 h-4 w-4' />
              <span className='font-medium'>
                {delivery.client.firstname} {delivery.client.name}
              </span>
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
              <Phone className='mr-2 h-4 w-4' />
              {delivery.client.telephone || 'Non renseigné'}
            </div>
            <div className='flex items-center text-sm text-muted-foreground'>
              <MapPin className='mr-2 h-4 w-4' />
              {delivery.adresse_livraison}
            </div>
          </div>
        </div>

        {/* Timing */}
        <div>
          <label className='text-sm font-medium'>Date de livraison prévue</label>
          <div className='flex items-center mt-1 text-sm text-muted-foreground'>
            <Clock className='mr-2 h-4 w-4' />
            {new Date(delivery.date_livraison).toLocaleString('fr-FR')}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h4 className='font-medium mb-2'>Résumé de la commande</h4>
          <div className='border rounded-lg p-3'>
            <div className='flex justify-between items-center'>
              <span>Montant total:</span>
              <span className='font-bold'>{parseFloat(delivery.montant_total || '0').toFixed(2)} XOF</span>
            </div>
            <div className='flex justify-between items-center mt-2'>
              <span>Mode de paiement:</span>
              <span>{delivery.mode_paiement || 'Non défini'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='border-t pt-4'>
          <label className='text-sm font-medium mb-2 block'>Actions</label>
          <div className='flex gap-2 flex-wrap'>
            {delivery.statut === 'confirmee' && (
              <Button size='sm' onClick={() => handleUpdateStatus(delivery.id, 'en_preparation')} disabled={isUpdating}>
                Commencer la préparation
              </Button>
            )}
            {delivery.statut === 'en_preparation' && (
              <Button size='sm' onClick={() => handleUpdateStatus(delivery.id, 'en_livraison')} disabled={isUpdating}>
                <Truck className='mr-2 h-4 w-4' />
                Commencer la livraison
              </Button>
            )}
            {delivery.statut === 'en_livraison' && (
              <Button size='sm' onClick={() => handleUpdateStatus(delivery.id, 'livree')} disabled={isUpdating}>
                <CheckCircle className='mr-2 h-4 w-4' />
                Marquer comme livrée
              </Button>
            )}
            <Button size='sm' variant='outline'>
              <Navigation className='mr-2 h-4 w-4' />
              Voir l'itinéraire
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );

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
        <Truck className='mx-auto h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>Erreur de chargement</h3>
        <p className='text-muted-foreground'>Impossible de charger les livraisons. Veuillez réessayer.</p>
        <Button onClick={() => refetch()} className='mt-4'>
          Réessayer
        </Button>
      </div>
    );
  }

  const stats = [
    {
      title: 'En préparation',
      value: deliveries.filter((d) => d.statut === 'en_preparation').length,
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: 'En cours',
      value: deliveries.filter((d) => d.statut === 'en_livraison').length,
      icon: Truck,
      color: 'text-orange-600',
    },
    {
      title: 'Livrées',
      value: deliveries.filter((d) => d.statut === 'livree').length,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'En retard',
      value: deliveries.filter((d) => {
        const deliveryDate = new Date(d.date_livraison);
        return deliveryDate.getTime() < Date.now() && d.statut !== 'livree';
      }).length,
      icon: AlertCircle,
      color: 'text-red-600',
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Gestion des livraisons</h2>
          <p className='text-muted-foreground'>Suivez et gérez toutes les livraisons en cours</p>
        </div>
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
          <Input placeholder='Rechercher une livraison...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-8' />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <SelectValue placeholder='Statut' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tous les statuts</SelectItem>
            <SelectItem value='confirmee'>Confirmée</SelectItem>
            <SelectItem value='en_preparation'>En préparation</SelectItem>
            <SelectItem value='en_livraison'>En livraison</SelectItem>
            <SelectItem value='livree'>Livrée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Livraisons ({filteredDeliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Date prévue</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{delivery.numero_commande}</p>
                        <p className='text-sm text-muted-foreground'>{parseFloat(delivery.montant_total || '0').toFixed(2)} XOF</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='font-medium'>
                          {delivery.client.firstname} {delivery.client.name}
                        </p>
                        <p className='text-xs text-muted-foreground'>{delivery.client.telephone || 'Pas de téléphone'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className='text-sm max-w-[200px] truncate'>{delivery.adresse_livraison}</p>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center text-sm'>
                        <Clock className='mr-1 h-3 w-3' />
                        {new Date(delivery.date_livraison).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(delivery.statut || '')}>{getStatusLabel(delivery.statut || '')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(delivery.date_livraison, delivery.statut)}>{getPriorityLabel(delivery.date_livraison, delivery.statut)}</Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='outline' size='sm' onClick={() => setSelectedDelivery(delivery)}>
                            Détails
                          </Button>
                        </DialogTrigger>
                        {selectedDelivery && <DeliveryDetailDialog delivery={selectedDelivery} />}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredDeliveries.length === 0 && (
              <div className='text-center py-12'>
                <Truck className='mx-auto h-12 w-12 text-muted-foreground' />
                <h3 className='mt-4 text-lg font-semibold'>Aucune livraison trouvée</h3>
                <p className='text-muted-foreground'>{deliveries.length === 0 ? 'Aucune livraison en cours.' : 'Essayez de modifier vos critères de recherche.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
