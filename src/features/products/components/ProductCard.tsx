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
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/products/${product._id}`}
        state={{ returnTo }}
        className="relative block overflow-hidden bg-gray-100"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-60 w-full object-contain p-4 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-60 items-center justify-center text-gray-400">
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

      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {product.category}
        </p>

        <Link to={`/products/${product._id}`} state={{ returnTo }}>
          <h3 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold text-gray-900 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
        )}

        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
          {product.shortDescription || product.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>

          {discount > 0 && product.compareAtPrice != null && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="mt-3">
          {outOfStock ? (
            <span className="text-sm font-medium text-red-600">
              Out of Stock
            </span>
          ) : isLowStock(product) ? (
            <span className="text-sm font-medium text-orange-600">
              Only {product.stock} left!
            </span>
          ) : (
            <span className="text-sm font-medium text-green-600">In Stock</span>
          )}
        </div>

        <Link
          to={`/products/${product._id}`}
          state={{ returnTo }}
          className="mt-5 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
