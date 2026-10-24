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
  post: async () => {
    throw new Error("Unexpected POST");
  },
};
const apiPath = require.resolve("../src/shared/lib/api.ts");
const apiModule = new Module(apiPath);
apiModule.exports = { api };
apiModule.loaded = true;
require.cache[apiPath] = apiModule;
const {
  CancelOrderAction,
} = require("../src/features/orders/components/CancelOrderAction.tsx");
const { useCancelOrder } = require("../src/features/orders/hooks/useOrders.ts");
const h = React.createElement;
const order = {
  _id: "abcdef012345abcdef012345",
  paymentMethod: "COD",
  paymentStatus: "unpaid",
  orderStatus: "pending",
};
function render(client, component) {
  return renderToStaticMarkup(h(QueryClientProvider, { client }, component));
}
test("cancellation action is available only for eligible unpaid COD orders", () => {
  const client = new QueryClient();
  try {
    for (const status of [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ]) {
      const html = render(
        client,
        h(CancelOrderAction, { order: { ...order, orderStatus: status } }),
      );
      assert.equal(
        html.includes("Cancel order</button>"),
        ["pending", "confirmed"].includes(status),
      );
    }
    assert.equal(
      render(
        client,
        h(CancelOrderAction, { order: { ...order, paymentStatus: "paid" } }),
      ).includes("<button"),
      false,
    );
  } finally {
    client.clear();
  }
});
test("successful cancellation posts explicit confirmation and refreshes order/product caches without touching cart", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let mutation;
  function Probe() {
    mutation = useCancelOrder();
    return null;
  }
  render(client, h(Probe));
  client.setQueryData(["orders", "my"], [order]);
  client.setQueryData(["products"], []);
  client.setQueryData(["cart"], { items: [] });
  let calls = 0;
  api.post = async (url, body) => {
    calls++;
    assert.equal(url, "/orders/" + order._id + "/cancel");
    assert.deepEqual(body, { confirmed: true });
    return { data: { ...order, orderStatus: "cancelled" } };
  };
  try {
    await mutation.mutateAsync(order._id);
    assert.equal(calls, 1);
    assert.equal(
      client.getQueryData(["orders", "detail", order._id]).orderStatus,
      "cancelled",
    );
    assert.equal(client.getQueryState(["orders", "my"]).isInvalidated, true);
    assert.equal(client.getQueryState(["products"]).isInvalidated, true);
    assert.equal(client.getQueryState(["cart"]).isInvalidated, false);
  } finally {
    client.clear();
  }
});
