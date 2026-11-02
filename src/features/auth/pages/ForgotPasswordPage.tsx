import { useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";

export default function ForgotPasswordPage() {
  const location = useLocation();
  const submitting = useRef(false);
  const [email, setEmail] = useState("");
  const mutation = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSettled: () => {
      submitting.current = false;
    },
  });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || mutation.isPending) return;
    submitting.current = true;
    mutation.mutate(email.trim());
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Mail size={23} aria-hidden="true" />
        </div>
        {mutation.isSuccess ? (
          <div role="status" aria-live="polite">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={20} aria-hidden="true" />
              <p className="text-sm font-semibold">Request received</p>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              If an account exists for that email, password reset instructions
              will be sent.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Account recovery
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Forgot your password?
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter the email address on your account. We’ll send a reset link
              if it matches a customer account.
            </p>
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              {mutation.isError && (
                <p
                  role="alert"
                  className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
                >
                  We couldn’t process that request. Please wait a moment and try
                  again.
                </p>
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" /> Sending
                    request...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        )}
        <Link
          to="/login"
          state={location.state}
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
        </Link>
      </div>
    </section>
  );
}
