"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store";
import { IconShield, IconCheck } from "@/components/icons";

export default function SignupPage() {
  const router = useRouter();
  const { loading } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [autoVerified, setAutoVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    // Client-side validation
    const clientErrors: string[] = [];
    if (username.length < 3) clientErrors.push("Username must be at least 3 characters.");
    if (!/^[a-zA-Z0-9_]+$/.test(username)) clientErrors.push("Username: letters, numbers, and underscores only.");
    if (!hasMinLength) clientErrors.push("Password must be at least 8 characters.");
    if (!passwordsMatch) clientErrors.push("Passwords don't match.");

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (data.ok) {
        if (data.autoVerified) {
          // Dev mode — account is already verified, go straight to login
          setAutoVerified(true);
          setSuccess(true);
          // Auto-redirect to login after a moment
          setTimeout(() => router.push("/login?verified=true"), 1500);
        } else {
          // Production — needs email verification
          setAutoVerified(false);
          setSuccess(true);
        }
      } else {
        setErrors(data.errors || ["Signup failed."]);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
    }
    setIsSubmitting(false);
  };

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-[var(--bg-primary)]">
        <div className="w-full max-w-[440px] text-center animate-scale-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--accent-light)] mx-auto mb-6">
            <IconCheck size={32} className="text-[var(--accent)]" />
          </div>
          {autoVerified ? (
            <>
              <h1 className="text-display text-[28px] text-[var(--text-primary)] mb-3">
                Account created!
              </h1>
              <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-6">
                Redirecting you to login…
              </p>
              <Link href="/login?verified=true" className="btn-primary inline-flex">
                Go to Login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-display text-[28px] text-[var(--text-primary)] mb-3">
                Check your email
              </h1>
              <p className="text-[16px] text-[var(--text-secondary)] leading-relaxed mb-2">
                We sent a verification link to
              </p>
              <p className="text-[16px] font-semibold text-[var(--text-primary)] mb-6">
                {email}
              </p>
              <p className="text-[14px] text-[var(--text-tertiary)] leading-relaxed mb-8">
                Click the link in the email to verify your account, then come back to log in.
                The link expires in 24 hours.
              </p>
              <Link href="/login" className="btn-primary inline-flex">
                Go to Login
              </Link>
              <p className="mt-6 text-[12px] text-[var(--text-muted)]">
                Didn&apos;t get the email? Check your spam folder.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 bg-gradient-to-br from-[#f3efe8] to-[#e8e1d6] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-[var(--accent)]/[0.05]" />
        <div className="absolute bottom-24 -right-12 w-40 h-40 rounded-full bg-[var(--amber)]/[0.05]" />

        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20">
              <span className="text-white text-[17px] font-bold" style={{ fontFamily: "Fraunces" }}>U</span>
            </div>
            <span className="text-display text-[22px] text-[var(--text-primary)]">Unfilter</span>
          </div>

          <h1 className="text-display text-[clamp(28px,3.5vw,40px)] text-[var(--text-primary)] mb-4 max-w-md">
            See your skin.
            <br />
            <span className="gradient-text">Not a filter.</span>
          </h1>
          <p className="text-[17px] text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Real guidance. No judgment. No data collection.
            Just you and honest information about your skin.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3">
          {[
            "On-device AI — photos never uploaded",
            "No ads, no affiliate links, no sponsors",
            "Built by teens, for teens",
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] shrink-0">
                <IconCheck size={12} className="text-white" />
              </div>
              <span className="text-[14px] font-medium text-[var(--text-secondary)]">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)]">
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
              Create your account
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)] mb-8">
              Your skin data stays on your device. We only store your login.
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-[var(--radius-md)] bg-[var(--coral-light)] border border-[var(--coral)]/20 px-5 py-4 mb-6 animate-fade-up">
              {errors.map((e, i) => (
                <p key={i} className="text-[14px] font-medium text-[var(--coral)]">{e}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-up stagger-1">
            {/* Username */}
            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="coolskinperson"
                maxLength={24}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-light)] transition"
              />
              <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                3-24 characters. Letters, numbers, underscores.
              </p>
            </div>

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
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
                Password
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

              {/* Strength indicators */}
              {password.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <StrengthCheck label="At least 8 characters" met={hasMinLength} />
                  <StrengthCheck label="One uppercase letter" met={hasUppercase} />
                  <StrengthCheck label="One number" met={hasNumber} />
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full rounded-[var(--radius-md)] border bg-white px-4 py-3.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 transition ${
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "border-[var(--coral)] focus:ring-[var(--coral-light)]"
                    : confirmPassword.length > 0 && passwordsMatch
                      ? "border-[var(--accent)] focus:ring-[var(--accent-light)]"
                      : "border-[var(--border)] focus:ring-[var(--accent-light)] focus:border-[var(--accent)]"
                }`}
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-1.5 text-[12px] text-[var(--coral)]">Passwords don&apos;t match.</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loading || !hasMinLength || !passwordsMatch}
              className="w-full btn-primary py-4 text-[16px] mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-[14px] text-[var(--text-tertiary)] animate-fade-in stagger-3">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
            >
              Log in
            </Link>
          </p>

          <p className="mt-6 text-center text-[12px] text-[var(--text-muted)] leading-relaxed animate-fade-in stagger-4">
            We only store your username, email, and hashed password.
            <br />
            All skin data stays on your device.
          </p>
        </div>
      </div>
    </div>
  );
}

function StrengthCheck({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full transition ${
          met ? "bg-[var(--accent)]" : "bg-[var(--warm-300)]"
        }`}
      >
        {met && <IconCheck size={10} className="text-white" />}
      </div>
      <span
        className={`text-[12px] transition ${
          met ? "text-[var(--accent)] font-medium" : "text-[var(--text-muted)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
