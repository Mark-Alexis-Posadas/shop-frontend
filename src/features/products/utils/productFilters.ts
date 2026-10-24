export const productSorts = [
  "newest",
  "priceAsc",
  "priceDesc",
  "nameAsc",
  "nameDesc",
] as const;
export interface ProductFilters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: (typeof productSorts)[number];
  page: number;
  limit: number;
}
export function readProductFilters(params: URLSearchParams): {
  filters: ProductFilters;
  error: string;
} {
  const search = (params.get("search") ?? "").trim(),
    category = (params.get("category") ?? "").trim();
  const minPrice = params.get("minPrice") ?? "",
    maxPrice = params.get("maxPrice") ?? "";
  const sort = params.get("sort") || "newest",
    page = params.get("page") ?? "1",
    limit = params.get("limit") ?? "12";
  let error = "";
  const keys = [
    "search",
    "category",
    "minPrice",
    "maxPrice",
    "sort",
    "page",
    "limit",
  ];
  if (keys.some((key) => params.getAll(key).length > 1))
    error = "Each filter must have a single value.";
  if (
    search.length > 80 ||
    category.length > 150 ||
    Array.from(search + category).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    )
  )
    error = "Search or category is invalid.";
  if (!productSorts.includes(sort as ProductFilters["sort"]))
    error = "Choose a valid sort order.";
  if (
    !/^[1-9]\d*$/.test(page) ||
    !/^[1-9]\d*$/.test(limit) ||
    Number(page) > 10000 ||
    Number(limit) > 48 ||
    (Number(page) - 1) * Number(limit) > 10000
  )
    error = "Invalid page or page size. Reset filters to continue.";
  const validPrice = (value: string) =>
    !value ||
    (/^\d+(?:\.\d{1,2})?$/.test(value) &&
      value.length <= 16 &&
      Number(value) <= 1_000_000_000);
  if (
    !validPrice(minPrice) ||
    !validPrice(maxPrice) ||
    (minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice))
  )
    error =
      "Enter valid prices with minimum no greater than maximum (up to two decimals).";
  return {
    filters: {
      search,
      category,
      minPrice,
      maxPrice,
      sort: sort as ProductFilters["sort"],
      page: Number(page),
      limit: Number(limit),
    },
    error,
  };
}
export function updateProductParams(
  current: URLSearchParams,
  changes: Record<string, string>,
): URLSearchParams {
  const next = new URLSearchParams(current);
  next.delete("page");
  for (const [key, value] of Object.entries(changes)) {
    if (
      !value ||
      (key === "page" && value === "1") ||
      (key === "sort" && value === "newest")
    )
      next.delete(key);
    else next.set(key, value);
  }
  return next;
}
export function productListKey(filters: ProductFilters) {
  return ["products", "list", filters] as const;
}
