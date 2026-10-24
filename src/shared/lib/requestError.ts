import { isAxiosError } from "axios";
export function requestErrorMessage(error: unknown, fallback: string): string {
  const candidate = error instanceof Error && error.cause ? error.cause : error;
  if (isAxiosError<{ message?: unknown }>(candidate)) {
    if (!candidate.response)
      return "Unable to reach ShopSphere. Check your connection and try again.";
    const status = candidate.response.status;
    if (status === 401) return "Please sign in again to continue.";
    if (status === 403) return "This action is not permitted for your account.";
    if (status === 429)
      return "Too many requests. Wait a moment and try again.";
    if (status >= 500) return fallback;
    const message = candidate.response.data?.message;
    if (typeof message === "string" && message.length <= 300) return message;
  }
  return error instanceof Error && !isAxiosError(candidate)
    ? error.message
    : fallback;
}
