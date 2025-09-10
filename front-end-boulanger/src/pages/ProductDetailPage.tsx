import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Star,
  Heart,
  Share2,
  AlertTriangle,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { useGetProductQuery } from "@/store/api/productsApi";
import { useAddToCartMutation } from "@/store/api/cartApi";
import { useAppSelector } from "@/hooks/redux";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    data: productResponse,
    isLoading,
    error,
  } = useGetProductQuery(Number(id), {
    skip: !id,
  });

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const product = productResponse?.data;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    if (!product) return;

    try {
      await addToCart({
        produit_id: product.id,
        quantite: quantity,
      }).unwrap();

      toast.success(`${product.nom} ajouté au panier !`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Erreur lors de l'ajout au panier");
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Épuisé",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        available: false,
      };
    if (stock < 10)
      return {
        label: "Stock faible",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        available: true,
      };
    return {
      label: "En stock",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      available: true,
    };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Produit non trouvé</h3>
          <p className="text-muted-foreground">
            Le produit que vous recherchez n'existe pas ou n'est plus
            disponible.
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(Number(product.quantite_stock));
  const maxQuantity = Math.min(
    Number(product.quantite_stock),
    Number(product.quantite_stock),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="p-0 h-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au catalogue
        </Button>
        <span>/</span>
        <span>{product.categorie?.nom || "Produits"}</span>
        <span>/</span>
        <span className="text-foreground">{product.nom}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
            <img
              src={
                `${import.meta.env.VITE_API_URL}` + product.image ||
                "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg"
              }
              alt={product.nom}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>

          {/* Additional Images Placeholder */}
          {/* <div className='grid grid-cols-4 gap-2'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='aspect-square rounded-lg border bg-muted/50 flex items-center justify-center'>
                <Package className='h-6 w-6 text-muted-foreground' />
              </div>
            ))}
          </div> */}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{product.nom}</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                  />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              {/* <div className='text-3xl font-bold text-primary'>{parseFloat(String(product.prix)).toFixed(0)} XOF</div> */}
              <div className="">
                {product.prix_promotion < product.prix ? (
                  <>
                    <p className="text-lg text-muted-foreground line-through">
                      {parseFloat(String(product.prix)).toFixed(0)} XOF
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {parseFloat(String(product.prix_promotion)).toFixed(0)}{" "}
                      XOF
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {parseFloat(String(product.prix)).toFixed(0)} XOF
                  </p>
                )}
              </div>
              <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
              {product.categorie && (
                <Badge variant="outline">{product.categorie.nom}</Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                (4.0) • 24 avis
              </span>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Info */}
          <div className="flex items-center space-x-2 text-sm">
            <Package className="h-4 w-4" />
            <span>Stock disponible: {product.quantite_stock} unités</span>
            {Number(product.quantite_stock) < 10 &&
              Number(product.quantite_stock) > 0 && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
          </div>

          {/* Quantity Selector */}
          {stockStatus.available && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantité
                </label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(maxQuantity, quantity + 1))
                    }
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: {maxQuantity} unités
                </p>
              </div>

              {/* Total Price */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {(
                      parseFloat(String(product.prix_promotion)) * quantity
                    ).toFixed(0)}{" "}
                    XOF
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !stockStatus.available}
              >
                {isAddingToCart ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                Ajouter au panier
              </Button>

              {!isAuthenticated && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Vous devez être connecté pour ajouter des produits au
                    panier.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!stockStatus.available && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ce produit n'est actuellement pas disponible.
              </AlertDescription>
            </Alert>
          )}

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informations produit</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Catégorie:</span>
                <p className="text-muted-foreground">
                  {product.categorie?.nom || "Non définie"}
                </p>
              </div>
              <div>
                <span className="font-medium">Disponibilité:</span>
                <p className="text-muted-foreground">
                  {product.actif ? "Disponible" : "Non disponible"}
                </p>
              </div>
              <div>
                <span className="font-medium">Allergènes:</span>
                <p className="text-muted-foreground">Gluten, Œufs</p>
              </div>
              <div>
                <span className="font-medium">Conservation:</span>
                <p className="text-muted-foreground">2-3 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
