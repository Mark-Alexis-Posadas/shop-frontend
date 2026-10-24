const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const { readFileSync } = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { MemoryRouter } = require("react-router-dom");
const {
  QueryClient,
  QueryClientProvider,
  QueryObserver,
} = require("@tanstack/react-query");
const { AxiosError } = require("axios");

// In-memory compiler/API boundary, like the admin UI test harness. No Vite env,
// browser installation, added dependency, or generated test artifacts required.
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    module._compile(
      ts.transpileModule(readFileSync(filename, "utf8"), {
        fileName: filename,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      }).outputText,
      filename,
    );
  };
}

const api = {
  get: async () => {
    throw new Error("Unexpected request");
  },
};
const apiPath = require.resolve("../src/shared/lib/api.ts");
const apiModule = new Module(apiPath);
apiModule.exports = { api };
apiModule.loaded = true;
require.cache[apiPath] = apiModule;
const { createMemoryRouter, RouterProvider } = require("react-router-dom");
const {
  readProductFilters,
  updateProductParams,
  productListKey,
} = require("../src/features/products/utils/productFilters.ts");
const {
  productService,
} = require("../src/features/products/services/productService.ts");
const ProductListPage =
  require("../src/features/products/pages/ProductListPage.tsx").default;
const h = React.createElement;
const product = {
  _id: "abcdef012345abcdef012345",
  name: "Fixture",
  category: "Home",
  sku: "FIXTURE",
  price: 20,
  stock: 1,
  images: [],
  description: "Fixture",
  lowStockThreshold: 0,
};
const page = { items: [product], total: 1, page: 1, limit: 12, totalPages: 1 };
const filters = (search = "") =>
  readProductFilters(new URLSearchParams(search)).filters;
function markup(client, search = "") {
  return renderToStaticMarkup(
    h(
      QueryClientProvider,
      { client },
      h(
        MemoryRouter,
        { initialEntries: ["/products" + search] },
        h(ProductListPage),
      ),
    ),
  );
}
test("URL filters validate prices, repeated inputs and bounded pagination, and reset page on changes", () => {
  const input = new URLSearchParams(
    "search=chair&category=Home&minPrice=1&maxPrice=50&sort=priceAsc&page=3&limit=24",
  );
  const result = readProductFilters(input);
  assert.equal(result.error, "");
  assert.equal(result.filters.page, 3);
  for (const change of [
    { search: "table" },
    { category: "Tech" },
    { minPrice: "2" },
    { maxPrice: "40" },
    { sort: "newest" },
  ]) {
    const next = updateProductParams(input, change);
    assert.equal(next.get("page"), null);
    assert.equal(next.get("limit"), "24");
    for (const [key, value] of Object.entries(change))
      assert.equal(next.get(key), key === "sort" ? null : value);
  }
  assert.equal(updateProductParams(input, { page: "2" }).get("page"), "2");
  for (const invalid of [
    "minPrice=30&maxPrice=10",
    "maxPrice=-1",
    "limit=49",
    "page=NaN",
    "search=a&search=b",
    "sort=stock",
  ])
    assert.ok(readProductFilters(new URLSearchParams(invalid)).error, invalid);
});
test("memory router back/forward preserves shareable filter URLs and card return state", async () => {
  const client = new QueryClient();
  const initial = "?search=chair&category=Home&page=3";
  const initialFilters = filters(initial);
  client.setQueryData(productListKey(initialFilters), {
    ...page,
    page: 3,
    total: 30,
    totalPages: 3,
  });
  const router = createMemoryRouter(
    [
      { path: "/products", element: h(ProductListPage) },
      { path: "/products/:id", element: h("p", null, "detail") },
    ],
    { initialEntries: ["/products" + initial] },
  );
  const render = () =>
    renderToStaticMarkup(
      h(QueryClientProvider, { client }, h(RouterProvider, { router })),
    );
  try {
    assert.ok(render().includes('value="chair"'));
    await router.navigate("/products?sort=priceAsc");
    assert.equal(filters(router.state.location.search).sort, "priceAsc");
    await router.navigate(-1);
    assert.equal(router.state.location.search, initial);
    assert.ok(render().includes('value="chair"'));
    await router.navigate(1);
    assert.equal(router.state.location.search, "?sort=priceAsc");
    await router.navigate("/products/" + product._id, {
      state: { returnTo: "/products" + initial },
    });
    assert.equal(router.state.location.state.returnTo, "/products" + initial);
    await router.navigate(-1);
    assert.equal(router.state.location.search, "?sort=priceAsc");
  } finally {
    router.dispose();
    client.clear();
  }
});
test("all effective filters isolate query caches and late responses cannot overwrite newer filters", async () => {
  const client = new QueryClient();
  const a = filters("?search=alpha"),
    b = filters("?search=bravo");
  let release;
  const pending = client.fetchQuery({
    queryKey: productListKey(a),
    queryFn: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  try {
    await client.fetchQuery({
      queryKey: productListKey(b),
      queryFn: async () => ({
        ...page,
        items: [{ ...product, name: "Bravo" }],
      }),
    });
    release({ ...page, items: [{ ...product, name: "Alpha" }] });
    await pending;
    assert.equal(client.getQueryData(productListKey(b)).items[0].name, "Bravo");
    for (const query of [
      "category=Home",
      "minPrice=1",
      "maxPrice=50",
      "sort=priceAsc",
      "page=2",
      "limit=24",
    ])
      assert.notDeepEqual(
        productListKey(filters("?" + query)),
        productListKey(filters()),
      );
  } finally {
    client.clear();
  }
});
test("listing renders loading, empty, results, validation and safe error/retry states", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  });
  try {
    assert.ok(markup(client).includes("Loading products"));
    client.setQueryData(productListKey(filters()), {
      ...page,
      items: [],
      total: 0,
      totalPages: 0,
    });
    assert.ok(markup(client).includes("No products match"));
    client.setQueryData(productListKey(filters()), page);
    const html = markup(client);
    assert.ok(html.includes("1 products found"));
    assert.ok(html.includes("/products/" + product._id));
    assert.ok(html.includes('aria-label="Product pages"'));
    assert.ok(
      markup(client, "?minPrice=20&maxPrice=10").includes('role="alert"'),
    );
    const failed = filters("?search=failed");
    await assert.rejects(
      client.fetchQuery({
        queryKey: productListKey(failed),
        queryFn: async () => {
          throw new Error("private diagnostic");
        },
      }),
    );
    const errorHtml = markup(client, "?search=failed");
    assert.ok(errorHtml.includes("Try Again"));
    assert.ok(!errorHtml.includes("private diagnostic"));
  } finally {
    client.clear();
  }
});
test("list API sends effective filters and abort signal; detail API keeps its existing contract", async () => {
  const signal = new AbortController().signal;
  const calls = [];
  api.get = async (...args) => {
    calls.push(args);
    return { data: args[0] === "/products" ? page : product };
  };
  assert.deepEqual(
    await productService.getAll(
      filters("?category=Home&sort=priceAsc"),
      signal,
    ),
    page,
  );
  assert.equal(calls[0][1].params.category, "Home");
  assert.equal(calls[0][1].params.search, undefined);
  assert.equal(calls[0][1].signal, signal);
  assert.deepEqual(await productService.getById(product._id), product);
  assert.deepEqual(calls[1], ["/products/" + product._id]);
});
