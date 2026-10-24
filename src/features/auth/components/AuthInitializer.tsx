import { useQueryClient } from "@tanstack/react-query";
import { clearCustomerCache } from "../utils/customerSession";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";

interface AuthInitializerProps {
  children: ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const setUser = useAuthStore((state) => state.setUser);

  const logout = useAuthStore((state) => state.logout);

  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);

  const initializedToken = useRef<string | null>(null);

  useEffect(() => {
    // No stored token: allow guest access.
    if (!token) {
      setAuthLoading(false);
      return;
    }

    // Avoid duplicate initialization for same token.
    if (initializedToken.current === token) {
      return;
    }

    initializedToken.current = token;

    let active = true;

    const restoreSession = async () => {
      setAuthLoading(true);

      try {
        const user = await authService.getMe();

        if (!active) return;

        // Ignore an outdated request after logout
        // or a different login.
        if (useAuthStore.getState().token !== token) {
          return;
        }

        setUser(user);
      } catch (error) {
        if (!active) return;

        if (useAuthStore.getState().token !== token) {
          return;
        }

        // Only invalidate session on authentication failure.
        const status =
          typeof error === "object" && error !== null && "response" in error
            ? (
                error as {
                  response?: { status?: number };
                }
              ).response?.status
            : undefined;

        if (status === 401) {
          clearCustomerCache(queryClient);
          logout(true);
        } else {
          // Network/server failure: keep saved token.
          // The user can retry after connectivity returns.
          setAuthLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      active = false;
      initializedToken.current = null;
    };
  }, [token, setUser, logout, setAuthLoading, queryClient]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Restoring your session...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
