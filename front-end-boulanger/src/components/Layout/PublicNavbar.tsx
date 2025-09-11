import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { toggleCart } from "@/store/slices/cartSlice";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  User,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PublicNavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLoginRequired: () => void;
}

export function PublicNavbar({
  onLoginClick,
  onRegisterClick,
  onLoginRequired,
}: PublicNavbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { setTheme } = useTheme();

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantite, 0);

  const handleCartClick = () => {
    if (!isAuthenticated && cartItemsCount === 0) {
      onLoginRequired();
      return;
    }
    dispatch(toggleCart());
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold">Boulangerie</h1>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Changer le thème</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Clair</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Sombre</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Système</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs justify-center"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* Auth Buttons */}
            {!isAuthenticated && (
              <>
                <Button variant="ghost" onClick={onLoginClick}>
                  <User className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
                <Button onClick={onRegisterClick}>S'inscrire</Button>
              </>
            )}

            {isAuthenticated && (
              <Button onClick={() => navigate("/app/dashboard")}>
                Mon Espace
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
