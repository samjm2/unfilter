"use client";

import { useMemo, useState } from "react";
import AppShell from "@/features/checkin/components/AppShell";

export default function CheckInPage() {
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  return (
    <AppShell title="New Check-in">
      <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Upload a photo</div>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Tip: crop to the affected area. (Redaction tools next.)
          </div>
        </div>

        {previewUrl && (
          <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Preview</div>
            <img
              src={previewUrl}
              alt="preview"
              style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid #f0f0f0" }}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
