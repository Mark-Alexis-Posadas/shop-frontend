import { forgetCheckoutPayloads } from "../../checkout/utils/checkoutAttempt";
import { isAxiosError, type AxiosInstance } from "axios";
import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

const isPrivateKey = (key: readonly unknown[]) =>
  ["cart", "orders", "cart-update"].includes(String(key[0]));
export function clearCustomerCache(client: QueryClient) {
  forgetCheckoutPayloads();
  const predicate = (query: { queryKey: readonly unknown[] }) =>
    isPrivateKey(query.queryKey);
  void client.cancelQueries({ predicate });
  client.removeQueries({ predicate });
  for (const mutation of client.getMutationCache().getAll()) {
    if (
      mutation.options.mutationKey &&
      isPrivateKey(mutation.options.mutationKey)
    )
      client.getMutationCache().remove(mutation);
  }
}
export function handleCustomerAuthFailure(
  error: unknown,
  client: QueryClient,
): boolean {
  if (!isAxiosError(error) || error.response?.status !== 401) return false;
  const path = error.config?.url?.split("?")[0] ?? "";
  if (!/^\/(?:cart(?:\/.*)?|orders(?:\/.*)?|auth\/me)$/.test(path))
    return false;
  const token = useAuthStore.getState().token;
  if (
    !token ||
    error.config?.headers.get("Authorization") !== `Bearer ${token}`
  )
    return false;
  // A late response from account A must never log out a newly authenticated B.
  clearCustomerCache(client);
  useAuthStore.getState().logout(true);
  return true;
}
export function installCustomerSessionRecovery(
  api: AxiosInstance,
  client: QueryClient,
) {
  const id = api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      handleCustomerAuthFailure(error, client);
      return Promise.reject(error);
    },
  );
  return () => api.interceptors.response.eject(id);
}
