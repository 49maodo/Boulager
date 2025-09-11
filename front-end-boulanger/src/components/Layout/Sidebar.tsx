import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/hooks/redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageCircle,
  Receipt,
  Tag,
  BarChart3,
  Truck,
  Store,
} from "lucide-react";

export function Sidebar() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      {
        id: "dashboard",
        label: "Tableau de bord",
        icon: LayoutDashboard,
        path: "/app/dashboard",
      },
      {
        id: "products",
        label: "Produits",
        icon: Package,
        path: "/app/products",
      },
      {
        id: "orders",
        label: "Commandes",
        icon: ShoppingCart,
        path: "/app/orders",
      },
      {
        id: "deliveries",
        label: "Livraisons",
        icon: Truck,
        path: "/app/deliveries",
      },
      {
        id: "promotions",
        label: "Promotions",
        icon: Tag,
        path: "/app/promotions",
      },
      {
        id: "invoices",
        label: "Factures",
        icon: Receipt,
        path: "/app/invoices",
      },
      {
        id: "analytics",
        label: "Statistiques",
        icon: BarChart3,
        path: "/app/analytics",
      },
    ];

    if (user?.role === "admin") {
      return [
        ...commonItems,
        { id: "users", label: "Utilisateurs", icon: Users, path: "/app/users" },
      ];
    }

    if (user?.role === "employe") {
      return [...commonItems];
    }

    // Client menu
    return [
      {
        id: "dashboard",
        label: "Mon compte",
        icon: LayoutDashboard,
        path: "/app/dashboard",
      },
      { id: "catalog", label: "Catalogue", icon: Store, path: "/" },
      {
        id: "orders",
        label: "Mes commandes",
        icon: ShoppingCart,
        path: "/app/orders",
      },
      {
        id: "support",
        label: "Support",
        icon: MessageCircle,
        path: "/app/support",
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="hidden border-r bg-muted/40 w-64 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex-1">
          <ScrollArea className="h-full px-3 py-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={
                    location.pathname === item.path ? "secondary" : "ghost"
                  }
                  className={cn(
                    "w-full justify-start hover:underline hover:bg-primary/90",
                    location.pathname === item.path && "bg-primary",
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
