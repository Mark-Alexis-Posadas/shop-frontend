import { isAxiosError } from "axios";
import type { CreateOrderPayload, Order } from "../../orders/types/order.types";
export interface CheckoutAttemptInfo {
  key: string;
  fingerprint: string;
  cartId: string;
  version: number;
  outcome: "uncertain" | "failed";
}
const metadata = new Map<string, CheckoutAttemptInfo>();
const payloads = new Map<string, CreateOrderPayload>();
const pending = new Set<string>();
const storageKey = (userId: string) => "shopsphere-checkout:" + userId;
export function readCheckoutAttempt(
  userId: string | null,
): CheckoutAttemptInfo | null {
  if (!userId) return null;
  if (metadata.has(userId)) return metadata.get(userId)!;
  try {
    const item: unknown = JSON.parse(
      sessionStorage.getItem(storageKey(userId)) ?? "null",
    );
    if (
      item &&
      typeof item === "object" &&
      "key" in item &&
      typeof item.key === "string" &&
      /^[A-Za-z0-9_-]{16,128}$/.test(item.key) &&
      "fingerprint" in item &&
      typeof item.fingerprint === "string" &&
      /^[a-f0-9]{64}$/.test(item.fingerprint) &&
      "cartId" in item &&
      typeof item.cartId === "string" &&
      /^[a-f0-9]{24}$/.test(item.cartId) &&
      "version" in item &&
      typeof item.version === "number" &&
      Number.isSafeInteger(item.version) &&
      item.version >= 0 &&
      "outcome" in item &&
      ["failed", "uncertain"].includes(String(item.outcome))
    ) {
      const result = item as CheckoutAttemptInfo;
      metadata.set(userId, result);
      return result;
    }
  } catch {
    /* Storage may be unavailable; in-page recovery still works. */
  }
  return null;
}
function save(userId: string, item: CheckoutAttemptInfo) {
  metadata.set(userId, item);
  try {
    sessionStorage.setItem(storageKey(userId), JSON.stringify(item));
  } catch {
    /* Memory fallback. */
  }
}
export function finishCheckoutAttempt(userId: string, key: string) {
  if (readCheckoutAttempt(userId)?.key !== key) return;
  metadata.delete(userId);
  payloads.delete(userId);
  try {
    sessionStorage.removeItem(storageKey(userId));
  } catch {
    /* Memory fallback. */
  }
}
// Logout/account switch forgets addresses but preserves non-sensitive recovery IDs.
export function forgetCheckoutPayloads() {
  payloads.clear();
  metadata.clear();
}
export function checkoutPayload(userId: string) {
  return payloads.get(userId) ?? null;
}
export function confirmedCheckoutFailure(error: unknown) {
  return (
    isAxiosError(error) &&
    (error.response?.status === 400 ||
      (error.response?.status === 409 &&
        error.response.data?.code === "CART_CONFLICT"))
  );
}
export function canonicalCheckoutPayload(
  input: CreateOrderPayload,
): CreateOrderPayload {
  const a = input.shippingAddress;
  return {
    cartId: input.cartId.toLowerCase(),
    version: input.version,
    paymentMethod: "COD",
    shippingAddress: {
      fullName: a.fullName.trim(),
      phone: a.phone.trim(),
      addressLine1: a.addressLine1.trim(),
      addressLine2: a.addressLine2?.trim() ?? "",
      city: a.city.trim(),
      province: a.province.trim(),
      postalCode: a.postalCode.trim(),
    },
  };
}
export async function submitCheckoutAttempt(
  userId: string,
  input: CreateOrderPayload,
  send: (payload: CreateOrderPayload) => Promise<Order>,
  isCurrent: () => boolean = () => true,
): Promise<Order> {
  if (pending.has(userId)) throw new Error("Checkout is already in progress.");
  pending.add(userId);
  let attempt: CheckoutAttemptInfo | null = null;
  try {
    const payload = canonicalCheckoutPayload(input);
    const previous = readCheckoutAttempt(userId);
    const key = previous?.key ?? crypto.randomUUID();
    // Salt the local payload hash with the random key; never store the address.
    const bytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(key + JSON.stringify(payload)),
    );
    const fingerprint = Array.from(new Uint8Array(bytes), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    if (!isCurrent())
      throw new Error(
        "Your account changed. Return to checkout in the current account.",
      );
    if (previous && previous.fingerprint !== fingerprint)
      throw new Error(
        "A checkout attempt is unresolved. Use its original details or check the existing order before starting another attempt.",
      );
    attempt = {
      key,
      fingerprint,
      cartId: payload.cartId,
      version: payload.version,
      outcome: "uncertain",
    };
    save(userId, attempt);
    const request = { ...payload, idempotencyKey: key };
    payloads.set(userId, request);
    return await send(request);
  } catch (error) {
    if (attempt && readCheckoutAttempt(userId)?.key === attempt.key)
      save(userId, {
        ...attempt,
        outcome: confirmedCheckoutFailure(error) ? "failed" : "uncertain",
      });
    throw error;
  } finally {
    pending.delete(userId);
  }
}
