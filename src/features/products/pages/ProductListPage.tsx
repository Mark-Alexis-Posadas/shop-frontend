import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

const ProductListPage = () => {
  return (
    <>
      <section className="bg-indigo-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
            New Collection
          </span>

          <h1 className="mt-7 max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
            Discover products you'll love.
          </h1>

          <p className="mt-5 max-w-xl text-indigo-100">
            Shop quality products at great prices. Discover your next favorite
            item with ShopSphere.
          </p>

          <a
            href="#products"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-indigo-950 transition hover:bg-indigo-100"
          >
            Shop Now
          </a>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="mt-2 text-gray-500">Explore our latest collection.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
};

export default ProductListPage;
