import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, ShoppingBag } from "lucide-react";
import { Order } from "@/types/api";

interface OrderInvoiceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export function OrderInvoice({ open, onOpenChange, order }: OrderInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_attente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "confirmee":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "en_preparation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "en_livraison":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "livree":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "annulee":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "confirmee":
        return "Confirmée";
      case "en_preparation":
        return "En préparation";
      case "en_livraison":
        return "En livraison";
      case "livree":
        return "Livrée";
      case "annulee":
        return "Annulée";
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    switch (method) {
      case "espece":
        return "Espèces";
      case "wave":
        return "Wave";
      case "om":
        return "Orange Money";
      default:
        return "Non défini";
    }
  };

  const montantHT = parseFloat(order.montant_total || "0") / 1.18; // TVA 18%
  const montantTVA = parseFloat(order.montant_total || "0") - montantHT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Facture - Commande {order.numero_commande}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className="flex h-8 w-8 items-center justify-center 
                rounded-lg bg-primary text-primary-foreground"
                >
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold">Boulangerie</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Dakar</p>
                <p>75001 Dakar, Sénégal</p>
                <p>Tél: 77 123 45 67</p>
                <p>Email: contact@boulangerie.sn</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-2xl font-bold">FACTURE</h2>
              <p className="text-sm text-muted-foreground">
                N° {order.numero_commande}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(order.created_at).toLocaleDateString("fr-FR")}
              </p>
              <Badge className={getStatusColor(order.statut || "")}>
                {getStatusLabel(order.statut || "")}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Facturé à:</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {order.client.firstname} {order.client.name}
                </p>
                <p>{order.client.email}</p>
                {order.client.telephone && <p>{order.client.telephone}</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Livré à:</h3>
              <div className="space-y-1 text-sm">
                <p>{order.adresse_livraison}</p>
                <p>
                  Date de livraison:{" "}
                  {new Date(order.date_livraison).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Détails de la commande</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Produit</th>
                    <th className="text-center p-3 font-medium">Qté</th>
                    <th className="text-right p-3 font-medium">
                      Prix unitaire
                    </th>
                    <th className="text-right p-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.articles && order.articles.length > 0 ? (
                    order.articles.map((article) => (
                      <tr key={article.id} className="border-t">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{article.nom}</p>
                            {article.description && (
                              <p className="text-sm text-muted-foreground">
                                {article.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="text-center p-3">{article.quantite}</td>
                        <td className="text-right p-3">
                          {parseFloat(article.prix_unitaire).toFixed(0)} XOF
                        </td>
                        <td className="text-right p-3 font-medium">
                          {parseFloat(article.sous_total).toFixed(0)} XOF
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center p-4 text-muted-foreground"
                      >
                        Aucun article dans cette commande
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total HT:</span>
                  <span>{montantHT.toFixed(0)} XOF</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (18%):</span>
                  <span>{montantTVA.toFixed(0)} XOF</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total TTC:</span>
                  <span>
                    {parseFloat(order.montant_total || "0").toFixed(0)} XOF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Informations de paiement</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Mode de paiement:</span>
                <p>{getPaymentMethodLabel(order.mode_paiement)}</p>
              </div>
              <div>
                <span className="font-medium">Statut:</span>
                <p>
                  <Badge
                    className={
                      order.est_paye
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }
                  >
                    {order.est_paye ? "Payé" : "Non payé"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <p>Merci pour votre confiance !</p>
            <p>
              Boulangerie Artisanale - SIRET: 123 456 789 00012 - TVA:
              FR12345678901
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
