// Only actual storefront routes can be auth destinations. Never accept auth or admin routes.
export function safeCustomerDestination(
  input: unknown,
  fallback = "/products",
): string {
  let raw: string;
  if (typeof input === "string") raw = input;
  else if (
    input &&
    typeof input === "object" &&
    "pathname" in input &&
    typeof input.pathname === "string"
  ) {
    const search = "search" in input ? input.search : "",
      hash = "hash" in input ? input.hash : "";
    if (
      typeof search !== "string" ||
      typeof hash !== "string" ||
      (search && !search.startsWith("?")) ||
      (hash && !hash.startsWith("#"))
    )
      return fallback;
    raw = input.pathname + search + hash;
  } else return fallback;
  if (
    raw.length > 2048 ||
    raw.includes("\\") ||
    Array.from(raw).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    )
  )
    return fallback;
  const pathname = raw.split(/[?#]/, 1)[0];
  if (
    !/^(?:\/|\/products(?:\/[a-fA-F0-9]{24})?|\/cart|\/checkout|\/orders(?:\/[a-fA-F0-9]{24})?)$/.test(
      pathname,
    )
  )
    return fallback;
  return raw;
}
export function authReturnDestination(state: unknown): {
  to: string;
  state?: { returnTo: string };
} {
  if (!state || typeof state !== "object" || !("from" in state))
    return { to: "/products" };
  const from = state.from;
  const to = safeCustomerDestination(from);
  const nested =
    from && typeof from === "object" && "state" in from ? from.state : state;
  const candidate =
    nested && typeof nested === "object" && "returnTo" in nested
      ? nested.returnTo
      : undefined;
  const returnTo = safeCustomerDestination(candidate, "");
  return { to, ...(returnTo ? { state: { returnTo } } : {}) };
}
