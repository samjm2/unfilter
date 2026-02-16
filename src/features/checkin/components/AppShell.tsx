import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/check-in", label: "New Check-in" },
  { href: "/journal", label: "Journal" },
  { href: "/learn", label: "Learn" },
  { href: "/confidence", label: "Confidence" },
  { href: "/community", label: "Trusted Circle" },
  { href: "/settings", label: "Settings" },
];

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: 240,
          padding: 16,
          borderRight: "1px solid #eee",
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
          Unfilter
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              style={{
                textDecoration: "none",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid #f1f1f1",
              }}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Reminder</div>
          <div>
            Unfilter is educational guidance, not medical diagnosis. If you’re
            worried, ask a trusted adult or clinician.
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, padding: 24, background: "#fafafa" }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h1>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
