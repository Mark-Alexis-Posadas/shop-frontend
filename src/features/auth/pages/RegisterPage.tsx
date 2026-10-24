import { authReturnDestination } from "../utils/authNavigation";
import { clearCustomerCache } from "../utils/customerSession";
import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export default function RegisterPage() {
  const submittingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = authReturnDestination(location.state);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSettled: () => {
      submittingRef.current = false;
    },
    onSuccess: ({ user, token }) => {
      clearCustomerCache(queryClient);
      setAuth(user, token);
      navigate(destination.to, { replace: true, state: destination.state });
    },
  });

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Contains a number",
      valid: /[0-9]/.test(password),
    },
  ];

  const passwordValid = passwordChecks.every((check) => check.valid);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current || registerMutation.isPending) return;

    if (registerMutation.isPending || !passwordValid) {
      return;
    }

    submittingRef.current = true;
    registerMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const errorMessage = axios.isAxiosError(registerMutation.error)
    ? registerMutation.error.response?.data?.message
    : undefined;

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:py-20">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-2">
        {/* Left branding panel */}
        <div className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-12 text-white lg:flex">
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
              Join the ShopSphere community
            </div>

            <h2 className="max-w-sm text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              Discover more.
              <span className="block text-indigo-200">Shop smarter.</span>
            </h2>

            <p className="mt-6 max-w-sm text-base leading-7 text-indigo-100/80">
              Create your account and explore products, manage your cart, and
              keep track of your shopping journey in one place.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold">Your shopping account</p>
                <p className="text-xs text-indigo-200">
                  One place for your cart and orders
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-indigo-200/70">
            © {new Date().getFullYear()} ShopSphere.
          </p>
        </div>

        {/* Right registration form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 lg:py-16">
          <div className="mb-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 lg:hidden">
              <ShoppingBag size={24} />
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Join ShopSphere
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Create an account
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your details to get started.
            </p>
          </div>

          {sessionExpired && (
            <p
              role="status"
              className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"
            >
              Your session expired. Sign in to continue where you left off.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={19}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Juan Dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
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
                  id="register-email"
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
                htmlFor="register-password"
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
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="password-requirements"
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

              {/* Password requirements */}
              <div id="password-requirements" className="mt-3 space-y-2">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className={`flex items-center gap-2 text-xs ${
                      check.valid ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        check.valid ? "bg-green-100" : "bg-slate-100"
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>

                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            {/* API error */}
            {registerMutation.isError && (
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
                    : "Registration failed. Please try again."}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending || !passwordValid}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-indigo-600/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {registerMutation.isPending ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create my account
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              state={{
                from: destination.to,
                returnTo: destination.state?.returnTo,
              }}
              className="font-bold text-indigo-600 transition hover:text-indigo-800 hover:underline"
            >
              Sign in
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
