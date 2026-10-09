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

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);

    return data;
  },
};
