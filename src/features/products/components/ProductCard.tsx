import { Link } from "react-router-dom";
import type { Product } from "../data/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-52 w-full object-cover"
        />
      </Link>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {product.category}
        </p>

        <h3 className="mt-2 font-semibold text-gray-900">{product.name}</h3>

        <p className="mt-3 text-lg font-bold">
          {product.price.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
          })}
        </p>

        <Link
          to={`/products/${product.id}`}
          className="mt-4 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
        >
          View Product
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
