import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useProducts } from "../../products/hooks/use-products";
import { ProductCard } from "../../products/components/ProductCard";
import { Container } from "../../../shared/components/Container";

export function ProductPreview() {
  const { data, isPending, isError, refetch } = useProducts();

  return (
    <section aria-labelledby="collection-heading" className="py-16 sm:py-20">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              The collection
            </p>
            <h2
              id="collection-heading"
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Find your next everyday favorite.
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900"
          >
            View all products <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {isPending && (
          <p
            role="status"
            className="rounded-2xl bg-stone-50 p-8 text-stone-600"
          >
            Loading the collection...
          </p>
        )}
        {isError && (
          <div role="alert" className="rounded-2xl border border-stone-200 p-8">
            <p className="mb-4 text-stone-600">
              We couldn't load the collection right now.
            </p>
            <button
              onClick={() => void refetch()}
              className="rounded-full bg-emerald-900 px-5 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        )}
        {!isError && data?.length === 0 && (
          <p className="rounded-2xl bg-stone-50 p-8 text-stone-600">
            The collection is getting ready. Check back soon for new finds.
          </p>
        )}
        {data && data.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 3).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
