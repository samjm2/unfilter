/*
 * Paste this entire file into the browser DevTools console while logged in as
 * the demo account (demo@unfilter.app). It seeds:
 *   - 14 days of journal entries with a believable improvement arc
 *   - A 9-day streak ending today
 *   - Lab run stats (24 total, 6 edits flagged)
 *
 * After running, reload the page. The home dashboard, Journal, and Lab pages
 * will show realistic data for the demo video.
 */

(() => {
  const DAYS = 14;
  const startMs = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const NOTES = [
    "",
    "Slept 7+ hrs, felt calmer today.",
    "",
    "Switched to gentler cleanser this morning.",
    "",
    "",
    "Stressful week — noticed a flare around chin.",
    "",
    "Forgot moisturizer last night.",
    "",
    "",
    "Drank more water this week. Skin feels less tight.",
    "",
    "",
  ];

  function entry(i) {
    const t = (DAYS - 1) - i;
    const progress = i / (DAYS - 1);
    const ease = (x) => x * x * (3 - 2 * x);
    const p = ease(progress);
    const redness = +(0.62 - p * 0.38 + (Math.random() - 0.5) * 0.05).toFixed(2);
    const texture = +(0.55 - p * 0.30 + (Math.random() - 0.5) * 0.05).toFixed(2);
    const uniformity = +(0.48 + p * 0.32 + (Math.random() - 0.5) * 0.05).toFixed(2);
    const spotCount = Math.max(0, Math.round(12 - p * 9 + (Math.random() - 0.5) * 2));
    const reliability = +(0.66 + Math.random() * 0.14).toFixed(2);
    const timestamp = startMs - t * dayMs - Math.floor(Math.random() * 6 * 60 * 60 * 1000);

    const sev = redness > 0.45 ? "medium" : redness > 0.25 ? "low" : "low";

    return {
      id: `demo-${timestamp}-${Math.floor(Math.random() * 1e6)}`,
      timestamp,
      photoDataUrl: null,
      metrics: {
        redness: Math.max(0.05, Math.min(0.95, redness)),
        texture: Math.max(0.05, Math.min(0.95, texture)),
        spotCount,
        uniformity: Math.max(0.05, Math.min(0.95, uniformity)),
        reliability,
      },
      symptoms: {
        itchOrPain: "none",
        duration: "today",
        spreading: false,
        fever: false,
        newProducts: "",
        location: "face",
        stressLevel: i < 6 ? "medium" : "low",
      },
      categories: [
        {
          name: redness > 0.4 ? "Mild redness" : "Clear/Healthy",
          confidence: 0.72 + Math.random() * 0.18,
          severity: sev,
        },
      ],
      hadRedFlags: false,
      escalationLevel: "self-care",
      note: NOTES[i] || "",
      tags: i % 4 === 0 ? ["routine"] : [],
    };
  }

  const entries = Array.from({ length: DAYS }, (_, i) => entry(i));
  entries.sort((a, b) => b.timestamp - a.timestamp);

  localStorage.setItem(
    "unfilter-journal",
    JSON.stringify({ state: { entries, _hasHydrated: true }, version: 0 }),
  );

  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem("unfilter-streak", JSON.stringify({ count: 9, lastDate: today }));

  localStorage.setItem("unfilter-lab-runs", JSON.stringify({ total: 24, edits: 6 }));

  console.log(
    `[Unfilter seed] wrote ${entries.length} journal entries, 9-day streak, 24 lab runs. Reload the page.`,
  );
})();
