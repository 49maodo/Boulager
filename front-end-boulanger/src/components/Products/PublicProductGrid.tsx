import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Plus, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { useAddToCartMutation } from '@/store/api/cartApi';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/productsApi';
import { useAppSelector } from '@/hooks/redux';
import { Product } from '@/types/api';
import { useNavigate } from 'react-router-dom';

interface PublicProductGridProps {
  onLoginRequired: () => void;
}

export function PublicProductGrid({ onLoginRequired }: PublicProductGridProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const { data: productsResponse, isLoading: isLoadingProducts, error: productsError } = useGetProductsQuery();

  const { data: categoriesResponse, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const products = productsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const filteredProducts = products.filter((product) => {
    if (!product.actif) return false;

    const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (product.categorie && product.categorie.nom === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Épuisé', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
    if (stock < 10) return { label: 'Stock faible', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' };
    return { label: 'En stock', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }

    try {
      // Utiliser uniquement l'API - plus de dispatch local
      await addToCart({
        produit_id: product.id,
        quantite: 1,
      }).unwrap();

      toast.success(`${product.nom} ajouté au panier !`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error("Erreur lors de l'ajout au panier");
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(Number(product.quantite_stock));
    const isOutOfStock = product.quantite_stock === 0;
    const navigate = useNavigate();

    return (
      <Card className='overflow-hidden hover:shadow-lg transition-all duration-300 group'>
        <div className='aspect-video relative overflow-hidden'>
          <img src={`${import.meta.env.VITE_API_URL}` + product.image || 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg'} alt={product.nom} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' />
          {isOutOfStock && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <Badge variant='secondary'>Non disponible</Badge>
            </div>
          )}
        </div>

        <CardHeader className='pb-2'>
          <div className='flex justify-between items-start'>
            <div className='flex-1'>
              <CardTitle className='text-lg line-clamp-1'>{product.nom}</CardTitle>
              <CardDescription className='text-sm line-clamp-2 mt-1'>{product.description}</CardDescription>
            </div>
            {/* <div className='text-right ml-4'>
              <p className='text-2xl font-bold text-primary'>{parseFloat(String(product.prix)).toFixed(0)} XOF</p>
            </div> */}
            <div className='text-right'>
              {product.prix_promotion < product.prix ? (
                <>
                  <p className='text-lg text-muted-foreground line-through'>{parseFloat(String(product.prix)).toFixed(0)} XOF</p>
                  <p className='text-2xl font-bold text-primary'>{parseFloat(String(product.prix_promotion)).toFixed(0)} XOF</p>
                </>
              ) : (
                <p className='text-2xl font-bold text-primary'>{parseFloat(String(product.prix)).toFixed(0)} XOF</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <Badge variant='outline'>{product.categorie?.nom || 'Sans catégorie'}</Badge>
              <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
            </div>

            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span className='flex items-center'>
                <Package className='mr-1 h-3 w-3' />
                Stock: {product.quantite_stock}
              </span>
              {Number(product.quantite_stock) < 10 && Number(product.quantite_stock) > 0 && <AlertTriangle className='h-4 w-4 text-orange-500' />}
            </div>

            <Button variant='outline' size='sm' onClick={() => navigate(`/product/${product.id}`)} className='w-full mb-2'>
              Voir détails
            </Button>
            <Button className='w-full' disabled={isOutOfStock || isAddingToCart} onClick={() => handleAddToCart(product)}>
              {isAddingToCart ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Plus className='mr-2 h-4 w-4' />}
              {isOutOfStock ? 'Non disponible' : 'Ajouter au panier'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className='text-center py-12'>
        <Package className='mx-auto h-12 w-12 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>Erreur de chargement</h3>
        <p className='text-muted-foreground'>Impossible de charger les produits. Veuillez réessayer.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Rechercher un produit...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-8' />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='w-full sm:w-[200px]'>
            <SelectValue placeholder='Catégorie' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Toutes les catégories</SelectItem>
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
        <div className='text-center py-12'>
          <Package className='mx-auto h-12 w-12 text-muted-foreground' />
          <h3 className='mt-4 text-lg font-semibold'>Aucun produit trouvé</h3>
          <p className='text-muted-foreground'>Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Categories Showcase - Only show on home page */}
      {selectedCategory === 'all' && window.location.pathname === '/' && (
        <div className='space-y-6'>
          <h2 className='text-2xl font-bold text-center'>Nos Spécialités</h2>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {categories
              .filter((cat) => cat.actif)
              .map((category) => (
                <Card key={category.id} className='cursor-pointer hover:shadow-lg transition-shadow' onClick={() => setSelectedCategory(category.nom)}>
                  <CardHeader className='text-center'>
                    <CardTitle className='text-lg'>{category.nom}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='text-center'>
                      <Badge variant='secondary'>{products.filter((p) => p.categorie?.nom === category.nom && p.actif).length} produits</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
