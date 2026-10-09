import { Link, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../cart/hooks/useCart";
import { useAuthStore } from "../../auth/store/authStore";
const ProductDetailPage = () => {
  const { productId } = useParams();
  const { data: product, isPending, isError } = useProduct(productId ?? "");

  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { data: cart, addToCart, isUpdating, updateError } = useCart();

  const handleAddToCart = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!product) return;
    addToCart(product._id);
  };

  if (isPending) {
    return <p className="px-6 py-20 text-center">Loading product...</p>;
  }

  if (isError || !product) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">Product unavailable</h1>
        <Link to="/products" className="mt-4 inline-block text-indigo-600">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex min-h-80 items-center justify-center rounded-2xl bg-gray-200">
          No image available
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold">{product.name}</h1>

        <p className="mt-5 text-3xl font-bold">
          {product.price.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
          })}
        </p>

        <p className="mt-6 text-gray-600">{product.description}</p>

        <button
          onClick={handleAddToCart}
          disabled={Boolean(token) && (!cart || isUpdating)}
          className="mt-8 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isUpdating ? "Adding..." : "Add to Cart"}
        </button>

        {updateError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            Unable to update your cart.
          </p>
        )}
      </div>
    </section>
  );
};

export default ProductDetailPage;
