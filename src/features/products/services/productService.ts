import type { ProductFilters } from "../utils/productFilters";
import { api } from "../../../shared/lib/api";

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  category: string;
  brand?: string;
  stock: number;
  lowStockThreshold: number;
  images: ProductImage[];
  tags: string[];
  weight?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  getAll: async (
    filters: ProductFilters,
    signal?: AbortSignal,
  ): Promise<ProductPage> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== ""),
    );
    const { data } = await api.get<ProductPage>("/products", {
      params,
      signal,
    });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);

    return data;
  },
};
