import { productListKey, type ProductFilters } from "../utils/productFilters";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";

export const useProducts = (filters: ProductFilters, enabled = true) => {
  return useQuery({
    queryKey: productListKey(filters),
    queryFn: ({ signal }) => productService.getAll(filters, signal),
    enabled,
    staleTime: 30_000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
  });
};
