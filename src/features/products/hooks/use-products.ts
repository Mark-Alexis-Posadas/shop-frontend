import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products.api';

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
};

export function useProducts() {
  return useQuery({ queryKey: productKeys.list(), queryFn: getProducts });
}
