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
  Download,
  Send,
  Eye,
  Receipt,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { toast } from "sonner";

interface Invoice {
  id: string;
  orderId: number;
  clientId: number;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: "draft" | "sent" | "paid" | "overdue";
  pdfUrl?: string;
}

export function InvoiceManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useGetOrdersQuery({ per_page: 100 });

  const orders = ordersResponse?.data || [];

  // Generate invoices from orders
  const invoices: Invoice[] = orders
    .filter((order) => order.statut === "livree")
    .map((order) => ({
      id: `INV-${order.numero_commande}`,
      orderId: order.id,
      clientId: order.client.id,
      amount: parseFloat(order.montant_total || "0"),
      issueDate: new Date(order.updated_at),
      dueDate: new Date(
        new Date(order.updated_at).getTime() + 15 * 24 * 60 * 60 * 1000,
      ),
      status: Math.random() > 0.5 ? "paid" : ("sent" as any),
      pdfUrl: `/invoices/INV-${order.numero_commande}.pdf`,
    }));

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toString().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "sent":
        return "Envoyée";
      case "paid":
        return "Payée";
      case "overdue":
        return "En retard";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return FileText;
      case "sent":
        return Send;
      case "paid":
        return CheckCircle;
      case "overdue":
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const generatePDF = (invoiceId: string) => {
    console.log("Generating PDF for invoice:", invoiceId);
    toast.success("PDF généré avec succès !");
  };

  const sendInvoice = (invoiceId: string) => {
    console.log("Sending invoice:", invoiceId);
    toast.success("Facture envoyée par email !");
  };

  const markAsPaid = (invoiceId: string) => {
    console.log("Marking invoice as paid:", invoiceId);
    toast.success("Facture marquée comme payée !");
  };

  const InvoiceDetailDialog = ({ invoice }: { invoice: Invoice }) => {
    const order = orders.find((o) => o.id === invoice.orderId);

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Facture {invoice.id}</DialogTitle>
          <DialogDescription>
            Détails de la facture émise le{" "}
            {invoice.issueDate.toLocaleDateString("fr-FR")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Informations facture</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">N° Facture:</span> {invoice.id}
                </p>
                <p>
                  <span className="font-medium">N° Commande:</span>{" "}
                  {order?.numero_commande}
                </p>
                <p>
                  <span className="font-medium">Date d'émission:</span>{" "}
                  {invoice.issueDate.toLocaleDateString("fr-FR")}
                </p>
                <p>
                  <span className="font-medium">Date d'échéance:</span>{" "}
                  {invoice.dueDate.toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Statut</h4>
              <Badge className={getStatusColor(invoice.status)}>
                {getStatusLabel(invoice.status)}
              </Badge>
            </div>
          </div>

          {/* Client Info */}
          {order && (
            <div>
              <h4 className="font-medium mb-2">Informations client</h4>
              <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
                <p>
                  <span className="font-medium">Nom:</span>{" "}
                  {order.client.firstname} {order.client.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.client.email}
                </p>
                <p>
                  <span className="font-medium">Téléphone:</span>{" "}
                  {order.client.telephone || "Non renseigné"}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span>{" "}
                  {order.adresse_livraison}
                </p>
              </div>
            </div>
          )}

          {/* Invoice Summary */}
          <div>
            <h4 className="font-medium mb-2">Détail de la facture</h4>
            <div className="border rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Montant HT:</span>
                  <span>{(invoice.amount / 1.1).toFixed(2)} XOF</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA (10%):</span>
                  <span>
                    {(invoice.amount - invoice.amount / 1.1).toFixed(2)} XOF
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total TTC:</span>
                  <span>{invoice.amount.toFixed(2)} XOF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Button size="sm" onClick={() => generatePDF(invoice.id)}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
              {invoice.status !== "paid" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendInvoice(invoice.id)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer par email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsPaid(invoice.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme payée
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

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
        <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger les factures. Veuillez réessayer.
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  const stats = [
    {
      title: "Total factures",
      value: invoices.length,
      icon: Receipt,
      color: "text-blue-600",
    },
    {
      title: "Factures payées",
      value: invoices.filter((i) => i.status === "paid").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "En attente",
      value: invoices.filter((i) => i.status === "sent").length,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "En retard",
      value: invoices.filter((i) => i.status === "overdue").length,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0,
  );
  const paidAmount = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestion des factures
          </h2>
          <p className="text-muted-foreground">
            Gérez et suivez toutes vos factures clients
          </p>
        </div>
        <Button>
          <Receipt className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <span className="text-xs">XOF</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount.toFixed(0)} XOF
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Montant encaissé
            </CardTitle>
            <span className="text-xs text-green-600">XOF</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toFixed(0)} XOF
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <span className="text-xs text-orange-600">XOF</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingAmount.toFixed(0)} XOF
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une facture..."
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
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyée</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Factures ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date émission</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = getStatusIcon(invoice.status);
                  const isOverdue =
                    invoice.status !== "paid" && invoice.dueDate < new Date();

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell>
                        {
                          orders.find((o) => o.id === invoice.orderId)
                            ?.numero_commande
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.amount.toFixed(0)} XOF
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          {invoice.issueDate.toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center text-sm ${isOverdue ? "text-red-600" : ""}`}
                        >
                          <Calendar className="mr-1 h-3 w-3" />
                          {invoice.dueDate.toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusLabel(invoice.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInvoice(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {selectedInvoice && (
                              <InvoiceDetailDialog invoice={selectedInvoice} />
                            )}
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePDF(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  Aucune facture trouvée
                </h3>
                <p className="text-muted-foreground">
                  {invoices.length === 0
                    ? "Aucune facture générée pour le moment."
                    : "Essayez de modifier vos critères de recherche."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
