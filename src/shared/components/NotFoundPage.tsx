import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">Page not found</h1>
      <Link to="/">Back to home</Link>
    </section>
  );
}
