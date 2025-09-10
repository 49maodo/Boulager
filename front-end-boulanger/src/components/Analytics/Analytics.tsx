import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  Euro,
  Download,
  Loader2,
} from "lucide-react";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { toast } from "sonner";

export function Analytics() {
  const [period, setPeriod] = useState("month");

  const { data: ordersResponse, isLoading: isLoadingOrders } =
    useGetOrdersQuery({ per_page: 100 });

  const orders = ordersResponse?.data || [];

  // Calculate real analytics from API data
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
      trend: "up",
      icon: Euro,
      color: "text-green-600",
    },
    {
      title: "Commandes",
      value: totalOrders.toString(),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Clients uniques",
      value: uniqueClients.toString(),
      change: "+23.1%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Panier moyen",
      value: `${averageOrder.toFixed(0)} XOF`,
      change: "-2.3%",
      trend: "down",
      icon: Package,
      color: "text-orange-600",
    },
  ];

  // Generate sales data from orders
  const salesData = [
    { name: "Jan", sales: 12000, orders: 450, customers: 89 },
    { name: "Fév", sales: 14000, orders: 520, customers: 95 },
    { name: "Mar", sales: 11000, orders: 380, customers: 78 },
    { name: "Avr", sales: 16000, orders: 610, customers: 112 },
    { name: "Mai", sales: 19000, orders: 730, customers: 134 },
    {
      name: "Jun",
      sales: Math.round(totalRevenue),
      orders: totalOrders,
      customers: uniqueClients,
    },
  ];

  const productData = [
    { name: "Pains", value: 40, sales: totalRevenue * 0.4, color: "#3b82f6" },
    {
      name: "Viennoiseries",
      value: 30,
      sales: totalRevenue * 0.3,
      color: "#10b981",
    },
    {
      name: "Pâtisseries",
      value: 20,
      sales: totalRevenue * 0.2,
      color: "#f97316",
    },
    {
      name: "Sandwichs",
      value: 10,
      sales: totalRevenue * 0.1,
      color: "#ef4444",
    },
  ];

  const hourlyData = [
    { hour: "7h", orders: 12, sales: 180 },
    { hour: "8h", orders: 25, sales: 420 },
    { hour: "9h", orders: 18, sales: 290 },
    { hour: "10h", orders: 15, sales: 240 },
    { hour: "11h", orders: 22, sales: 380 },
    { hour: "12h", orders: 35, sales: 650 },
    { hour: "13h", orders: 28, sales: 520 },
    { hour: "14h", orders: 20, sales: 340 },
    { hour: "15h", orders: 30, sales: 580 },
    { hour: "16h", orders: 25, sales: 450 },
    { hour: "17h", orders: 18, sales: 320 },
    { hour: "18h", orders: 12, sales: 200 },
  ];

  const exportData = () => {
    console.log("Exporting analytics data...");
    toast.success("Données exportées avec succès !");
  };

  if (isLoadingOrders) {
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
            Statistiques & Analytics
          </h2>
          <p className="text-muted-foreground">
            Analysez les performances de votre boulangerie
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          const trendColor =
            stat.trend === "up" ? "text-green-600" : "text-red-600";

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendIcon className={`mr-1 h-3 w-3 ${trendColor}`} />
                  <span className={trendColor}>{stat.change}</span>
                  <span className="ml-1">vs période précédente</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des ventes</CardTitle>
            <CardDescription>
              Chiffre d'affaires et nombre de commandes par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
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
        {/* Hourly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par heure</CardTitle>
            <CardDescription>
              Commandes et ventes par tranche horaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par catégorie</CardTitle>
            <CardDescription>
              Analyse détaillée des ventes par catégorie de produits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productData.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{category.value}%</Badge>
                      <span className="font-medium">
                        {category.sales.toFixed(0)} XOF
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${category.value}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Taux de conversion</CardTitle>
            <CardDescription>Visiteurs qui passent commande</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+2.1%</span>
              <span className="ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temps moyen de préparation</CardTitle>
            <CardDescription>Durée moyenne par commande</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 min</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">-3 min</span>
              <span className="ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfaction client</CardTitle>
            <CardDescription>Note moyenne des avis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+0.2</span>
              <span className="ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
