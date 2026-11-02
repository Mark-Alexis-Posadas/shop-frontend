import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { readProductFilters } from "../utils/productFilters";

const HomePage = () => {
  const { filters } = readProductFilters(new URLSearchParams());
  const { data, isPending, isError, refetch } = useProducts(filters);
  const products = data?.items ?? [];
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ).slice(0, 4);
  const featured = products.filter((product) => product.isFeatured);
  const spotlight = (featured.length ? featured : products).slice(0, 4);

  return (
    <div>
      <section className="overflow-hidden bg-[#f0ede5]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              <Sparkles size={14} className="text-indigo-600" /> Thoughtful
              finds, everyday value
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Good things for the way you live.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Explore practical favorites and little upgrades, all in one place.
              Find something that feels just right.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Explore the collection <ArrowRight size={17} />
              </Link>
              <a
                href="#featured"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
              >
                See featured picks
              </a>
            </div>
            <p className="mt-7 text-xs font-medium text-slate-500">
              Simple shopping · Secure checkout · Cash on delivery
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -right-4 -top-5 h-24 w-24 rounded-full bg-amber-200/70 blur-2xl sm:h-36 sm:w-36" />
            <div className="relative grid aspect-[4/3] grid-cols-[1.1fr_0.9fr] gap-3 overflow-hidden rounded-[2rem] bg-white p-3 shadow-xl shadow-slate-900/10 sm:gap-4 sm:p-4">
              <div className="flex flex-col justify-between rounded-[1.4rem] bg-slate-950 p-5 text-white sm:p-7">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
                  ShopSphere
                </span>
                <div>
                  <p className="text-2xl font-semibold leading-tight sm:text-3xl">
                    A better kind of everyday.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Browse useful things picked for real life.
                  </p>
                </div>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-indigo-200"
                >
                  Browse products <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="grid grid-rows-[1fr_auto] gap-3 sm:gap-4">
                <div className="flex items-end rounded-[1.4rem] bg-gradient-to-br from-indigo-100 via-violet-100 to-amber-100 p-4 sm:p-6">
                  <span className="max-w-[9rem] text-sm font-semibold leading-5 text-slate-700 sm:text-base">
                    Discover your next favorite
                  </span>
                </div>
                <div className="rounded-[1.4rem] bg-[#e8e4da] p-4 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Made for your routine
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 sm:text-xl">
                    Useful. Lovely. Yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Browse your way
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Explore categories
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800 sm:inline-flex"
          >
            All products <ArrowRight size={16} />
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className={`group flex min-h-28 items-end justify-between rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-36 sm:p-5 ${
                  [
                    "bg-indigo-50",
                    "bg-amber-50",
                    "bg-emerald-50",
                    "bg-rose-50",
                  ][index]
                }`}
              >
                <span className="text-base font-semibold text-slate-800 sm:text-lg">
                  {category}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Browse the full collection to find your next favorite.
          </p>
        )}
      </section>

      <section id="featured" className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                A good place to start
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Featured finds
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                A few favorites from across the collection.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Shop all <ArrowRight size={16} />
            </Link>
          </div>
          {isPending ? (
            <div
              className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5"
              aria-label="Loading featured products"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-[0.72] animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : isError ? (
            <div
              className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
              role="alert"
            >
              <p>We couldn’t load featured products.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          ) : spotlight.length > 0 ? (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {spotlight.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-7 rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
              New finds are on the way. Browse the collection to see what’s
              available.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-indigo-950 px-6 py-8 text-white sm:flex-row sm:items-center sm:px-9 sm:py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">
              Your next find is waiting
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Make a little room for good things.
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-50"
          >
            Shop the collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
