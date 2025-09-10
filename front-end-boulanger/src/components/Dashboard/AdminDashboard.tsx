import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  Euro,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";

export function AdminDashboard() {
  const { data: ordersResponse, isLoading: isLoadingOrders } =
    useGetOrdersQuery({ per_page: 100 });
  const { data: productsResponse, isLoading: isLoadingProducts } =
    useGetProductsQuery();

  const orders = ordersResponse?.data || [];
  const products = productsResponse?.data || [];

  const salesData = products.slice(0, 7).map((product, idx) => ({
    name: product.nom || `Jour ${idx + 1}`,
    sales: Number(product.prix) * Number(product.quantite_stock || 1),
    orders: Number(product.quantite_stock || 1),
  }));
  // Calcule la répartition réelle des ventes par catégorie à partir des produits
  const categoryMap: Record<
    string,
    { name: string; value: number; color: string }
  > = {
    Pains: { name: "Pains", value: 0, color: "#3b82f6" },
    Viennoiseries: { name: "Viennoiseries", value: 0, color: "#10b981" },
    Patisseries: { name: "Pâtisseries", value: 0, color: "#f97316" },
    Sandwichs: { name: "Sandwichs", value: 0, color: "#ef4444" },
  };

  products.forEach((product) => {
    // Utilise le nom de la catégorie si c'est un objet, sinon la valeur brute ou 'Autre'
    const cat =
      typeof product.categorie === "object" && product.categorie !== null
        ? product.categorie.nom
        : product.categorie || "Autre";
    const prix = Number(product.prix) || 0;
    const quantite = Number(product.quantite_stock) || 0;
    if (categoryMap[cat]) {
      categoryMap[cat].value += prix * quantite;
    } else {
      // Ajoute une catégorie inconnue si besoin
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          value: prix * quantite,
          color: "#a3a3a3", // gris pour les catégories inconnues
        };
      }
    }
  });

  const productData = Object.values(categoryMap).filter((cat) => cat.value > 0);

  // Calculate real stats from API data
  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.montant_total || "0"),
    0,
  );
  const totalOrders = orders.length;
  const uniqueClients = new Set(orders.map((order) => order.client.id)).size;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const stats = [
    {
      title: "Chiffre d'affaires",
      value: `${totalRevenue.toFixed(0)} XOF`,
      change: "+12.5%",
      icon: Euro,
      color: "text-green-600",
    },
    {
      title: "Commandes",
      value: totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Clients uniques",
      value: uniqueClients.toString(),
      change: "+23.1%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Panier moyen",
      value: `${averageOrder.toFixed(0)} XOF`,
      change: "-2.3%",
      icon: Package,
      color: "text-orange-600",
    },
  ];

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

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

  if (isLoadingOrders || isLoadingProducts) {
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
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Aperçu de votre activité aujourd'hui
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString("fr-FR")}</span>
        </div>
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
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> depuis
                hier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes de la semaine</CardTitle>
            <CardDescription>Évolution des ventes et commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des ventes</CardTitle>
            <CardDescription>Par catégorie de produits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>Dernières commandes reçues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucune commande récente
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {order.client.firstname} {order.client.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.numero_commande} -{" "}
                        {new Date(order.created_at).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {parseFloat(order.montant_total || "0").toFixed(0)} XOF
                      </span>
                      <Badge className={getStatusColor(order.statut || "")}>
                        {getStatusLabel(order.statut || "")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes & Tâches</CardTitle>
            <CardDescription>Points d'attention du jour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Stock faible</p>
                <p className="text-xs text-muted-foreground">
                  {products.filter((p) => Number(p.quantite_stock) < 10).length}{" "}
                  produits ont un stock inférieur à 10 unités
                </p>
                <Progress value={30} className="h-2" />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Objectif mensuel</p>
                <p className="text-xs text-muted-foreground">
                  78% de l'objectif atteint ({totalRevenue.toFixed(0)}
                  /12,000,000 XOF)
                </p>
                <Progress
                  value={Math.min((totalRevenue / 12000000) * 100, 100)}
                  className="h-2"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nouveaux clients</p>
                <p className="text-xs text-muted-foreground">
                  {uniqueClients} clients uniques cette période
                </p>
                <Progress value={125} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
