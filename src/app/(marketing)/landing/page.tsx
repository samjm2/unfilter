import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
          Unfilter
        </p>
        <h1 className="mt-3 text-display text-[clamp(32px,5vw,56px)] text-[var(--text-primary)]">
          See Skin Clearly.
        </h1>
        <p className="mt-3 text-[16px] text-[var(--text-secondary)]">
          Privacy-first digital skin literacy for teens.
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-flex px-5 py-3 text-[15px]">
          Open App
        </Link>
      </div>
    </main>
  );
}
