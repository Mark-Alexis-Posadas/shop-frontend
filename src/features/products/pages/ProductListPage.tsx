import { useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ProductFilterForm, ProductSearch } from "../components/ProductFilters";
import { useProducts } from "../hooks/useProducts";
import {
  readProductFilters,
  updateProductParams,
} from "../utils/productFilters";

const ProductListPage = () => {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const { filters, error } = readProductFilters(params);
  const { data, isPending, isError, isFetching, refetch } = useProducts(
    filters,
    !error,
  );
  const change = useCallback(
    (changes: Record<string, string>) => {
      setParams((current) => updateProductParams(current, changes));
    },
    [setParams],
  );
  const search = useCallback(
    (value: string) => change({ search: value }),
    [change],
  );
  const totalPages = data?.totalPages ?? 0;
  const lastBrowsablePage = Math.min(
    totalPages,
    Math.floor(10000 / filters.limit) + 1,
  );
  const pages = Array.from(
    new Set([
      1,
      filters.page - 1,
      filters.page,
      filters.page + 1,
      lastBrowsablePage,
    ]),
  )
    .filter((page) => page >= 1 && page <= lastBrowsablePage)
    .sort((a, b) => a - b);
  return (
    <>
      <section className="border-b border-slate-200 bg-white px-5 py-9 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              The full collection
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Find what you’re looking for.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Search, sort, and narrow the collection to find the right fit.
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium text-slate-500">
            Cash on delivery available
          </p>
        </div>
      </section>
      <section
        id="products"
        className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 sm:py-10"
        aria-label="Product catalog"
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <ProductSearch
              value={filters.search}
              navigationKey={location.key}
              onChange={search}
            />
            <label className="text-sm font-semibold text-slate-700">
              Sort by
              <select
                value={filters.sort}
                onChange={(event) => change({ sort: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 focus:outline-indigo-500"
              >
                <option value="newest">Newest first</option>
                <option value="priceAsc">Price: low to high</option>
                <option value="priceDesc">Price: high to low</option>
                <option value="nameAsc">Name: A-Z</option>
                <option value="nameDesc">Name: Z-A</option>
              </select>
            </label>
          </div>
          <ProductFilterForm
            key={location.key}
            filters={filters}
            onApply={change}
          />
          <button
            type="button"
            onClick={() => setParams({})}
            className="text-sm font-semibold text-indigo-700 underline focus-visible:outline-2"
          >
            Reset Filters
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        ) : (
          <>
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-slate-600"
            >
              {isPending
                ? "Loading products..."
                : data
                  ? `${data.total} products found | Page ${filters.page} of ${Math.max(1, totalPages)}`
                  : ""}
              {isFetching && !isPending ? " | Updating..." : ""}
            </p>
            {isError && (
              <div role="alert">
                <p className="text-red-700">Failed to load products.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-white"
                >
                  Try Again
                </button>
              </div>
            )}
            {!isPending && !isError && data?.items.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-6 text-slate-600">
                No products match this page. Adjust or reset filters, or choose
                an earlier page.
              </p>
            )}
            {!isError && data && (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {data.items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
            {!isError && totalPages > lastBrowsablePage && (
              <p className="text-sm text-slate-600">
                Narrow your filters to browse beyond the first 10,000 results.
              </p>
            )}
            {!isError && totalPages > 0 && (
              <nav
                aria-label="Product pages"
                className="flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={filters.page <= 1}
                  onClick={() => change({ page: String(filters.page - 1) })}
                  className="rounded-lg border px-3 py-2 disabled:opacity-40"
                >
                  Previous
                </button>
                {pages.map((page, index) => (
                  <span key={page} className="inline-flex items-center gap-2">
                    {index > 0 && page - pages[index - 1] > 1 && (
                      <span aria-hidden="true">...</span>
                    )}
                    <button
                      type="button"
                      aria-label={`Go to page ${page}`}
                      aria-current={page === filters.page ? "page" : undefined}
                      onClick={() => change({ page: String(page) })}
                      className={`rounded-lg border px-3 py-2 ${page === filters.page ? "bg-indigo-600 text-white" : "bg-white"}`}
                    >
                      {page}
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  disabled={
                    filters.page >= totalPages ||
                    filters.page * filters.limit > 10000
                  }
                  onClick={() => change({ page: String(filters.page + 1) })}
                  className="rounded-lg border px-3 py-2 disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
};
export default ProductListPage;
