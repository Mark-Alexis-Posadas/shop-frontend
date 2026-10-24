import { useEffect, useState } from "react";
import type { ProductFilters } from "../utils/productFilters";

const control =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-2 focus:outline-indigo-500";
export function ProductSearch({
  value,
  navigationKey,
  onChange,
}: {
  value: string;
  navigationKey: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState({ key: navigationKey, value });
  if (draft.key !== navigationKey) setDraft({ key: navigationKey, value });
  useEffect(() => {
    if (draft.key !== navigationKey || draft.value === value) return;
    const timer = window.setTimeout(() => onChange(draft.value), 350);
    return () => window.clearTimeout(timer);
  }, [draft, navigationKey, value, onChange]);
  return (
    <label className="block text-sm font-semibold text-slate-700">
      Search products
      <input
        type="search"
        maxLength={80}
        value={draft.value}
        onChange={(event) =>
          setDraft({ key: navigationKey, value: event.target.value })
        }
        placeholder="Name, SKU, or brand"
        className={control + " mt-2"}
      />
    </label>
  );
}
export function ProductFilterForm({
  filters,
  onApply,
}: {
  filters: ProductFilters;
  onApply: (changes: Record<string, string>) => void;
}) {
  return (
    <form
      className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onApply({
          category: String(data.get("category") ?? "").trim(),
          minPrice: String(data.get("minPrice") ?? ""),
          maxPrice: String(data.get("maxPrice") ?? ""),
        });
      }}
    >
      <label className="text-sm font-semibold text-slate-700">
        Category (exact match)
        <input
          name="category"
          maxLength={150}
          defaultValue={filters.category}
          className={control + " mt-2"}
          placeholder="All categories"
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Minimum price (PHP)
        <input
          name="minPrice"
          type="number"
          min="0"
          max="1000000000"
          step="0.01"
          defaultValue={filters.minPrice}
          className={control + " mt-2"}
        />
      </label>
      <label className="text-sm font-semibold text-slate-700">
        Maximum price (PHP)
        <input
          name="maxPrice"
          type="number"
          min="0"
          max="1000000000"
          step="0.01"
          defaultValue={filters.maxPrice}
          className={control + " mt-2"}
        />
      </label>
      <button
        className="rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500"
        type="submit"
      >
        Apply filters
      </button>
    </form>
  );
}
