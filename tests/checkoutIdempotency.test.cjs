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

const { webcrypto } = require("node:crypto");
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const storage = new Map();
const authStorage = new Map();
for (const [name, values] of [
  ["sessionStorage", storage],
  ["localStorage", authStorage],
])
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  });
const api = {
  get: async () => {
    throw new Error("Unexpected GET");
  },
};
const apiPath = require.resolve("../src/shared/lib/api.ts");
const apiModule = new Module(apiPath);
apiModule.exports = { api };
apiModule.loaded = true;
require.cache[apiPath] = apiModule;
const {
  submitCheckoutAttempt,
  readCheckoutAttempt,
  finishCheckoutAttempt,
  forgetCheckoutPayloads,
  checkoutPayload,
  confirmedCheckoutFailure,
} = require("../src/features/checkout/utils/checkoutAttempt.ts");
const { useAuthStore } = require("../src/features/auth/store/authStore.ts");
const {
  orderService,
} = require("../src/features/orders/services/orderService.ts");
const CheckoutPage =
  require("../src/features/checkout/pages/CheckoutPage.tsx").default;
const h = React.createElement;
const userId = "abcdef012345abcdef012345";
const input = {
  cartId: "012345abcdef012345abcdef",
  version: 1,
  paymentMethod: "COD",
  shippingAddress: {
    fullName: "Private Fixture Customer",
    phone: "09123456789",
    addressLine1: "Private Test Address",
    city: "Manila",
    province: "Manila",
    postalCode: "1000",
  },
};
const order = {
  _id: "111111111111111111111111",
  orderStatus: "pending",
  paymentMethod: "COD",
  paymentStatus: "unpaid",
};
const networkFailure = () => new AxiosError("Lost response", "ERR_NETWORK");
function httpFailure(status, code) {
  return new AxiosError("Fixture", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: { code },
    headers: {},
    config: {},
    statusText: "Fixture",
  });
}
afterEach(() => {
  forgetCheckoutPayloads();
  storage.clear();
  authStorage.clear();
});
test("uncertain network retry uses exactly the same key/payload and recovers the original order", async () => {
  const calls = [];
  let fail = true;
  const send = async (payload) => {
    calls.push(payload);
    if (fail) {
      fail = false;
      throw networkFailure();
    }
    return order;
  };
  await assert.rejects(submitCheckoutAttempt(userId, input, send));
  const attempt = readCheckoutAttempt(userId);
  assert.equal(attempt.outcome, "uncertain");
  assert.deepEqual(await submitCheckoutAttempt(userId, input, send), order);
  assert.deepEqual(calls[1], calls[0]);
  assert.equal(calls.length, 2);
  assert.equal(readCheckoutAttempt(userId).key, attempt.key);
  finishCheckoutAttempt(userId, attempt.key);
  assert.equal(readCheckoutAttempt(userId), null);
});
test("rapid duplicate submissions issue one request while the first is pending", async () => {
  let release,
    ready,
    count = 0;
  const started = new Promise((resolve) => {
    ready = resolve;
  });
  const pending = submitCheckoutAttempt(userId, input, async () => {
    count++;
    ready();
    return new Promise((resolve) => {
      release = resolve;
    });
  });
  await started;
  await assert.rejects(
    submitCheckoutAttempt(userId, input, async () => {
      count++;
      return order;
    }),
    /already in progress/,
  );
  release(order);
  await pending;
  assert.equal(count, 1);
});
test("changed details cannot silently create a second attempt after an uncertain response", async () => {
  await assert.rejects(
    submitCheckoutAttempt(userId, input, async () => {
      throw networkFailure();
    }),
  );
  const key = readCheckoutAttempt(userId).key;
  let sends = 0;
  await assert.rejects(
    submitCheckoutAttempt(
      userId,
      {
        ...input,
        shippingAddress: { ...input.shippingAddress, city: "Other" },
      },
      async () => {
        sends++;
        return order;
      },
    ),
    /unresolved/,
  );
  assert.equal(sends, 0);
  assert.equal(readCheckoutAttempt(userId).key, key);
});
test("refresh recovery persists identity/hash without address data and can reconstruct the same retry", async () => {
  await assert.rejects(
    submitCheckoutAttempt(userId, input, async () => {
      throw networkFailure();
    }),
  );
  const key = readCheckoutAttempt(userId).key;
  const serialized = [...storage.values()].join("");
  for (const value of [
    "shippingAddress",
    "fullName",
    input.shippingAddress.fullName,
    input.shippingAddress.phone,
    input.shippingAddress.addressLine1,
  ])
    assert.ok(!serialized.includes(value));
  forgetCheckoutPayloads();
  assert.equal(checkoutPayload(userId), null);
  assert.equal(readCheckoutAttempt(userId).key, key);
  let request;
  await submitCheckoutAttempt(userId, input, async (payload) => {
    request = payload;
    return order;
  });
  assert.equal(request.idempotencyKey, key);
});
test("confirmed failures remain distinguishable and a new key requires intentional completion/reset", async () => {
  const failure = httpFailure(400);
  await assert.rejects(
    submitCheckoutAttempt(userId, input, async () => {
      throw failure;
    }),
  );
  const first = readCheckoutAttempt(userId);
  assert.equal(first.outcome, "failed");
  assert.equal(
    confirmedCheckoutFailure(httpFailure(409, "CART_CONFLICT")),
    true,
  );
  for (const error of [
    networkFailure(),
    httpFailure(500),
    httpFailure(503, "CHECKOUT_RETRYABLE"),
    httpFailure(409, "CHECKOUT_KEY_CONFLICT"),
    httpFailure(401),
  ])
    assert.equal(confirmedCheckoutFailure(error), false);
  finishCheckoutAttempt(userId, first.key);
  await submitCheckoutAttempt(userId, input, async () => order);
  assert.notEqual(readCheckoutAttempt(userId).key, first.key);
});
test("account switching never reuses another account's attempt and clears in-memory addresses", async () => {
  await assert.rejects(
    submitCheckoutAttempt(userId, input, async () => {
      throw networkFailure();
    }),
  );
  const a = readCheckoutAttempt(userId);
  forgetCheckoutPayloads();
  assert.equal(checkoutPayload(userId), null);
  const other = "222222222222222222222222";
  assert.equal(readCheckoutAttempt(other), null);
  await submitCheckoutAttempt(
    other,
    { ...input, cartId: "333333333333333333333333" },
    async () => order,
  );
  assert.notEqual(readCheckoutAttempt(other).key, a.key);
  assert.equal(readCheckoutAttempt(userId).key, a.key);
});
test("an account change during async fingerprint preparation aborts before sending or retaining an address", async () => {
  let calls = 0;
  await assert.rejects(
    submitCheckoutAttempt(
      userId,
      input,
      async () => {
        calls++;
        return order;
      },
      () => false,
    ),
    /account changed/,
  );
  assert.equal(calls, 0);
  assert.equal(readCheckoutAttempt(userId), null);
  assert.equal(checkoutPayload(userId), null);
});
test("an uncertain attempt remains recoverable when checkout's cart is already empty", async () => {
  await assert.rejects(
    submitCheckoutAttempt(userId, input, async () => {
      throw networkFailure();
    }),
  );
  forgetCheckoutPayloads();
  useAuthStore.setState({
    token: "fixture-token",
    user: {
      _id: userId,
      name: "Fixture",
      email: "fixture@example.test",
      isAdmin: false,
    },
    isAuthLoading: false,
  });
  Object.assign(useAuthStore.getInitialState(), useAuthStore.getState());
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(["cart", "fixture-token"], {
    _id: input.cartId,
    version: 2,
    user: userId,
    items: [],
  });
  try {
    const html = renderToStaticMarkup(
      h(
        QueryClientProvider,
        { client },
        h(MemoryRouter, { initialEntries: ["/checkout"] }, h(CheckoutPage)),
      ),
    );
    assert.ok(html.includes("Check order"));
    assert.ok(html.includes("View My Orders"));
    assert.ok(!html.includes("Your cart is empty"));
    assert.ok(!html.includes("Retry same checkout"));
  } finally {
    client.clear();
  }
});
test("checking a stored key requests the authenticated recovery endpoint without submitting another order", async () => {
  let calls = 0;
  api.get = async (url) => {
    calls++;
    assert.equal(url, "/orders/checkout-attempts/fixture-key-0000000001");
    return { data: order };
  };
  assert.deepEqual(
    await orderService.getCheckoutAttempt("fixture-key-0000000001"),
    order,
  );
  assert.equal(calls, 1);
});
