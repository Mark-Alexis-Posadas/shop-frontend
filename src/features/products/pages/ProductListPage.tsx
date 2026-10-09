import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const ProductListPage = () => {
  const { data: products = [], isPending, isError, refetch } = useProducts();

  return (
    <>
      <section className="bg-indigo-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
            New Collection
          </span>

          <h1 className="mt-7 max-w-2xl text-4xl font-extrabold md:text-6xl">
            Discover products you'll love.
          </h1>

          <p className="mt-5 text-indigo-100">
            Shop quality products at great prices.
          </p>

          <a
            href="#products"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-indigo-950"
          >
            Shop Now
          </a>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-8 text-3xl font-bold">Featured Products</h2>

        {isPending && <p>Loading products...</p>}

        {isError && (
          <div role="alert">
            <p className="text-red-600">Failed to load products.</p>
            <button
              onClick={() => void refetch()}
              className="mt-3 rounded bg-indigo-600 px-4 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!isPending && !isError && products.length === 0 && (
          <p className="text-gray-500">No products available yet.</p>
        )}

        {!isPending && !isError && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default ProductListPage;
