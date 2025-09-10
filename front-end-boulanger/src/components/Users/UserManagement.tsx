import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Users, Mail, Phone, Calendar, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateUserMutation, useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation } from '@/store/api/usersApi';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { User } from '@/types/api';

export function UserManagement() {
  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    firstname: '',
    email: '',
    address: '',
    telephone: '',
    role: 'client',
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const users = usersData?.data || [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'employe':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'client':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'employe':
        return 'Employé';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };
  const resetForm = () => {
    setNewUser({
      name: '',
      firstname: '',
      email: '',
      role: 'client',
      telephone: '',
      address: '',
    });
  };
  const handleOpenCreate = () => {
    setEditingUser(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        ...newUser,
        id: null,
        address: newUser.address ?? null,
        telephone: newUser.telephone ?? null,
        role: newUser.role ?? null,
      }).unwrap();
      handleCloseDialog();
      toast.success('Utilisateur créé avec succès !');
    } catch (error) {
      console.error('Failed to create promotion:', error);
      toast.error("Erreur lors de la création de l'utilisateur");
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      firstname: user.firstname,
      email: user.email,
      role: user.role,
      telephone: user.telephone || '',
      address: user.address || '',
    });
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUser) return;
      await updateUser({ id: editingUser.id.toString(), user: newUser }).unwrap();
      handleCloseDialog();
      toast.success('Utilisateur modifié avec succès !');
    } catch (error) {
      console.error('Failed to update promotion:', error);
      toast.error("Erreur lors de la modification de l'utilisateur");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId).unwrap();
      toast.success('Utilisateur supprimé avec succès !');
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
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
        <p className='text-muted-foreground'>Impossible de charger les utilisateurs. Veuillez réessayer.</p>
        <Button onClick={() => refetch()} className='mt-4'>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Gestion des utilisateurs</h2>
          <p className='text-muted-foreground'>Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Modifier la promotion' : 'Nouvelle promotion'}</DialogTitle>
              <DialogDescription>{editingUser ? 'Modifiez les détails de la promotion' : 'Créez une nouvelle promotion pour vos clients'}</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstname'>Prénom</Label>
                  <Input id='firstname' value={newUser.firstname} onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} placeholder='Prénom' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Nom</Label>
                  <Input id='name' value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder='Nom' required />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder='email@example.fr' required />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='role'>Rôle</Label>
                  <Select value={newUser.role} defaultValue='client' onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='client'>Client</SelectItem>
                      <SelectItem value='employe'>Employé</SelectItem>
                      <SelectItem value='admin'>Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='telephone'>Téléphone</Label>
                <Input id='telephone' value={newUser.telephone} onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })} placeholder='01 23 45 67 89' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address'>Adresse</Label>
                <Input id='address' value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} placeholder='Adresse' required />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button onClick={editingUser ? handleUpdateUser : handleCreateUser} disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {editingUser ? 'Modifier' : 'Créer'}
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
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total utilisateurs</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Clients</CardTitle>
            <Users className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{users.filter((u) => u.role === 'client').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Employés</CardTitle>
            <Users className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{users.filter((u) => u.role === 'employe' || u.role === 'admin').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Rechercher un utilisateur...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-8' />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <SelectValue placeholder='Rôle' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tous les rôles</SelectItem>
            <SelectItem value='admin'>Administrateur</SelectItem>
            <SelectItem value='employe'>Employé</SelectItem>
            <SelectItem value='client'>Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className='font-medium'>
                          {user.firstname} {user.name}
                        </p>
                        <p className='text-sm text-muted-foreground flex items-center'>
                          <Mail className='mr-1 h-3 w-3' />
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.telephone && (
                        <p className='text-sm flex items-center'>
                          <Phone className='mr-1 h-3 w-3' />
                          {user.telephone}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className='text-sm flex items-center'>
                        <Calendar className='mr-1 h-3 w-3' />
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' size='sm' onClick={() => handleOpenEdit(user)}>
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
                              <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                              <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer l'utilisateur "{user.email}" ? Cette action est réversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className='bg-red-600 hover:bg-red-700'>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
