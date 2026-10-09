import { api } from "../../../shared/lib/api";
import type { AuthUser } from "../store/authStore";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>("/auth/me");
    return data;
  },
};
