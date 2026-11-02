import { ProductImage } from "../../../shared/components/ui/ProductImage";
import { Link, useLocation } from "react-router-dom";
import type { Product } from "../services/productService";
import {
  formatPrice,
  getPrimaryImage,
  getDiscountPercentage,
  isLowStock,
} from "../utils/product.utils";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const location = useLocation();
  const returnTo = location.pathname + location.search;
  const image = getPrimaryImage(product);
  const discount = getDiscountPercentage(product);
  const outOfStock = product.stock === 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <Link
        to={`/products/${product._id}`}
        state={{ returnTo }}
        className="relative block aspect-square overflow-hidden bg-slate-50"
      >
        {image ? (
          <ProductImage
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03] sm:p-5"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No Image Available
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}

        {product.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600 sm:text-xs">
          {product.category}
        </p>

        <Link to={`/products/${product._id}`} state={{ returnTo }}>
          <h3 className="mt-1.5 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 hover:text-indigo-600 sm:mt-2 sm:min-h-12 sm:text-base sm:leading-6">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
            {product.brand}
          </p>
        )}

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 sm:mt-3 sm:text-sm">
          {product.shortDescription || product.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-4 sm:gap-2">
          <span className="text-base font-bold tracking-tight text-slate-900 sm:text-xl">
            {formatPrice(product.price)}
          </span>

          {discount > 0 && product.compareAtPrice != null && (
            <span className="text-xs text-slate-400 line-through sm:text-sm">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="mt-2 sm:mt-3">
          {outOfStock ? (
            <span className="text-xs font-semibold text-red-700 sm:text-sm">
              Out of Stock
            </span>
          ) : isLowStock(product) ? (
            <span className="text-xs font-semibold text-amber-700 sm:text-sm">
              Only {product.stock} left!
            </span>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 sm:text-sm">
              In Stock
            </span>
          )}
        </div>

        <Link
          to={`/products/${product._id}`}
          state={{ returnTo }}
          className="mt-auto block rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-5 sm:px-4 sm:py-3 sm:text-sm"
        >
          View Details
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
