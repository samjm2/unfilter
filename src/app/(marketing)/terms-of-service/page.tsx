// Terms of Service — Unfilter

import Link from "next/link";

export const metadata = {
  title: "Terms — Unfilter",
  description: "Terms of service for using Unfilter.",
};

export default function TermsPage() {
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
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] mb-3">Terms of Service</p>
        <h1 className="text-display text-[clamp(32px,5vw,52px)] leading-[1.05] text-[var(--text-primary)] mb-6">
          The rules, in plain English.
        </h1>
        <p className="text-[15px] text-[var(--text-tertiary)] mb-12">Last updated: May 25, 2026</p>

        <div className="space-y-10 text-[16px] leading-[1.8] text-[var(--text-secondary)]">
          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>1. Using Unfilter means accepting this</h2>
            <p>By creating an account or using Unfilter, you agree to these terms. If you don&apos;t agree, don&apos;t use it.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>2. You have to be at least 13</h2>
            <p>Unfilter is built for teens, but US privacy law (COPPA) means we can&apos;t collect data from kids under 13. The onboarding age gate enforces this. If you&apos;re under 18, please use Unfilter with your parent or guardian&apos;s awareness.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>3. Your account</h2>
            <p>You&apos;re responsible for keeping your password safe. One account per person. Don&apos;t share your login. If you think someone got into your account, change your password and let us know.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>4. Acceptable use</h2>
            <p>Use Unfilter for yourself. Don&apos;t:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Upload photos of other people without their permission.</li>
              <li>Try to reverse-engineer, scrape, or attack the service.</li>
              <li>Use Unfilter to harass anyone or harm yourself.</li>
              <li>Pretend to be someone else.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>5. Unfilter is not medical advice</h2>
            <p className="font-semibold text-[var(--text-primary)]">This is the important one. Read it twice.</p>
            <p className="mt-3">Unfilter is an educational and self-reflection tool. The check-in metrics are computed from pixel data, not from a trained medical model. They are not a diagnosis. They are not a treatment plan. They cannot tell you whether something on your skin is acne, eczema, allergy, infection, or something more serious.</p>
            <p className="mt-3">If something on your skin is painful, spreading, bleeding, or worrying you — talk to a real dermatologist or doctor. If you are struggling with how you feel about your body or your appearance, talk to a trusted adult or a counselor. The Help page inside the app lists crisis resources.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>6. Your content stays yours</h2>
            <p>Your photos, journal entries, routines, and notes belong to you. We don&apos;t claim ownership over any of it. Most of it never reaches us anyway — it stays on your device.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>7. No warranties</h2>
            <p>Unfilter is provided &ldquo;as is.&rdquo; We try hard to make it accurate and reliable, but we can&apos;t promise it will always be available, error-free, or that any specific measurement is correct. You use it at your own discretion.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>8. Limitation of liability</h2>
            <p>To the maximum extent allowed by law, the developer of Unfilter is not liable for any indirect, incidental, or consequential damages from using (or being unable to use) the app. If something goes wrong, the most you&apos;re entitled to is stopping using the service.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>9. Ending the relationship</h2>
            <p>You can delete your account anytime under Settings → Delete Account. We can suspend or end accounts that break these terms.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>10. Changes</h2>
            <p>We&apos;ll update these terms as the app evolves. When we do, the &ldquo;last updated&rdquo; date at the top changes. Significant changes will be flagged in-app or by email.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>11. Governing law</h2>
            <p>These terms are governed by the laws of the State of Illinois, USA. Any dispute will be handled in the state or federal courts located in Lake County, Illinois.</p>
          </section>

          <section>
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)] mb-3" style={{ fontFamily: "Fraunces, serif" }}>12. Contact</h2>
            <p>Questions: <a className="text-[var(--accent)] underline" href="mailto:samayamantri@gmail.com">samayamantri@gmail.com</a>.</p>
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
