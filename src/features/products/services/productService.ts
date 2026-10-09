import { api } from "../../../shared/lib/api";

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
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
