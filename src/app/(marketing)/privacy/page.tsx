// Privacy Policy — Unfilter

import Link from "next/link";

export const metadata = {
  title: "Privacy — Unfilter",
  description: "How Unfilter handles (and mostly doesn't handle) your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[color:color-mix(in_srgb,var(--bg-primary)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/landing" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent)]">
              <span className="text-[13px] font-bold text-white" style={{ fontFamily: "Fraunces, serif" }}>U</span>
            </div>
            <span className="text-display text-[18px] text-[var(--text-primary)]">Unfilter</span>
          </Link>
          <Link href="/landing" className="text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            ← Back
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] mb-3">Privacy</p>
        <h1 className="text-display text-[clamp(32px,5vw,52px)] leading-[1.05] text-[var(--text-primary)] mb-6">
          We built Unfilter so you wouldn&apos;t have to hand over your face.
        </h1>
        <p className="text-[15px] text-[var(--text-tertiary)] mb-12">Last updated: May 25, 2026</p>

        <div className="space-y-10 text-[16px] leading-[1.8] text-[var(--text-secondary)]">
          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>The short version</h2>
            <p>Your photos never leave your device. Your journal, routine, and lab edits stay in your browser. The only thing we store on a server is what we absolutely need to log you in: your email, a one-way hash of your password, and a session token. That&apos;s it.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>What we don&apos;t collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Photos.</strong> Every check-in, every Distortion Lab run, every Filter Detector scan happens in your browser using JavaScript and canvas APIs. No image data is ever sent to a server. You can prove this — open DevTools, watch the Network tab while you take a check-in. There&apos;s nothing there.</li>
              <li><strong>Journal entries.</strong> Stored in your browser&apos;s localStorage and IndexedDB. Only on your device.</li>
              <li><strong>Routine and product data.</strong> Same: local to your browser.</li>
              <li><strong>Skin metrics.</strong> Computed locally, stored locally.</li>
              <li><strong>Analytics, trackers, ad pixels.</strong> None.</li>
              <li><strong>Location, contacts, microphone, anything else.</strong> Not asked for, not received.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>What we do collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email address</strong> — so you can log in and reset your password.</li>
              <li><strong>Username</strong> — what we greet you with.</li>
              <li><strong>A bcrypt hash of your password</strong> — never the password itself.</li>
              <li><strong>A session token</strong> — a signed JWT stored as an httpOnly cookie called <code className="text-[14px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">unfilter_session</code>. Used to keep you logged in.</li>
              <li><strong>An email verification token</strong> — deleted once you verify.</li>
            </ul>
            <p className="mt-3">All of this lives in a local SQLite database at <code className="text-[14px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">data/auth.db</code> on the server.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Cookies</h2>
            <p>One cookie: <code className="text-[14px] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">unfilter_session</code>. It&apos;s httpOnly, secure in production, and SameSite=Lax. We don&apos;t use third-party cookies. There&apos;s no cookie banner because there&apos;s nothing to consent to beyond the login cookie itself.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Children</h2>
            <p>Unfilter is for ages 13 and up. The onboarding age gate blocks anyone who enters an age under 13. We don&apos;t knowingly collect data from children under 13. If you believe a child under 13 has created an account, email us and we&apos;ll delete it.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Deleting your account</h2>
            <p>Go to <strong>Settings → Delete Account</strong>. We&apos;ll remove your row from the auth database immediately. Your on-device data (journal, routines, lab edits) can be cleared by clearing your browser storage for this site.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Sharing your data</h2>
            <p>We don&apos;t. There&apos;s nothing to sell, nothing to share. We don&apos;t use ad networks, we don&apos;t use analytics SaaS, we don&apos;t have an investor pitch deck saying &ldquo;monetize the data later.&rdquo;</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Email</h2>
            <p>We use SMTP to send verification and password-reset emails. The email service handles the email in transit. We don&apos;t use it for marketing.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Changes to this policy</h2>
            <p>If we change this policy in a meaningful way, we&apos;ll bump the &ldquo;last updated&rdquo; date and, where we can, notify you by email.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>Contact</h2>
            <p>Questions, requests, takedowns: <a className="text-[var(--accent)] underline" href="mailto:samayamantri@gmail.com">samayamantri@gmail.com</a>.</p>
          </section>
        </div>
      </article>

      <footer className="border-t border-[var(--border-light)] px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 text-[11px] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Unfilter · Privacy-first skin literacy for teens</p>
          <p>Educational guidance only · Not medical advice</p>
        </div>
      </footer>
    </main>
  );
}
