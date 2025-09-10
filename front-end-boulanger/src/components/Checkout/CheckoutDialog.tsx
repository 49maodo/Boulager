import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Calendar as CalendarIcon,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { useCreateOrderMutation } from "@/store/api/ordersApi";
import { useClearCartMutation } from "@/store/api/cartApi";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { clearLocalCart, setCartOpen } from "@/store/slices/cartSlice";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, total } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [createOrder, { isLoading, error, isSuccess }] =
    useCreateOrderMutation();
  const [clearCartApi] = useClearCartMutation();

  const [formData, setFormData] = useState({
    adresse_livraison: "",
    date_livraison: new Date(),
    mode_paiement: "" as "espece" | "wave" | "om" | "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mode_paiement) {
      toast.error("Veuillez sélectionner un mode de paiement");
      return;
    }

    try {
      await createOrder({
        adresse_livraison: formData.adresse_livraison,
        date_livraison: formData.date_livraison.toISOString(),
        mode_paiement: formData.mode_paiement,
      }).unwrap();

      // Clear cart
      await clearCartApi().unwrap();
      dispatch(clearLocalCart());
      dispatch(setCartOpen(false));

      toast.success("Commande passée avec succès !");
      onOpenChange(false);

      // Reset form
      setFormData({
        adresse_livraison: "",
        date_livraison: new Date(),
        mode_paiement: "",
        notes: "",
      });
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error("Erreur lors de la création de la commande");
    }
  };

  const paymentMethods = [
    { value: "espece", label: "Espèces", icon: Banknote },
    { value: "wave", label: "Wave", icon: Smartphone },
    { value: "om", label: "Orange Money", icon: CreditCard },
  ];

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="h-7 w-7" />
              </div>
            </div>
            <DialogTitle className="text-center">
              Commande confirmée !
            </DialogTitle>
            <DialogDescription className="text-center">
              Votre commande a été enregistrée avec succès. Vous recevrez une
              confirmation par email.
            </DialogDescription>
          </DialogHeader>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Continuer mes achats
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finaliser ma commande</DialogTitle>
          <DialogDescription>
            Vérifiez votre commande et renseignez les informations de livraison
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Récapitulatif de la commande</h3>
            <div className="border rounded-lg p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.produit_id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.produit?.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantite} x {item.produit?.prix} XOF
                    </p>
                  </div>
                  <p className="font-medium">
                    {item.produit
                      ? (
                          parseFloat(item.produit.prix.toString()) *
                          item.quantite
                        ).toFixed(0)
                      : "0"}{" "}
                    XOF
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{total.toFixed(0)} XOF</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {"data" in error && error.data
                    ? (error.data as any).message ||
                      "Erreur lors de la commande"
                    : "Erreur lors de la commande"}
                </AlertDescription>
              </Alert>
            )}

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold mb-3">Informations client</h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">
                  {user?.firstname} {user?.name}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.telephone && (
                  <p className="text-sm text-muted-foreground">
                    {user.telephone}
                  </p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <Label htmlFor="adresse_livraison">Adresse de livraison *</Label>
              <Textarea
                id="adresse_livraison"
                value={formData.adresse_livraison}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adresse_livraison: e.target.value,
                  })
                }
                placeholder="Adresse complète de livraison..."
                required
                rows={3}
              />
            </div>

            {/* Delivery Date */}
            <div className="space-y-2">
              <Label>Date de livraison souhaitée *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date_livraison, "PPP", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date_livraison}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, date_livraison: date })
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Mode de paiement *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.value}
                      type="button"
                      variant={
                        formData.mode_paiement === method.value
                          ? "default"
                          : "outline"
                      }
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          mode_paiement: method.value as any,
                        })
                      }
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{method.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Instructions spéciales (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Instructions particulières pour la livraison..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.adresse_livraison ||
                  !formData.mode_paiement
                }
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer la commande
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
