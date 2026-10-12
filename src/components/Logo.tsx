import Image from "next/image";

/** Brand mark (public/logo.png) with optional wordmark. `size` is the mark height in px. */
export function Logo({ size = 32, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image src="/logo.png" alt="Unfilter" width={Math.round(size / 0.73)} height={size} priority />
      {wordmark && (
        <span className="text-display text-[var(--text-primary)]" style={{ fontSize: Math.round(size * 0.56) }}>
          Unfilter
        </span>
      )}
    </span>
  );
}
