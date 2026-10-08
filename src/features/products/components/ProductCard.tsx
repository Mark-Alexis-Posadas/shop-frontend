import type { Product } from '../types';

type ProductCardProps = { product: Product };

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
      <p className="mb-4 text-slate-600">{product.description}</p>
      <p className="font-semibold">Price: {product.price.toFixed(2)}</p>
    </article>
  );
}
