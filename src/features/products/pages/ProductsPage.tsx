import { Container } from '../../../shared/components/Container';
import { useProducts } from '../hooks/use-products';
import { ProductCard } from '../components/ProductCard';

export function ProductsPage() {
  const { data, isPending, isError, refetch } = useProducts();

  return (
    <Container className="py-12">
      <h1 className="mb-6 text-3xl font-bold">Products</h1>
      {isPending && <p role="status">Loading products...</p>}
      {isError && (
        <div role="alert">
          <p className="mb-3 text-red-700">
            Could not load products. Make sure the backend is running on port
            5000.
          </p>
          <button
            onClick={() => void refetch()}
            className="rounded-lg border px-4 py-2"
          >
            Try again
          </button>
        </div>
      )}
      {data?.length === 0 && (
        <p className="text-slate-600">
          No products yet. Create a product through your API to see it here.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </Container>
  );
}


