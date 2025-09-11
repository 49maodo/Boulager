import { baseApi } from "./baseApi";
import { Product, Category, ApiResponse } from "@/types/api";

// Types pour les mutations
interface CreateProductPayload {
  nom: string;
  description: string;
  prix: number;
  quantite_stock: number;
  categorie_id: number;
  actif?: boolean;
  image?: File;
}

interface UpdateProductPayload extends CreateProductPayload {
  id: number;
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<Product[]>, void>({
      query: () => "/produits",
      providesTags: ["Product"],
    }),

    getProduct: builder.query<ApiResponse<Product>, number>({
      query: (id) => `/produits/${id}`,
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<ApiResponse<Product>, CreateProductPayload>(
      {
        query: (body) => {
          const formData = new FormData();
          formData.append("nom", body.nom);
          formData.append("description", body.description);
          formData.append("prix", body.prix.toString());
          formData.append("quantite_stock", body.quantite_stock.toString());
          formData.append("categorie_id", body.categorie_id.toString());
          formData.append("actif", body.actif ? "1" : "0");

          if (body.image) {
            formData.append("image", body.image);
          }

          return {
            url: "/produits",
            method: "POST",
            body: formData, // 👈 Ici on envoie du FormData, pas un objet
          };
        },
        invalidatesTags: ["Product"],
      },
    ),

    updateProduct: builder.mutation<ApiResponse<Product>, UpdateProductPayload>(
      {
        query: ({ id, ...body }) => {
          const formData = new FormData();
          formData.append("nom", body.nom);
          formData.append("description", body.description);
          formData.append("prix", body.prix.toString());
          formData.append("quantite_stock", body.quantite_stock.toString());
          formData.append("categorie_id", body.categorie_id.toString());
          formData.append("actif", body.actif ? "1" : "0");

          // Ajouter l'image seulement si elle existe
          if (body.image) {
            formData.append("image", body.image);
          }

          return {
            url: `/produits/${id}`,
            method: "POST", // Laravel accepte POST avec _method pour les fichiers
            body: formData,
          };
        },
        invalidatesTags: ["Product"],
      },
    ),

    deleteProduct: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/produits/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<
      ApiResponse<Category>,
      {
        nom: string;
        description: string;
        actif?: boolean;
      }
    >({
      query: (categoryData) => ({
        url: "/categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      ApiResponse<Category>,
      {
        id: number;
        nom: string;
        description: string;
        actif?: boolean;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<ApiResponse<any>, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = productsApi;
