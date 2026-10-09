import { Link, useParams } from "react-router-dom";
import { products } from "../data/products";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-indigo-600">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        className="w-full rounded-2xl object-cover"
      />

      <div>
        <p className="font-semibold text-indigo-600">{product.category}</p>
        <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>
        <p className="mt-5 text-3xl font-bold">
          {product.price.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
          })}
        </p>
        <p className="mt-6 text-gray-600">{product.description}</p>

        <Link
          to="/cart"
          className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          View Cart
        </Link>
        <p className="mt-3 text-sm text-gray-500">
          Add-to-cart functionality coming next.
        </p>
      </div>
    </section>
  );
};

export default ProductDetailPage;
