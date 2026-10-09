import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async ({ user, token }) => {
      queryClient.clear();
      setAuth(user, token);
      navigate("/products", { replace: true });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const errorMessage = axios.isAxiosError(loginMutation.error)
    ? loginMutation.error.response?.data?.message
    : undefined;

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:py-20">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-2">
        {/* Left promotional panel */}
        <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-12 text-white lg:flex">
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-10 top-28 h-52 w-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <ShoppingBag size={22} />
              </span>
              ShopSphere.
            </Link>
          </div>

          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-indigo-100 backdrop-blur">
              <Sparkles size={14} />
              Your shopping journey starts here
            </div>

            <h2 className="max-w-sm text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              Everything you love,
              <span className="block text-indigo-200">all in one place.</span>
            </h2>

            <p className="mt-6 max-w-sm text-base leading-7 text-indigo-100/80">
              Discover amazing products, save your favorites, and enjoy a
              seamless shopping experience.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Your account, your experience
                </p>
                <p className="text-xs text-indigo-200">
                  Manage your orders and shopping cart
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-indigo-200/70">
            © {new Date().getFullYear()} ShopSphere.
          </p>
        </div>

        {/* Right login form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 lg:py-16">
          <div className="mb-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 lg:hidden">
              <ShoppingBag size={24} />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Welcome to ShopSphere
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-slate-400 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* API error */}
            {loginMutation.isError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                />

                <p>
                  {typeof errorMessage === "string"
                    ? errorMessage
                    : "Unable to sign in. Please try again."}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to your account
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-indigo-600 transition hover:text-indigo-800 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-10 border-t border-slate-100 pt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-indigo-600"
            >
              <ArrowLeft size={14} />
              Back to shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
