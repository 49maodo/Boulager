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
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
} from "lucide-react";
import { useSimulatePaymentMutation } from "@/store/api/paymentsApi";
import { Order } from "@/types/api";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  order,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "om" | "espece">(
    "wave",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [simulatePayment, { isLoading, error, isSuccess }] =
    useSimulatePaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData: any = {
      commandeId: order.id,
      mode_paiement: paymentMethod,
    };

    if (paymentMethod === "wave") {
      paymentData.numero_wave = phoneNumber;
    } else if (paymentMethod === "om") {
      paymentData.numero_om = phoneNumber;
    }

    try {
      await simulatePayment(paymentData).unwrap();
      toast.success("Paiement effectué avec succès !");
      onPaymentSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Payment failed:", err);
      toast.error("Erreur lors du paiement");
    }
  };

  const paymentMethods = [
    { value: "wave", label: "Wave", icon: Smartphone, needsPhone: true },
    { value: "om", label: "Orange Money", icon: CreditCard, needsPhone: true },
    { value: "espece", label: "Espèces", icon: Banknote, needsPhone: false },
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
            <DialogTitle className="text-center">Paiement réussi !</DialogTitle>
            <DialogDescription className="text-center">
              Votre paiement de{" "}
              {parseFloat(order.montant_total || "0").toFixed(0)} XOF a été
              traité avec succès.
            </DialogDescription>
          </DialogHeader>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Continuer
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Paiement de la commande</DialogTitle>
          <DialogDescription>
            Commande {order.numero_commande} -{" "}
            {parseFloat(order.montant_total || "0").toFixed(0)} XOF
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {"data" in error && error.data
                  ? (error.data as any).message || "Erreur lors du paiement"
                  : "Erreur lors du paiement"}
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>Mode de paiement</Label>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.value}
                    type="button"
                    variant={
                      paymentMethod === method.value ? "default" : "outline"
                    }
                    className="h-auto p-4 flex items-center justify-start space-x-3"
                    onClick={() => setPaymentMethod(method.value as any)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{method.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Phone Number for Wave/OM */}
          {(paymentMethod === "wave" || paymentMethod === "om") && (
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Numéro {paymentMethod === "wave" ? "Wave" : "Orange Money"}
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="77 123 45 67"
                required
                minLength={9}
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Récapitulatif</h4>
            <div className="flex justify-between text-sm">
              <span>Commande {order.numero_commande}</span>
              <span>
                {parseFloat(order.montant_total || "0").toFixed(0)} XOF
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frais de service</span>
              <span>0 XOF</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total à payer</span>
              <span>
                {parseFloat(order.montant_total || "0").toFixed(0)} XOF
              </span>
            </div>
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
                isLoading || (paymentMethod !== "espece" && !phoneNumber)
              }
              className="flex-1"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Payer {parseFloat(order.montant_total || "0").toFixed(0)} XOF
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
