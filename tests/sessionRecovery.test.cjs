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

const axios = require("axios");
const storage = new Map();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
});
const api = {
  get: async () => {
    throw new Error("Unexpected GET");
  },
  put: async () => {
    throw new Error("Unexpected PUT");
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
const { useAuthStore } = require("../src/features/auth/store/authStore.ts");
const {
  clearCustomerCache,
  handleCustomerAuthFailure,
  installCustomerSessionRecovery,
} = require("../src/features/auth/utils/customerSession.ts");
const {
  safeCustomerDestination,
  authReturnDestination,
} = require("../src/features/auth/utils/authNavigation.ts");
const { useCart } = require("../src/features/cart/hooks/useCart.ts");
const { useCancelOrder } = require("../src/features/orders/hooks/useOrders.ts");
const ProtectedRoute =
  require("../src/features/auth/components/ProtectedRoute.tsx").default;
const ProductDetailPage =
  require("../src/features/products/pages/ProductDetailPage.tsx").default;
const {
  ProductImage,
} = require("../src/shared/components/ui/ProductImage.tsx");
const { requestErrorMessage } = require("../src/shared/lib/requestError.ts");
const {
  createMemoryRouter,
  RouterProvider,
  Routes,
  Route,
} = require("react-router-dom");
const h = React.createElement;
const id = "abcdef012345abcdef012345";
const user = {
  _id: id,
  name: "Fixture",
  email: "fixture@example.test",
  isAdmin: false,
};
const product = {
  _id: id,
  name: "Fixture Product",
  category: "Home",
  sku: "FIX",
  price: 10,
  stock: 3,
  isActive: true,
  images: [],
  description: "Fixture",
  tags: [],
  lowStockThreshold: 0,
};
const cart = {
  _id: id,
  user: id,
  version: 1,
  items: [{ productId: id, product, quantity: 1 }],
};
const clients = [];
function client() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, retryOnMount: false, staleTime: Infinity },
    },
  });
  clients.push(client);
  return client;
}
function auth(token, account = user) {
  useAuthStore.setState({
    token,
    user: token ? account : null,
    isAuthLoading: false,
    sessionExpired: false,
  });
  Object.assign(useAuthStore.getInitialState(), useAuthStore.getState());
}
function render(client, component, path = "/products/" + id) {
  return renderToStaticMarkup(
    h(
      QueryClientProvider,
      { client },
      h(MemoryRouter, { initialEntries: [path] }, component),
    ),
  );
}
function probe(client, hook) {
  let result;
  function Probe() {
    result = hook();
    return null;
  }
  render(client, h(Probe));
  return result;
}
function failure(status, path = "/orders/my", token = "fixture-A") {
  const config = {
    url: path,
    headers: new axios.AxiosHeaders({ Authorization: "Bearer " + token }),
  };
  return new axios.AxiosError(
    "fixture failure",
    "ERR_BAD_REQUEST",
    config,
    undefined,
    status
      ? { status, statusText: "Fixture", data: {}, headers: {}, config }
      : undefined,
  );
}
afterEach(() => {
  for (const c of clients.splice(0)) c.clear();
  auth(null);
  storage.clear();
});
test("confirmed matching 401 clears credentials and private caches once while preserving product discovery", async () => {
  auth("fixture-A");
  const c = client();
  c.setQueryData(["products", "list", { search: "chair" }], [product]);
  c.setQueryData(["cart", "fixture-A"], cart);
  c.setQueryData(["orders", "my"], [{ user: id }]);
  const instance = axios.create({
    adapter: async (config) => {
      throw failure(401, config.url, "fixture-A");
    },
  });
  const eject = installCustomerSessionRecovery(instance, c);
  try {
    await assert.rejects(instance.get("/orders/my"));
  } finally {
    eject();
  }
  assert.equal(useAuthStore.getState().token, null);
  assert.equal(useAuthStore.getState().sessionExpired, true);
  assert.equal(c.getQueryData(["cart", "fixture-A"]), undefined);
  assert.equal(c.getQueryData(["orders", "my"]), undefined);
  assert.ok(c.getQueryData(["products", "list", { search: "chair" }]));
  assert.equal(handleCustomerAuthFailure(failure(401), c), false);
  assert.equal(JSON.parse(storage.get("shopsphere-auth")).state.token, null);
});
test("network, server, 403, bad login and public request errors never expire the session", () => {
  auth("fixture-A");
  const c = client();
  c.setQueryData(["orders", "my"], [user]);
  for (const error of [
    failure(undefined),
    failure(403),
    failure(500),
    failure(401, "/auth/login"),
    failure(401, "/auth/register"),
    failure(401, "/products"),
  ])
    assert.equal(handleCustomerAuthFailure(error, c), false);
  assert.equal(useAuthStore.getState().token, "fixture-A");
  assert.ok(c.getQueryData(["orders", "my"]));
});
test("a late 401 from account A cannot expire account B", () => {
  auth("fixture-B", { ...user, _id: "012345abcdef012345abcdef" });
  const c = client();
  c.setQueryData(["orders", "my"], ["B"]);
  assert.equal(handleCustomerAuthFailure(failure(401), c), false);
  assert.equal(useAuthStore.getState().token, "fixture-B");
  assert.deepEqual(c.getQueryData(["orders", "my"]), ["B"]);
});
test("safe auth destinations reject external, malformed, admin and auth-loop URLs", () => {
  for (const input of [
    "https://example.test",
    "//example.test",
    "/\\example.test",
    "/login",
    "/register",
    "/admin/orders",
    "/products/../orders",
    "/products/%2e%2e/orders",
    "/orders\n",
    { pathname: "/checkout", search: "https://example.test" },
    null,
  ])
    assert.equal(
      safeCustomerDestination(input),
      "/products",
      JSON.stringify(input),
    );
  for (const path of [
    "/",
    "/products?search=chair&page=2",
    "/products/" + id,
    "/cart",
    "/checkout",
    "/orders?orderStatus=pending",
    "/orders/" + id,
  ])
    assert.equal(safeCustomerDestination(path), path);
  assert.deepEqual(
    authReturnDestination({
      from: {
        pathname: "/products/" + id,
        search: "",
        hash: "",
        state: { returnTo: "/products?search=chair" },
      },
    }),
    { to: "/products/" + id, state: { returnTo: "/products?search=chair" } },
  );
});
test("checkout and product destinations survive login/register memory-router navigation", async () => {
  const router = createMemoryRouter(
    [{ path: "*", element: h("p", null, "Fixture") }],
    { initialEntries: ["/checkout"] },
  );
  try {
    await router.navigate("/login", {
      state: { from: router.state.location },
      replace: true,
    });
    const destination = authReturnDestination(router.state.location.state);
    assert.equal(destination.to, "/checkout");
    await router.navigate("/register", {
      state: { from: destination.to },
      replace: true,
    });
    await router.navigate(
      authReturnDestination(router.state.location.state).to,
      { replace: true },
    );
    assert.equal(router.state.location.pathname, "/checkout");
  } finally {
    router.dispose();
  }
});
test("unverified retained credentials show retry guidance rather than an expired-session redirect", () => {
  auth("fixture-A", null);
  const c = client();
  const html = render(c, h(ProtectedRoute), "/checkout");
  assert.ok(html.includes("Retry session check"));
  assert.equal(useAuthStore.getState().token, "fixture-A");
});
test("guest product details guide sign-in without cart requests; unavailable stock cannot be added", async () => {
  auth(null);
  const c = client();
  c.setQueryData(["products", id], product);
  let reads = 0;
  api.get = async () => {
    reads++;
    return { data: cart };
  };
  const view = () =>
    render(
      c,
      h(
        Routes,
        null,
        h(Route, {
          path: "/products/:productId",
          element: h(ProductDetailPage),
        }),
      ),
    );
  const html = view();
  assert.ok(html.includes("Sign in to add to cart"));
  assert.ok(html.includes("Nothing will be added automatically"));
  assert.equal(reads, 0);
  c.setQueryData(["products", id], { ...product, stock: 0 });
  const soldOut = view();
  assert.ok(soldOut.includes("Out of Stock"));
  assert.ok(!soldOut.includes("Sign in to add to cart"));
});
test("missing images render accessible fallback and unavailable product requests retain a way back", async () => {
  const fallback = renderToStaticMarkup(h(ProductImage, { alt: "Fixture" }));
  assert.ok(fallback.includes("Image unavailable"));
  assert.ok(fallback.includes('role="img"'));
  const c = client();
  await assert.rejects(
    c.fetchQuery({
      queryKey: ["products", id],
      queryFn: async () => {
        throw failure(404, "/products/" + id);
      },
    }),
  );
  const html = render(
    c,
    h(
      Routes,
      null,
      h(Route, { path: "/products/:productId", element: h(ProductDetailPage) }),
    ),
  );
  assert.ok(html.includes("Product unavailable"));
  assert.ok(html.includes("Back to products"));
});
test("late cart write from A cannot recreate private data after logout/account switch", async () => {
  auth("fixture-A");
  const c = client();
  c.setQueryData(["cart", "fixture-A"], cart);
  const actions = probe(c, useCart);
  let release, ready;
  const started = new Promise((resolve) => {
    ready = resolve;
  });
  api.put = async () => {
    ready();
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const pending = actions.changeQuantity(id, 2);
  await started;
  clearCustomerCache(c);
  useAuthStore.getState().logout();
  auth("fixture-B");
  c.setQueryData(["cart", "fixture-B"], { ...cart, user: "B" });
  release({ data: { ...cart, version: 2 } });
  await pending;
  assert.equal(c.getQueryData(["cart", "fixture-A"]), undefined);
  assert.equal(c.getQueryData(["cart", "fixture-B"]).user, "B");
});
test("late cancellation cannot repopulate account A order data into account B cache", async () => {
  auth("fixture-A");
  const c = client();
  const actions = probe(c, useCancelOrder);
  let release, ready;
  const started = new Promise((resolve) => {
    ready = resolve;
  });
  api.post = async () => {
    ready();
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const pending = actions.mutateAsync(id);
  await started;
  clearCustomerCache(c);
  auth("fixture-B");
  c.setQueryData(["orders", "my"], ["B"]);
  release({ data: { _id: id, orderStatus: "cancelled" } });
  await pending;
  assert.equal(c.getQueryData(["orders", "detail", id]), undefined);
  assert.deepEqual(c.getQueryData(["orders", "my"]), ["B"]);
});
test("pending cart updates reject duplicate submissions without altering revision protection", async () => {
  auth("fixture-A");
  const c = client();
  c.setQueryData(["cart", "fixture-A"], cart);
  const actions = probe(c, useCart);
  let release,
    ready,
    writes = 0;
  const started = new Promise((resolve) => {
    ready = resolve;
  });
  api.put = async () => {
    writes++;
    ready();
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const pending = actions.changeQuantity(id, 2);
  await started;
  await assert.rejects(actions.changeQuantity(id, 3), /already in progress/);
  release({ data: { ...cart, version: 2 } });
  await pending;
  assert.equal(writes, 1);
});
test("actionable errors distinguish network, forbidden and authentication failures", () => {
  assert.match(
    requestErrorMessage(failure(undefined), "Fallback"),
    /connection/,
  );
  assert.match(requestErrorMessage(failure(403), "Fallback"), /not permitted/);
  assert.match(requestErrorMessage(failure(401), "Fallback"), /sign in/);
  assert.equal(
    requestErrorMessage(failure(500), "Try again safely"),
    "Try again safely",
  );
});
