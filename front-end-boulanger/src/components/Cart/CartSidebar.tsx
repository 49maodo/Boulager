import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { setCartOpen } from "@/store/slices/cartSlice";
import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
} from "@/store/api/cartApi";
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CartSidebarProps {
  onCheckout: () => void;
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Utiliser l'API pour récupérer le panier depuis le serveur
  const {
    data: cartResponse,
    isLoading,
    error,
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated, // Ne pas charger si pas connecté
  });

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();
  const [addToCart, { isLoading: isUpdating }] = useAddToCartMutation();

  const items = cartResponse?.data || [];
  const total = items.reduce((sum, item) => {
    const price = item.produit ? parseFloat(item.produit.prix.toString()) : 0;
    return sum + price * item.quantite;
  }, 0);

  const handleRemoveItem = async (produitId: number) => {
    try {
      await removeFromCart(produitId.toString()).unwrap();
      toast.success("Produit retiré du panier");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleUpdateQuantity = async (
    produitId: number,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(produitId);
      return;
    }

    try {
      // Utiliser addToCart pour mettre à jour la quantité
      await addToCart({
        produit_id: produitId,
        quantite: newQuantity,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantite, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => dispatch(setCartOpen(open))}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Mon Panier ({items.length})
          </SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Votre panier est vide"
              : `${totalItems} article${totalItems > 1 ? "s" : ""} dans votre panier`}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-muted-foreground">
              Impossible de charger votre panier
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Votre panier est vide
            </h3>
            <p className="text-muted-foreground mb-4">
              Découvrez nos délicieux produits artisanaux
            </p>
            <Button onClick={() => dispatch(setCartOpen(false))}>
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.produit_id}
                    className="flex items-center space-x-4"
                  >
                    {item.produit?.image && (
                      <img
                        src={item.produit.image}
                        alt={item.produit.nom}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}

                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium leading-none">
                        {item.produit?.nom || `Produit #${item.produit_id}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.produit?.prix} XOF l'unité
                      </p>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdateQuantity(
                              item.produit_id,
                              item.quantite - 1,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <Badge variant="secondary" className="px-3">
                          {item.quantite}
                        </Badge>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isUpdating}
                          onClick={() =>
                            handleUpdateQuantity(
                              item.produit_id,
                              item.quantite + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          disabled={isRemoving}
                          onClick={() => handleRemoveItem(item.produit_id)}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
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
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t py-4 h-40 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {total.toFixed(0)} XOF
                </span>
              </div>

              <Separator />

              {isAuthenticated ? (
                <Button onClick={onCheckout} className="w-full" size="lg">
                  Passer commande
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    Connectez-vous pour passer commande
                  </p>
                  <Button
                    onClick={() => {
                      dispatch(setCartOpen(false));
                      // This will be handled by a parent component
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Se connecter
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
