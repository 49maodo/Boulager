import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Truck,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CreditCard,
  Receipt,
} from "lucide-react";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/store/api/ordersApi";
import { useAppSelector } from "@/hooks/redux";
import { Order } from "@/types/api";
import { toast } from "sonner";
import { PaymentDialog } from "@/components/Checkout/PaymentDialog";
import { OrderInvoice } from "./OrderInvoice";

export function OrderList() {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useGetOrdersQuery({ per_page: 50 });

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const isAdminOrEmployee = user?.role === "admin" || user?.role === "employe";
  const isClient = user?.role === "client";

  const orders = ordersResponse?.data || [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus({
        id: orderId,
        statut: newStatus as any,
      }).unwrap();
      toast.success("Statut mis à jour avec succès !");
      setSelectedOrder(null);
      // refetch();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const OrderDetailDialog = ({ order }: { order: Order }) => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Commande {order.numero_commande}</DialogTitle>
        <DialogDescription>
          Détails de la commande passée le{" "}
          {new Date(order.created_at).toLocaleDateString("fr-FR")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Status and Payment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Statut</label>
            <div className="mt-1">
              <Badge className={getStatusColor(order.statut || "")}>
                {getStatusLabel(order.statut || "")}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Mode de paiement</label>
            <div className="mt-1">
              <Badge variant="outline">
                {getPaymentMethodLabel(order.mode_paiement)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div>
          <h4 className="font-medium mb-2">Informations client</h4>
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">
                {order.client.firstname} {order.client.name}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-4 w-4" />
              {order.client.email}
            </div>
            {order.client.telephone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                {order.client.telephone}
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              {order.adresse_livraison}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h4 className="font-medium mb-2">Détails de la commande</h4>
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Montant total:</span>
              <span className="font-bold">
                {parseFloat(order.montant_total || "0").toFixed(0)} XOF
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date de livraison:</span>
              <span>
                {new Date(order.date_livraison).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions for admin/employee */}
        {isAdminOrEmployee && (
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">Actions</label>
            <div className="flex gap-2 flex-wrap">
              {order.statut === "en_attente" && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(order.id, "confirmee")}
                  disabled={isUpdating}
                >
                  Confirmer
                </Button>
              )}
              {order.statut === "confirmee" && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(order.id, "en_preparation")}
                  disabled={isUpdating}
                >
                  Commencer la préparation
                </Button>
              )}
              {order.statut === "en_preparation" && (
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(order.id, "en_livraison")}
                  disabled={isUpdating}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Commencer la livraison
                </Button>
              )}
              {order.statut === "en_livraison" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(order.id, "livree")}
                  disabled={isUpdating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer comme livrée
                </Button>
              )}
              {!["livree", "annulee"].includes(order.statut || "") && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleUpdateStatus(order.id, "annulee")}
                  disabled={isUpdating}
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Payment and Invoice Actions */}
        <div className="border-t pt-4">
          <div className="flex gap-2 flex-wrap">
            {!order.est_paye && !isAdminOrEmployee && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPaymentOrder(order)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payer
              </Button>
            )}
            {/* {order.statut === 'livree' && ( */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInvoiceOrder(order)}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Voir la facture
            </Button>
            {/* )} */}
          </div>
        </div>
      </div>
    </DialogContent>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger les commandes. Veuillez réessayer.
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isClient ? "Mes commandes" : "Gestion des commandes"}
          </h2>
          <p className="text-muted-foreground">
            {isClient
              ? "Suivez vos commandes et leur statut"
              : "Gérez et suivez toutes les commandes"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
            <SelectItem value="confirmee">Confirmée</SelectItem>
            <SelectItem value="en_preparation">En préparation</SelectItem>
            <SelectItem value="en_livraison">En livraison</SelectItem>
            <SelectItem value="livree">Livrée</SelectItem>
            <SelectItem value="annulee">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  {!isClient && <TableHead>Client</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Livraison</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.numero_commande}
                    </TableCell>
                    {!isClient && (
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.client.firstname} {order.client.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.client.email}
                          </p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p>
                          {new Date(order.created_at).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {parseFloat(order.montant_total || "0").toFixed(0)} XOF
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.statut || "")}>
                        {getStatusLabel(order.statut || "")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentMethodLabel(order.mode_paiement)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>
                          {new Date(order.date_livraison).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          {selectedOrder && (
                            <OrderDetailDialog order={selectedOrder} />
                          )}
                        </Dialog>

                        {!order.est_paye && !isAdminOrEmployee && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaymentOrder(order)}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}

                        {/* {order.statut === 'livree' && ( */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInvoiceOrder(order)}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        {/* )} */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  Aucune commande trouvée
                </h3>
                <p className="text-muted-foreground">
                  {orders.length === 0
                    ? "Aucune commande n'a encore été passée."
                    : "Essayez de modifier vos critères de recherche."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {paymentOrder && (
        <PaymentDialog
          open={!!paymentOrder}
          onOpenChange={(open) => !open && setPaymentOrder(null)}
          order={paymentOrder}
          onPaymentSuccess={() => {
            setPaymentOrder(null);
            // refetch();
          }}
        />
      )}

      {/* Invoice Dialog */}
      {invoiceOrder && (
        <OrderInvoice
          open={!!invoiceOrder}
          onOpenChange={(open) => !open && setInvoiceOrder(null)}
          order={invoiceOrder}
        />
      )}
    </div>
  );
}
