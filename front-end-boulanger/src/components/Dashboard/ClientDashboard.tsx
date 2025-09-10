import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Star,
  Gift,
  CreditCard,
  MapPin,
  Loader2,
} from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { useGetPromotionsQuery } from "@/store/api/promotionsApi";

export function ClientDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: ordersResponse, isLoading: isLoadingOrders } =
    useGetOrdersQuery({ per_page: 50 });
  const { data: promotionsResponse, isLoading: isLoadingPromotions } =
    useGetPromotionsQuery();

  const orders = ordersResponse?.data || [];
  const promotions = promotionsResponse?.data || [];

  const activeOrders = orders.filter(
    (order) => !["livree", "annulee"].includes(order.statut || ""),
  );

  const deliveredOrders = orders.filter((order) => order.statut === "livree");

  const stats = [
    {
      title: "Commandes totales",
      value: orders.length.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Commandes actives",
      value: activeOrders.length.toString(),
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Commandes livrées",
      value: deliveredOrders.length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Points fidélité",
      value: (deliveredOrders.length * 10).toString(),
      icon: Star,
      color: "text-yellow-600",
    },
  ];

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

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "en_attente":
        return 20;
      case "confirmee":
        return 40;
      case "en_preparation":
        return 60;
      case "en_livraison":
        return 80;
      case "livree":
        return 100;
      default:
        return 0;
    }
  };

  if (isLoadingOrders || isLoadingPromotions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Bonjour, {user?.firstname} {user?.name} !
          </h2>
          <p className="text-muted-foreground">
            Bienvenue dans votre espace personnel
          </p>
        </div>
        <Button onClick={() => navigate("/")}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes en cours</CardTitle>
            <CardDescription>Suivi de vos commandes actives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucune commande en cours
              </p>
            ) : (
              activeOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Commande {order.numero_commande}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {parseFloat(order.montant_total || "0").toFixed(0)} XOF
                      </p>
                      <Badge className={getStatusColor(order.statut || "")}>
                        {getStatusLabel(order.statut || "")}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{getStatusProgress(order.statut || "")}%</span>
                    </div>
                    <Progress
                      value={getStatusProgress(order.statut || "")}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{order.adresse_livraison}</span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>
                      Livraison prévue:{" "}
                      {new Date(order.date_livraison).toLocaleDateString(
                        "fr-FR",
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>Vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {user?.telephone && (
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">
                    {user.telephone}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Membre depuis</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user?.created_at || "").toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Gérer les moyens de paiement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Modifier l'adresse de livraison
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions disponibles</CardTitle>
          <CardDescription>Profitez de nos offres spéciales</CardDescription>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune promotion disponible actuellement
            </p>
          ) : (
            <div className="space-y-4">
              {promotions.slice(0, 2).map((promotion) => (
                <div
                  key={promotion.id}
                  className="p-4 border rounded-lg bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Gift className="h-4 w-4 text-orange-600" />
                        <p className="font-medium text-orange-900 dark:text-orange-100">
                          {promotion.nom}
                        </p>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {promotion.description}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Valide jusqu'au{" "}
                        {new Date(promotion.date_fin).toLocaleDateString(
                          "fr-FR",
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    >
                      {promotion.type === "POURCENTAGE"
                        ? `${promotion.valeur_remise}%`
                        : `${promotion.valeur_remise}€`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
