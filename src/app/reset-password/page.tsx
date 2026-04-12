"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconShield, IconCheck } from "@/components/icons";
import { applyPreferencesToDocument, getDefaultPreferences } from "@/features/settings/preferences";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    applyPreferencesToDocument(getDefaultPreferences());
  }, []);

  // Validate token shape client-side for nicer UX. The server is the
  // authoritative check.
  const tokenLooksValid = /^[a-f0-9]{64}$/.test(token);

  const hasMinLength = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const clientErrors: string[] = [];
    if (!hasMinLength) clientErrors.push("Password must be at least 8 characters.");
    if (!passwordsMatch) clientErrors.push("Passwords don't match.");

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.ok) {
        setSuccess(true);
        setTimeout(() => router.replace("/login?reset=true"), 1500);
      } else {
        setErrors(data.errors || ["Something went wrong."]);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tokenLooksValid) {
    return (
      <div className="w-full max-w-[400px] animate-fade-up">
        <h2 className="text-display text-[28px] text-[var(--text-primary)] mb-2">
          Invalid reset link
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] mb-8">
          This password reset link is missing or malformed. Request a new one
          to continue.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block btn-primary py-3 px-6 text-[15px]"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-[400px] animate-fade-up">
        <div className="card-gradient-sage rounded-[var(--radius-md)] px-5 py-4 mb-6 flex items-center gap-3">
          <IconCheck size={20} />
          <p className="text-[14px] font-medium text-[var(--accent-dark)]">
            Password reset. Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="animate-fade-up">
        <h2 className="text-display text-[28px] text-[var(--text-primary)] mb-2">
          Choose a new password
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] mb-8">
          Pick something you&apos;ll remember. At least 8 characters.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-[var(--radius-md)] bg-[var(--coral-light)] border border-[var(--coral)]/20 px-5 py-4 mb-6 animate-fade-up">
          {errors.map((e, i) => (
            <p key={i} className="text-[14px] font-medium text-[var(--coral)]">{e}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up stagger-1">
        <div>
          <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)] transition"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)] transition"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-4 text-[16px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-[var(--text-tertiary)] animate-fade-in stagger-3">
        <Link
          href="/login"
          className="font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
        >
          ← Back to login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-[#e8f0eb] to-[#d4e5da] relative overflow-hidden">
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
            A fresh
            <span className="gradient-text"> start.</span>
          </h1>
          <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Pick a new password and you&apos;re back in. Existing sessions on
            other devices will be signed out automatically.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-[var(--accent-dark)]">
          <IconShield size={16} />
          <span className="font-semibold">Reset links expire in 1 hour</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)]">
        <Suspense fallback={
          <div className="text-center">
            <p className="text-[14px] text-[var(--text-tertiary)]">Loading…</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
