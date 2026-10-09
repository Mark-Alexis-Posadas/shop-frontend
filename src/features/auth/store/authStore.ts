import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthLoading: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthLoading: true,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthLoading: false,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthLoading: false,
        }),

      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthLoading: false,
        }),
    }),
    {
      name: "shopsphere-auth",

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        token: state.token,
      }),
    },
  ),
);
