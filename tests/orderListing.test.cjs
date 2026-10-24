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
    throw new Error("Unexpected GET");
  },
  post: async () => {
    throw new Error("Unexpected POST");
  },
};
const apiPath = require.resolve("../src/shared/lib/api.ts");
const apiModule = new Module(apiPath);
apiModule.exports = { api };
apiModule.loaded = true;
require.cache[apiPath] = apiModule;
const { createMemoryRouter, RouterProvider } = require("react-router-dom");
const {
  readOrderFilters,
  updateOrderParams,
  myOrdersKey,
  orderHistoryReturnTo,
} = require("../src/features/orders/utils/orderFilters.ts");
const { useCancelOrder } = require("../src/features/orders/hooks/useOrders.ts");
const {
  orderService,
} = require("../src/features/orders/services/orderService.ts");
const MyOrdersPage =
  require("../src/features/orders/pages/MyOrdersPage.tsx").default;
const h = React.createElement;
const order = {
  _id: "abcdef012345abcdef012345",
  user: "012345abcdef012345abcdef",
  items: [
    {
      product: "abcdef012345abcdef012345",
      name: "Fixture",
      sku: "FIX",
      price: 10,
      quantity: 1,
    },
  ],
  paymentMethod: "COD",
  orderStatus: "confirmed",
  paymentStatus: "unpaid",
  total: 10,
  createdAt: "2026-01-01T00:00:00Z",
};
const page = { items: [order], total: 21, page: 1, limit: 10, totalPages: 3 };
const filters = (query = "") =>
  readOrderFilters(new URLSearchParams(query)).filters;
function render(client, search = "") {
  return renderToStaticMarkup(
    h(
      QueryClientProvider,
      { client },
      h(
        MemoryRouter,
        { initialEntries: ["/orders" + search] },
        h(MyOrdersPage),
      ),
    ),
  );
}
test("order filter URL changes reset page, preserve remaining filters, and validate unsupported values", () => {
  const current = new URLSearchParams(
    "orderStatus=confirmed&paymentStatus=unpaid&sort=oldest&page=3&limit=20",
  );
  assert.equal(readOrderFilters(current).error, "");
  for (const changes of [
    { orderStatus: "pending" },
    { paymentStatus: "paid" },
    { sort: "newest" },
  ]) {
    const next = updateOrderParams(current, changes);
    assert.equal(next.get("page"), null);
    assert.equal(next.get("limit"), "20");
  }
  assert.equal(updateOrderParams(current, { page: "2" }).get("page"), "2");
  assert.equal(
    updateOrderParams(current, { orderStatus: "" }).get("orderStatus"),
    null,
  );
  for (const query of [
    "page=0",
    "limit=51",
    "sort=unknown",
    "orderStatus=unknown",
    "paymentStatus=refunded",
    "page=1&page=2",
    "user=other",
  ])
    assert.ok(readOrderFilters(new URLSearchParams(query)).error, query);
});
test("memory-router back/forward restores URL filters and safe history-return state", async () => {
  const client = new QueryClient();
  const query =
    "?orderStatus=confirmed&paymentStatus=unpaid&sort=oldest&page=2";
  client.setQueryData(myOrdersKey(filters(query)), { ...page, page: 2 });
  const router = createMemoryRouter(
    [
      { path: "/orders", element: h(MyOrdersPage) },
      { path: "/orders/:id", element: h("p", null, "Detail") },
    ],
    { initialEntries: ["/orders" + query] },
  );
  const markup = () =>
    renderToStaticMarkup(
      h(QueryClientProvider, { client }, h(RouterProvider, { router })),
    );
  try {
    const html = markup();
    assert.ok(html.includes('value="oldest" selected=""'));
    assert.ok(html.includes("Page 2 of 3"));
    assert.ok(html.includes("/orders/" + order._id));
    await router.navigate("/orders?paymentStatus=paid");
    await router.navigate(-1);
    assert.equal(router.state.location.search, query);
    assert.ok(markup().includes("Page 2 of 3"));
    await router.navigate(1);
    assert.equal(router.state.location.search, "?paymentStatus=paid");
    await router.navigate("/orders/" + order._id, {
      state: { returnTo: "/orders" + query },
    });
    assert.equal(
      orderHistoryReturnTo(router.state.location.state),
      "/orders" + query,
    );
    for (const returnTo of [
      "https://example.test",
      "//example.test",
      "/orders/other",
      "/admin/orders",
    ])
      assert.equal(orderHistoryReturnTo({ returnTo }), "/orders");
  } finally {
    router.dispose();
    client.clear();
  }
});
test("all filter parameters isolate caches and late responses cannot overwrite a newer filter", async () => {
  const client = new QueryClient();
  const a = filters("?orderStatus=pending"),
    b = filters("?orderStatus=confirmed");
  let release;
  const pending = client.fetchQuery({
    queryKey: myOrdersKey(a),
    queryFn: () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  });
  try {
    await client.fetchQuery({
      queryKey: myOrdersKey(b),
      queryFn: async () => page,
    });
    release({ ...page, total: 5 });
    await pending;
    assert.equal(client.getQueryData(myOrdersKey(b)).total, 21);
    for (const query of [
      "page=2",
      "limit=20",
      "orderStatus=delivered",
      "paymentStatus=paid",
      "sort=oldest",
    ])
      assert.notDeepEqual(
        myOrdersKey(filters("?" + query)),
        myOrdersKey(filters()),
      );
  } finally {
    client.clear();
  }
});
test("loading, empty, out-of-range, validation and retry states retain usable filters", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  });
  try {
    assert.ok(render(client).includes("Loading your orders"));
    assert.ok(render(client).includes("Reset Filters"));
    client.setQueryData(myOrdersKey(filters()), {
      ...page,
      items: [],
      total: 0,
      totalPages: 0,
    });
    assert.ok(render(client).includes("No orders on this page"));
    const beyond = "?page=9";
    client.setQueryData(myOrdersKey(filters(beyond)), {
      ...page,
      items: [],
      page: 9,
    });
    const html = render(client, beyond);
    assert.ok(html.includes("21 matching orders"));
    assert.ok(html.includes("Previous"));
    const singleItemFilters = filters("?limit=1");
    client.setQueryData(myOrdersKey(singleItemFilters), {
      ...page,
      limit: 1,
      total: 10001,
      totalPages: 10001,
    });
    const boundedHtml = render(client, "?limit=1");
    assert.ok(boundedHtml.includes("Go to page 10000"));
    assert.ok(!boundedHtml.includes("Go to page 10001"));
    assert.ok(render(client, "?page=0").includes('role="alert"'));
    const failed = filters("?paymentStatus=paid");
    await assert.rejects(
      client.fetchQuery({
        queryKey: myOrdersKey(failed),
        queryFn: async () => {
          throw new Error("private diagnostic");
        },
      }),
    );
    const errorHtml = render(client, "?paymentStatus=paid");
    assert.ok(errorHtml.includes("Try Again"));
    assert.ok(errorHtml.includes("Reset Filters"));
    assert.ok(!errorHtml.includes("private diagnostic"));
  } finally {
    client.clear();
  }
});
test("cancellation invalidates every filtered history page and preserves the detail response", async () => {
  const client = new QueryClient();
  let mutation;
  function Probe() {
    mutation = useCancelOrder();
    return null;
  }
  renderToStaticMarkup(h(QueryClientProvider, { client }, h(Probe)));
  const keys = [
    myOrdersKey(filters()),
    myOrdersKey(filters("?orderStatus=confirmed&page=2")),
  ];
  for (const key of keys) client.setQueryData(key, page);
  api.post = async (url, body) => {
    assert.equal(url, "/orders/" + order._id + "/cancel");
    assert.deepEqual(body, { confirmed: true });
    return { data: { ...order, orderStatus: "cancelled" } };
  };
  try {
    await mutation.mutateAsync(order._id);
    for (const key of keys)
      assert.equal(client.getQueryState(key).isInvalidated, true);
    assert.equal(
      client.getQueryData(["orders", "detail", order._id]).orderStatus,
      "cancelled",
    );
  } finally {
    client.clear();
  }
});
test("customer list API sends filter values and abort signal while detail contracts remain unchanged", async () => {
  const calls = [];
  const signal = new AbortController().signal;
  api.get = async (...args) => {
    calls.push(args);
    return { data: args[0] === "/orders/my" ? page : order };
  };
  assert.deepEqual(
    await orderService.getMyOrders(
      filters("?orderStatus=confirmed&sort=oldest"),
      signal,
    ),
    page,
  );
  assert.equal(calls[0][1].params.orderStatus, "confirmed");
  assert.equal(calls[0][1].params.paymentStatus, undefined);
  assert.equal(calls[0][1].signal, signal);
  assert.deepEqual(await orderService.getOrderById(order._id), order);
  assert.deepEqual(calls[1], ["/orders/" + order._id]);
});
