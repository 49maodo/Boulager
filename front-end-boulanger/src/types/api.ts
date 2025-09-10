// Types basés sur l'API backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  user: string;
  token: string;
}

export interface RegisterRequest {
  firstname: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  firstname: string;
  email: string;
  telephone?: string;
  address?: string;
  role: 'admin' | 'employe' | 'client';
  created_at: string;
  updated_at: string;
}
export interface UserResource {
  id?: number | null;
  firstname: string;
  name: string;
  email: string;
  telephone: string | null;
  address: string | null;
  role: string | null;
  is_active?: boolean | null;
}

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number | string;
  prix_promotion: number | string;
  quantite_stock: number | string;
  image: string | null;
  actif: boolean;
  categorie: {
    id: number | null;
    nom: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  nom: string;
  description: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  numero_commande: string;
  statut: 'en_attente' | 'confirmee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';
  montant_total: string;
  mode_paiement: 'espece' | 'wave' | 'om' | null;
  adresse_livraison: string;
  date_livraison: string;
  created_at: string;
  updated_at: string;
  est_paye: boolean;
  client: {
    id: number;
    name: string;
    firstname: string;
    email: string;
    telephone: string;
  };
  articles: OrderArticle[];
}

export interface OrderArticle {
  id: number;
  nom: string;
  description?: string;
  image?: string;
  prix_unitaire: string;
  quantite: number;
  sous_total: string;
}

export interface CartItem {
  produit_id: number;
  quantite: number;
  produit?: Product;
}

export interface CreateOrderRequest {
  mode_paiement?: 'espece' | 'wave' | 'om';
  adresse_livraison: string;
  date_livraison: string;
}

export interface Promotion {
  id: number;
  nom: string;
  description: string;
  type: 'POURCENTAGE' | 'MONTANT_FIXE' | 'ACHETEZ_X_OBTENEZ_Y';
  valeur_remise: string;
  date_debut: string;
  date_fin: string;
  NbProduits: string;
  produits_ids: number[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  destinataire_id: number;
  contenu: string;
  type_message: 'TEXTE' | 'IMAGE' | 'SYSTEME';
  created_at: string;
  updated_at: string;
}
