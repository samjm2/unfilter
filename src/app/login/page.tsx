"use client";

import { Suspense, useState, useEffect } from "react";
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
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--accent)]">
          <span className="text-white text-[16px] font-bold" style={{ fontFamily: "Fraunces" }}>U</span>
        </div>
        <span className="text-display text-[20px] text-[var(--text-primary)]">Unfilter</span>
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
            <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20">
              <span className="text-white text-[17px] font-bold" style={{ fontFamily: "Fraunces" }}>U</span>
            </div>
            <span className="text-display text-[22px] text-[var(--text-primary)]">Unfilter</span>
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
