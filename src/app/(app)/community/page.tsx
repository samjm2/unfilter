import { AppShell } from "@/components/AppShell";

export default function CommunityPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-display text-[clamp(24px,3.5vw,36px)] text-[var(--text-primary)]">
          Trusted Circle
        </h1>
        <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
          This area is intentionally minimal while Unfilter focuses on Distortion Lab, Barrier Safety Copilot, and Confidence &amp; Skin Journal.
        </p>
      </div>
    </AppShell>
  );
}
