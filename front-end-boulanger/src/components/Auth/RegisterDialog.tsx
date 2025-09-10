import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingBag, CheckCircle } from 'lucide-react';
import { useRegisterMutation } from '@/store/api/authApi';

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick: () => void;
}

export function RegisterDialog({ open, onOpenChange, onLoginClick }: RegisterDialogProps) {
  const [formData, setFormData] = useState({
    firstname: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await register(formData).unwrap();
      // Success handled by isSuccess state
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const switchToLogin = () => {
    onOpenChange(false);
    onLoginClick();
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    });
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="h-7 w-7" />
              </div>
            </div>
            <DialogTitle className="text-center">Inscription réussie !</DialogTitle>
            <DialogDescription className="text-center">
              Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.
            </DialogDescription>
          </DialogHeader>

          <Button onClick={switchToLogin} className="w-full">
            Se connecter
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-7 w-7" />
            </div>
          </div>
          <DialogTitle className="text-center">Créer un compte</DialogTitle>
          <DialogDescription className="text-center">
            Rejoignez notre boulangerie pour commander en ligne
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {'data' in error && error.data ? 
                  (error.data as any).message || 'Erreur lors de l\'inscription' :
                  'Erreur lors de l\'inscription'
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstname">Prénom</Label>
              <Input
                id="firstname"
                value={formData.firstname}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                placeholder="Votre prénom"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="votre@email.fr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              required
              minLength={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirmer le mot de passe</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              placeholder="••••••••"
              required
              minLength={5}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte
          </Button>

          <div className="text-center">
            <Button 
              type="button" 
              variant="link" 
              onClick={switchToLogin}
              className="text-sm"
            >
              Déjà un compte ? Se connecter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}