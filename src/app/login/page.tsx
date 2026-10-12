"use client";

import { Suspense, useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { IconShield } from "@/components/icons";
import { applyPreferencesToDocument, getDefaultPreferences } from "@/features/settings/preferences";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [showVerified, setShowVerified] = useState(false);
  const [showResetDone, setShowResetDone] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    applyPreferencesToDocument(getDefaultPreferences());
  }, []);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setShowVerified(true);
    }
    if (searchParams.get("reset") === "true") {
      setShowResetDone(true);
    }
    const err = searchParams.get("error");
    if (err === "invalid_token") setErrors(["Invalid verification link."]);
    if (err === "expired_token") setErrors(["Verification link has expired. Please sign up again."]);
    if (err === "missing_token") setErrors(["Missing verification token."]);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setNeedsVerification(false);

    const result = await login(email.trim().toLowerCase(), password);
    if (result.ok) {
      router.replace("/");
    } else {
      setErrors(result.errors || ["Login failed."]);
      if (result.needsVerification) setNeedsVerification(true);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-10">
        <Logo size={40} />
      </div>

      <div className="animate-fade-up">
        <h2 className="text-display text-[28px] text-[var(--text-primary)] mb-2">
          Welcome back
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] mb-8">
          Log in to access your private skin journal and tools.
        </p>
      </div>

      {/* Verified banner */}
      {showVerified && (
        <div className="card-gradient-sage rounded-[var(--radius-md)] px-5 py-4 mb-6 animate-fade-up">
          <p className="text-[14px] font-medium text-[var(--accent-dark)]">
            Email verified! You can now log in.
          </p>
        </div>
      )}

      {/* Reset done banner */}
      {showResetDone && (
        <div className="card-gradient-sage rounded-[var(--radius-md)] px-5 py-4 mb-6 animate-fade-up">
          <p className="text-[14px] font-medium text-[var(--accent-dark)]">
            Password reset. Log in with your new password.
          </p>
        </div>
      )}

      {/* Needs verification banner */}
      {needsVerification && (
        <div className="rounded-[var(--radius-md)] bg-[var(--amber-light)] border border-[var(--amber)]/20 px-5 py-4 mb-6 animate-fade-up">
          <p className="text-[14px] font-medium text-[var(--amber)]">
            Check your email for a verification link before logging in.
          </p>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && !needsVerification && (
        <div className="rounded-[var(--radius-md)] bg-[var(--coral-light)] border border-[var(--coral)]/20 px-5 py-4 mb-6 animate-fade-up">
          {errors.map((e, i) => (
            <p key={i} className="text-[14px] font-medium text-[var(--coral)]">{e}</p>
          ))}
        </div>
      )}

      {/* OAuth buttons */}
      <div className="space-y-3 animate-fade-up stagger-1">
        <a
          href="/api/oauth/signin/google"
          className="w-full flex items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>
        <a
          href="/api/oauth/signin/microsoft-entra-id"
          className="w-full flex items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
        >
          <svg width="18" height="18" viewBox="0 0 23 23">
            <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
            <rect x="12" y="1" width="10" height="10" fill="#7fba00"/>
            <rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>
            <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
          </svg>
          Continue with Microsoft
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6 animate-fade-up stagger-1">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[12px] font-medium text-[var(--text-muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up stagger-1">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)] transition"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)] transition"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-4 text-[16px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="mt-8 text-center text-[14px] text-[var(--text-tertiary)] animate-fade-in stagger-3">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
        >
          Sign up
        </Link>
      </p>

      {/* Privacy note */}
      <p className="mt-6 text-center text-[12px] text-[var(--text-muted)] leading-relaxed animate-fade-in stagger-4">
        Your login credentials are stored securely with bcrypt hashing.
        <br />
        Your skin data never leaves your device.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-[#e8f0eb] to-[#d4e5da] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--accent)]/[0.06]" />
        <div className="absolute bottom-16 -left-16 w-48 h-48 rounded-full bg-[var(--accent)]/[0.04]" />

        <div>
          <div className="flex items-center gap-3 mb-16">
            <Logo size={44} />
          </div>

          <h1 className="text-display text-[clamp(32px,4vw,44px)] text-[var(--text-primary)] mb-4 max-w-md">
            Your skin is already
            <span className="gradient-text"> doing its job.</span>
          </h1>
          <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Private skin health guidance and confidence tools.
            Everything runs on your device. Nothing is uploaded. Ever.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-[var(--accent-dark)]">
          <IconShield size={16} />
          <span className="font-semibold">100% on-device processing</span>
          <span className="text-[var(--accent)]/60">·</span>
          <span>No cloud. No tracking. No ads.</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)]">
        <Suspense fallback={
          <div className="text-center">
            <p className="text-[14px] text-[var(--text-tertiary)]">Loading…</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
