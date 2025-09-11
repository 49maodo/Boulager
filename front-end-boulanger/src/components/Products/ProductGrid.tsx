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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Loader2,
  FolderPlus,
} from "lucide-react";
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useDeleteProductMutation,
  useDeleteCategoryMutation,
} from "@/store/api/productsApi";
import { useAppSelector } from "@/hooks/redux";
import { Product, Category } from "@/types/api";
import { ProductForm } from "./ProductForm";
import { CategoryForm } from "./CategoryForm";
import { toast } from "sonner";

export function ProductGrid() {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useGetProductsQuery();

  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();

  const [deleteProduct] = useDeleteProductMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const isAdminOrEmployee = user?.role === "admin" || user?.role === "employe";
  const products = productsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (product.categorie && product.categorie.nom === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Épuisé",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    if (stock < 10)
      return {
        label: "Stock faible",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      };
    return {
      label: "En stock",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
  };

  const handleDeleteProduct = async (
    productId: number,
    productName: string,
  ) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success(`${productName} supprimé avec succès !`);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Erreur lors de la suppression du produit");
    }
  };

  const handleDeleteCategory = async (
    categoryId: number,
    categoryName: string,
  ) => {
    try {
      await deleteCategory(categoryId).unwrap();
      toast.success(`Catégorie ${categoryName} supprimée avec succès !`);
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(Number(product.quantite_stock));

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={
              `${import.meta.env.VITE_API_URL}` + product.image ||
              "https://placehold.co/600x400"
            }
            alt={product.nom}
            className="w-full h-full object-cover"
          />
          {!product.actif && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Inactif</Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{product.nom}</CardTitle>
              <CardDescription className="text-sm">
                {product.description}
              </CardDescription>
            </div>
            {/* <div className='text-right'>
              <p className='text-2xl font-bold text-primary'>{parseFloat(String(product.prix)).toFixed(0)} XOF</p>
            </div> */}
            <div className="text-right">
              {product.prix_promotion < product.prix ? (
                <>
                  <p className="text-lg text-muted-foreground line-through">
                    {parseFloat(String(product.prix)).toFixed(0)} XOF
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {parseFloat(String(product.prix_promotion)).toFixed(0)} XOF
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {parseFloat(String(product.prix)).toFixed(0)} XOF
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Badge variant="outline">
                {product.categorie?.nom || "Sans catégorie"}
              </Badge>
              <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
            </div>

            {isAdminOrEmployee && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Package className="mr-1 h-3 w-3" />
                  Stock: {product.quantite_stock}
                </span>
                {Number(product.quantite_stock) < 10 && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            )}

            {isAdminOrEmployee && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer "{product.nom}" ?
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleDeleteProduct(product.id, product.nom)
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger les produits. Veuillez réessayer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {user?.role === "client" ? "Catalogue" : "Gestion des produits"}
          </h2>
          <p className="text-muted-foreground">
            {user?.role === "client"
              ? "Découvrez nos produits artisanaux"
              : "Gérez votre catalogue de produits"}
          </p>
        </div>
        {isAdminOrEmployee && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryFormOpen(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Button>
            <Button onClick={() => setIsProductFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        )}
      </div>

      {/* Categories Management */}
      {isAdminOrEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des catégories</CardTitle>
            <CardDescription>
              Gérez les catégories de vos produits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{category.nom}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <Badge
                      variant={category.actif ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {category.actif ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer la catégorie
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la catégorie "
                            {category.nom}" ? Tous les produits de cette
                            catégorie seront affectés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteCategory(category.id, category.nom)
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories
              .filter((cat) => cat.actif)
              .map((category) => (
                <SelectItem key={category.id} value={category.nom}>
                  {category.nom}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucun produit trouvé</h3>
          <p className="text-muted-foreground">
            Essayez de modifier vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isProductFormOpen}
        onOpenChange={(open) => {
          setIsProductFormOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSuccess={() => {
          setEditingProduct(null);
        }}
      />

      {/* Category Form Dialog */}
      <CategoryForm
        open={isCategoryFormOpen}
        onOpenChange={(open) => {
          setIsCategoryFormOpen(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={() => {
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
