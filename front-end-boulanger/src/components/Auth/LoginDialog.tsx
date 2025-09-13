import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShoppingBag } from "lucide-react";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/hooks/redux";
import { setCredentials } from "@/store/slices/authSlice";
import { User } from "@/types/api";
import { useGetCartQuery } from "@/store/api/cartApi.ts";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick: () => void;
}

export function LoginDialog({
  open,
  onOpenChange,
  onRegisterClick,
}: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const { refetch } = useGetCartQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();

      // Parse user data from string response
      const userData = result.user as unknown as User;

      dispatch(
        setCredentials({
          user: userData,
          token: result.token,
        }),
      );

      onOpenChange(false);
      setEmail("");
      setPassword("");
      await refetch(); // Refetch cart data after login
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const switchToRegister = () => {
    onOpenChange(false);
    onRegisterClick();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-7 w-7" />
            </div>
          </div>
          <DialogTitle className="text-center">Connexion</DialogTitle>
          <DialogDescription className="text-center">
            Connectez-vous pour accéder à votre compte
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {"data" in error && error.data
                  ? (error.data as any).message || "Erreur de connexion"
                  : "Erreur de connexion"}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={switchToRegister}
              className="text-sm"
            >
              Pas encore de compte ? S'inscrire
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
