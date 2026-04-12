"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconShield } from "@/components/icons";
import { applyPreferencesToDocument, getDefaultPreferences } from "@/features/settings/preferences";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    applyPreferencesToDocument(getDefaultPreferences());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (data.ok) {
        setSubmitted(true);
      } else {
        setErrors(data.errors || ["Something went wrong."]);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

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
            Forgot your
            <span className="gradient-text"> password?</span>
          </h1>
          <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            No problem. We&apos;ll send a reset link to your email — it expires
            in one hour.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-[var(--accent-dark)]">
          <IconShield size={16} />
          <span className="font-semibold">Your skin data stays on your device</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--accent)]">
              <span className="text-white text-[16px] font-bold" style={{ fontFamily: "Fraunces" }}>U</span>
            </div>
            <span className="text-display text-[20px] text-[var(--text-primary)]">Unfilter</span>
          </div>

          {submitted ? (
            <div className="animate-fade-up">
              <h2 className="text-display text-[28px] text-[var(--text-primary)] mb-2">
                Check your email
              </h2>
              <p className="text-[15px] text-[var(--text-secondary)] mb-8">
                If an account exists for that email, a password reset link has
                been sent. The link expires in one hour.
              </p>
              <Link
                href="/login"
                className="inline-block font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="animate-fade-up">
                <h2 className="text-display text-[28px] text-[var(--text-primary)] mb-2">
                  Reset your password
                </h2>
                <p className="text-[15px] text-[var(--text-secondary)] mb-8">
                  Enter the email associated with your account and we&apos;ll
                  send you a reset link.
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-4 text-[16px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="mt-8 text-center text-[14px] text-[var(--text-tertiary)] animate-fade-in stagger-3">
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
                >
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
