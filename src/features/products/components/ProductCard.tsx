import { Link } from "react-router-dom";
import type { Product } from "../services/productService";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product._id}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-52 w-full object-cover"
          />
        ) : (
          <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
            No Image Available
          </div>
        )}
      </Link>

      <div className="p-5">
        <h3 className="font-semibold text-gray-900">{product.name}</h3>

        <p className="mt-3 text-lg font-bold">
          {product.price.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
          })}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
        >
          View Product
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
