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
const storage = new Map();
const previousStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);
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
};
const apiPath = require.resolve("../src/shared/lib/api.ts");
const apiModule = new Module(apiPath);
apiModule.exports = { api };
apiModule.loaded = true;
require.cache[apiPath] = apiModule;
const { useAuthStore } = require("../src/features/auth/store/authStore.ts");
const { useCart } = require("../src/features/cart/hooks/useCart.ts");
const {
  isUnavailable,
} = require("../src/features/cart/services/cartService.ts");
const CartPage = require("../src/features/cart/pages/CartPage.tsx").default;
const CheckoutPage =
  require("../src/features/checkout/pages/CheckoutPage.tsx").default;
const h = React.createElement;
const id = "abcdef012345abcdef012345";
const productId = "012345abcdef012345abcdef";
const token = "fixture-token";
const key = ["cart", token];
const product = {
  _id: productId,
  name: "Fixture item",
  price: 25,
  stock: 5,
  isActive: true,
  images: [],
};
const snapshot = {
  _id: id,
  user: id,
  version: 1,
  items: [{ productId, product, quantity: 1 }],
};
const clients = [];
function client(cart = snapshot) {
  useAuthStore.setState({
    token,
    user: {
      _id: id,
      name: "Fixture",
      email: "fixture@example.test",
      isAdmin: false,
    },
    isAuthLoading: false,
  });
  // SSR reads the initial snapshot rather than the live state. Supply the same
  // signed-in fixture there; this modifies only this isolated test process.
  Object.assign(useAuthStore.getInitialState(), useAuthStore.getState());
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(key, cart);
  clients.push(queryClient);
  return queryClient;
}
function render(queryClient, Component) {
  return renderToStaticMarkup(
    h(
      QueryClientProvider,
      { client: queryClient },
      h(MemoryRouter, null, h(Component)),
    ),
  );
}
function actions(queryClient) {
  let result;
  function Probe() {
    result = useCart();
    return null;
  }
  render(queryClient, Probe);
  return result;
}
afterEach(() => {
  while (clients.length) clients.pop().clear();
});
require("node:test").after(() => {
  if (previousStorage)
    Object.defineProperty(globalThis, "localStorage", previousStorage);
  else delete globalThis.localStorage;
});

test("orphaned rows stay visible and checkout blocks unavailable items", () => {
  for (const item of [
    { productId, product: null, quantity: 1 },
    { productId, product: { ...product, isActive: false }, quantity: 1 },
    { productId, product: { ...product, stock: 0 }, quantity: 1 },
    { productId, product, quantity: 6 },
  ]) {
    const queryClient = client({ ...snapshot, items: [item] });
    assert.equal(isUnavailable(item), true);
    const cart = render(queryClient, CartPage);
    if (item.product === null) {
      assert.match(cart, /Product no longer available/);
      assert.match(cart, /Remove unavailable item/);
    }
    assert.match(cart, /aria-disabled="true"/);
    const checkout = render(queryClient, CheckoutPage);
    assert.match(checkout, /Review and remove them in your cart/);
    assert.match(checkout, /<button[^>]*type="submit"[^>]*disabled=""/);
  }
});

test("removing an orphan sends its stable ID and reviewed revision, without dereferencing null", async () => {
  const queryClient = client({
    ...snapshot,
    items: [{ productId, product: null, quantity: 1 }],
  });
  let payload;
  api.put = async (path, body) => {
    assert.equal(path, "/cart");
    payload = body;
    return { data: { ...snapshot, version: 2, items: [] } };
  };
  await actions(queryClient).removeFromCart(productId);
  assert.deepEqual(payload, { cartId: id, version: 1, items: [] });
  assert.equal(queryClient.getQueryData(key).version, 2);
  assert.equal(queryClient.getQueryData(key).items.length, 0);
});

test("409 errors refetch authoritative state, expose a recovery message, and do not replay writes", async () => {
  const queryClient = client();
  const authoritative = {
    ...snapshot,
    version: 2,
    items: [{ productId, product, quantity: 3 }],
  };
  let writes = 0;
  let reads = 0;
  api.get = async () => {
    reads++;
    return { data: authoritative };
  };
  api.put = async () => {
    writes++;
    throw new AxiosError("Conflict", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 409,
      data: {
        message:
          "Your cart changed. Reload it, review your items, and try again.",
      },
      headers: {},
      statusText: "Conflict",
    });
  };
  const observer = new QueryObserver(queryClient, {
    queryKey: key,
    queryFn: async () => (await api.get()).data,
    staleTime: Infinity,
  });
  const unsubscribe = observer.subscribe(() => {});
  try {
    await assert.rejects(
      actions(queryClient).changeQuantity(productId, 2),
      /Your cart changed/,
    );
    assert.equal(writes, 1);
    assert.equal(reads, 1);
    assert.deepEqual(queryClient.getQueryData(key), authoritative);
  } finally {
    unsubscribe();
  }
});

test("an older successful mutation response cannot replace newer cached cart state", async () => {
  const queryClient = client();
  const latest = {
    ...snapshot,
    version: 3,
    items: [{ productId, product, quantity: 4 }],
  };
  api.put = async () => {
    queryClient.setQueryData(key, latest);
    return { data: { ...snapshot, version: 2 } };
  };
  await actions(queryClient).changeQuantity(productId, 2);
  assert.deepEqual(queryClient.getQueryData(key), latest);
});
