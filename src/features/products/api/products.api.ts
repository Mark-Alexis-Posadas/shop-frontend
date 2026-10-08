import type { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error('Unable to fetch products');
  return response.json();
}
