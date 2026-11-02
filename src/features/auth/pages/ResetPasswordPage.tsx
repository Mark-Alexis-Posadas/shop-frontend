import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";

export default function ResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    if (searchParams.has("token")) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSettled: () => {
      submitting.current = false;
    },
  });
  const validPassword =
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || mutation.isPending || !token) return;
    submitting.current = true;
    mutation.mutate({ token, password });
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LockKeyhole size={23} aria-hidden="true" />
        </div>
        {mutation.isSuccess ? (
          <div role="status" aria-live="polite">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={20} aria-hidden="true" />
              <p className="text-sm font-semibold">Password updated</p>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              You’re all set
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your password has been changed. Sign in with your new password.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Secure your account
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Set a new password
            </h1>
            {!token ? (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700"
              >
                This reset link is invalid or expired. Request a new link to
                continue.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      aria-describedby="reset-password-help"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((shown) => !shown)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p
                    id="reset-password-help"
                    className="mt-2 text-xs text-slate-500"
                  >
                    Use at least 8 characters, including an uppercase letter and
                    a number.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                {mutation.isError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
                  >
                    The reset link is invalid or expired, or the password could
                    not be changed. Request a new link and try again.
                  </p>
                )}
                {password && confirmation && password !== confirmation && (
                  <p role="alert" className="text-sm text-rose-700">
                    Passwords do not match.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={
                    mutation.isPending ||
                    !validPassword ||
                    password !== confirmation
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mutation.isPending ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />{" "}
                      Updating password...
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            )}
          </>
        )}
        <Link
          to="/login"
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
        </Link>
      </div>
    </section>
  );
}
