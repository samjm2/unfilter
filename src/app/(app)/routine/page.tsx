"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { IconShield } from "@/components/icons";
import {
  type CopilotProduct,
  type ProductCategory,
  type ProductSlot,
  type SafetyAnalysis,
  analyzeRoutine,
  getChatResponse,
  getIngredient,
  INGREDIENT_GROUPS,
  FLASHCARDS,
  SUGGESTED_ROUTINES,
} from "@/features/routine/safety-engine";

// ============================================================
// Barrier Safety Copilot — Full Page (v2)
//
// Selectable ingredients (no typing required), cross-reference
// conflict matrix, safety scoring, educational layer + chatbot.
//
// DISCLAIMER: Educational guidance only. Not medical advice.
// ============================================================

const STORAGE_KEY = "unfilter-barrier-copilot-v3";

const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "cleanser", label: "Cleanser" },
  { id: "toner", label: "Toner" },
  { id: "serum", label: "Serum" },
  { id: "treatment", label: "Treatment" },
  { id: "moisturizer", label: "Moisturizer" },
  { id: "sunscreen", label: "Sunscreen" },
  { id: "other", label: "Other" },
];

const SLOT_OPTIONS: { id: ProductSlot; label: string }[] = [
  { id: "am", label: "Morning" },
  { id: "pm", label: "Night" },
  { id: "both", label: "Both" },
];

const SEVERITY_STYLES = {
  info: { bg: "bg-[var(--accent-lighter)]", border: "border-[var(--accent-light)]", badge: "bg-[var(--accent-light)] text-[var(--accent-dark)]", label: "Info" },
  caution: { bg: "bg-[var(--gold-light)]", border: "border-[var(--gold)]/20", badge: "bg-[var(--gold-light)] text-[var(--gold)]", label: "Caution" },
  warning: { bg: "bg-[var(--coral-light)]", border: "border-[var(--coral)]/20", badge: "bg-[var(--coral-light)] text-[var(--coral)]", label: "Warning" },
} as const;

const SCORE_COLOR = (score: number) =>
  score >= 75 ? "var(--accent)" : score >= 45 ? "var(--gold)" : "var(--coral)";

const STRENGTH_STYLES = {
  mild: "bg-[var(--accent-lighter)] text-[var(--accent)]",
  moderate: "bg-[var(--gold-light)] text-[var(--gold)]",
  strong: "bg-[var(--coral-light)] text-[var(--coral)]",
} as const;

/* ---------- Main Component ---------- */

export default function BarrierCopilotPage() {
  const [products, setProducts] = useState<CopilotProduct[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "learn" | "ask">("analysis");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string; related: string[] }[]>([]);
  const [expandedFlashcard, setExpandedFlashcard] = useState<string | null>(null);

  // Draft product form
  const [draftName, setDraftName] = useState("");
  const [draftSlot, setDraftSlot] = useState<ProductSlot>("am");
  const [draftCategory, setDraftCategory] = useState<ProductCategory>("cleanser");
  const [draftFrequency, setDraftFrequency] = useState(7);
  const [draftIngredients, setDraftIngredients] = useState<Set<string>>(new Set());
  const [expandedIngGroup, setExpandedIngGroup] = useState<string | null>(null);

  // Load
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.products)) setProducts(parsed.products);
      }
    } catch { /* ignore */ }
  }, []);

  // Save
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ products }));
  }, [products]);

  const analysis: SafetyAnalysis = useMemo(() => analyzeRoutine(products), [products]);
  const amProducts = useMemo(() => products.filter((p) => p.slot === "am" || p.slot === "both"), [products]);
  const pmProducts = useMemo(() => products.filter((p) => p.slot === "pm" || p.slot === "both"), [products]);

  const toggleIngredient = useCallback((id: string) => {
    setDraftIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addProduct = useCallback(() => {
    if (!draftName.trim()) return;
    const product: CopilotProduct = {
      id: `p-${Date.now()}`,
      name: draftName.trim(),
      slot: draftSlot,
      category: draftCategory,
      selectedIngredients: [...draftIngredients],
      frequency: draftFrequency,
    };
    setProducts((prev) => [...prev, product]);
    setDraftName("");
    setDraftSlot("am");
    setDraftCategory("cleanser");
    setDraftFrequency(7);
    setDraftIngredients(new Set());
    setExpandedIngGroup(null);
    setShowAddForm(false);
  }, [draftName, draftSlot, draftCategory, draftFrequency, draftIngredients]);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const response = getChatResponse(chatInput);
    setChatHistory((prev) => [...prev, { q: chatInput, a: response.answer, related: response.relatedTopics }]);
    setChatInput("");
  }, [chatInput]);

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <header className="mb-8 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                Safety Dashboard
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-[var(--border)] to-transparent" />
            </div>
            <h1 className="text-display text-[clamp(28px,5vw,44px)] text-[var(--text-primary)] text-center">
              Barrier Safety Copilot
            </h1>
            <p className="mt-3 mx-auto max-w-xl text-center text-[15px] leading-[1.65] text-[var(--text-tertiary)]">
              Build your routine, select ingredients, and the copilot cross-checks
              every combination for potential conflicts. Educational guidance only.
            </p>
          </header>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr] animate-fade-up stagger-1">
            {/* Left: Routine Builder */}
            <div className="space-y-4">
              <div className="card-elevated p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                    Your Routine
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="rounded-[8px] bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                  >
                    {showAddForm ? "Cancel" : "+ Add Product"}
                  </button>
                </div>

                {/* Add product form */}
                {showAddForm && (
                  <div className="mb-5 rounded-[12px] bg-[var(--bg-secondary)] p-4 animate-fade-up">
                    {/* Basic info */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Product Name
                        <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          placeholder="e.g. Evening Treatment Serum"
                          className="mt-1 w-full rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[13px] text-[var(--text-primary)]"
                        />
                      </label>
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Category
                        <select
                          value={draftCategory}
                          onChange={(e) => setDraftCategory(e.target.value as ProductCategory)}
                          className="mt-1 w-full rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[13px] text-[var(--text-primary)]"
                        >
                          {PRODUCT_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        When
                        <select
                          value={draftSlot}
                          onChange={(e) => setDraftSlot(e.target.value as ProductSlot)}
                          className="mt-1 w-full rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[13px] text-[var(--text-primary)]"
                        >
                          {SLOT_OPTIONS.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-[12px] font-medium text-[var(--text-secondary)]">
                        Frequency (times/week)
                        <input
                          type="number"
                          min={1}
                          max={14}
                          value={draftFrequency}
                          onChange={(e) => setDraftFrequency(Number(e.target.value) || 1)}
                          className="mt-1 w-full rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2 text-[13px] text-[var(--text-primary)]"
                        />
                      </label>
                    </div>

                    {/* Ingredient picker */}
                    <div className="mt-4">
                      <p className="text-[12px] font-medium text-[var(--text-secondary)] mb-2">
                        Select Ingredients
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mb-3">
                        Tap categories to expand. Check the ingredients in this product.
                      </p>

                      <div className="space-y-1.5">
                        {INGREDIENT_GROUPS.map((group) => {
                          const isOpen = expandedIngGroup === group.category;
                          const selectedCount = group.items.filter((i) => draftIngredients.has(i.id)).length;
                          return (
                            <div key={group.category} className="rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-card)] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setExpandedIngGroup(isOpen ? null : group.category)}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[var(--bg-secondary)] transition"
                              >
                                <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                                  {group.label}
                                  {selectedCount > 0 && (
                                    <span className="ml-2 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                      {selectedCount}
                                    </span>
                                  )}
                                </span>
                                <svg
                                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                                  stroke="currentColor" strokeWidth="1.5"
                                  className={`text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                                >
                                  <path d="M2 4L5 7L8 4" />
                                </svg>
                              </button>
                              {isOpen && (
                                <div className="border-t border-[var(--border-light)] px-3 py-2 space-y-1">
                                  {group.items.map((item) => {
                                    const checked = draftIngredients.has(item.id);
                                    return (
                                      <label
                                        key={item.id}
                                        className={`flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 cursor-pointer transition ${
                                          checked ? "bg-[var(--accent-lighter)]" : "hover:bg-[var(--bg-secondary)]"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleIngredient(item.id)}
                                          className="accent-[var(--accent)] h-3.5 w-3.5"
                                        />
                                        <span className="text-[12px] text-[var(--text-primary)] flex-1">
                                          {item.label}
                                        </span>
                                        <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${STRENGTH_STYLES[item.strength]}`}>
                                          {item.strength}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Selected summary */}
                      {draftIngredients.size > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {[...draftIngredients].map((id) => {
                            const ing = getIngredient(id);
                            if (!ing) return null;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => toggleIngredient(id)}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STRENGTH_STYLES[ing.strength]} hover:opacity-70 transition`}
                                title="Click to remove"
                              >
                                {ing.label} &times;
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={addProduct}
                      disabled={!draftName.trim()}
                      className="mt-4 btn-primary !py-2 !px-5 text-[13px] disabled:opacity-40"
                    >
                      Add to Routine
                    </button>
                  </div>
                )}

                {/* AM / PM split */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <RoutineColumn label="Morning" slot="am" products={amProducts} onRemove={removeProduct} />
                  <RoutineColumn label="Night" slot="pm" products={pmProducts} onRemove={removeProduct} />
                </div>

                {products.length === 0 && (
                  <div className="mt-4 rounded-[10px] bg-[var(--bg-secondary)] px-4 py-6 text-center">
                    <p className="text-[13px] text-[var(--text-tertiary)]">
                      Add products to your routine to get safety analysis.
                    </p>
                  </div>
                )}
              </div>

              {/* Detected Ingredients */}
              {analysis.ingredientSummary.length > 0 && (
                <div className="card p-4 animate-fade-up">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    Ingredients in Your Routine
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.ingredientSummary.map((d, i) => (
                      <span
                        key={`${d.ingredient.id}-${i}`}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STRENGTH_STYLES[d.ingredient.strength]}`}
                      >
                        {d.ingredient.label}
                        <span className="ml-1 opacity-60">({d.productName})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Analysis + Tabs */}
            <div className="space-y-4">
              {/* Safety Score */}
              <div className="card-elevated p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    Routine Safety Score
                  </p>
                  <span className="text-[13px] font-bold" style={{ color: SCORE_COLOR(analysis.score) }}>
                    {analysis.riskLevel} Risk
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <span
                    className="text-[48px] font-bold leading-none tabular-nums"
                    style={{ color: SCORE_COLOR(analysis.score), fontFamily: "Fraunces, serif" }}
                  >
                    {analysis.score}
                  </span>
                  <span className="text-[18px] text-[var(--text-muted)] mb-1">/ 100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--warm-300)] overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${analysis.score}%`, background: SCORE_COLOR(analysis.score) }}
                  />
                </div>
                {analysis.missingElements.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-2">Missing from routine:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingElements.map((m) => (
                        <span key={m} className="rounded-full bg-[var(--warm-200)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-tertiary)]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {products.length === 0 && (
                  <p className="text-[12px] text-[var(--text-muted)]">Add products to see your safety score.</p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 rounded-[10px] bg-[var(--bg-secondary)] p-1">
                {(["analysis", "learn", "ask"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-[8px] px-3 py-2 text-[12px] font-semibold transition ${
                      activeTab === tab
                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {tab === "analysis" ? `Warnings${analysis.warnings.length > 0 ? ` (${analysis.warnings.length})` : ""}` : tab === "learn" ? "Learn" : "Ask"}
                  </button>
                ))}
              </div>

              {/* Analysis tab */}
              {activeTab === "analysis" && (
                <div className="space-y-3 animate-fade-up">
                  {analysis.warnings.length === 0 ? (
                    <div className="card p-4">
                      <div className="flex items-center gap-2">
                        <IconShield size={16} className="text-[var(--accent)]" />
                        <p className="text-[13px] font-medium text-[var(--accent-dark)]">
                          {products.length === 0
                            ? "Add products to receive safety analysis."
                            : "No conflicts detected. Your routine looks balanced."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    analysis.warnings.map((w) => {
                      const style = SEVERITY_STYLES[w.severity];
                      return (
                        <div key={w.id} className={`rounded-[12px] ${style.bg} border ${style.border} p-4`}>
                          <div className="flex items-start gap-3">
                            <span className={`shrink-0 rounded-full ${style.badge} px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mt-0.5`}>
                              {style.label}
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{w.title}</h3>
                              <p className="mt-1.5 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                                <strong>Detected:</strong> {w.detected}
                              </p>
                              <p className="mt-1.5 text-[12px] text-[var(--text-secondary)] leading-relaxed">
                                <strong>Why this matters:</strong> {w.explanation}
                              </p>
                              <p className="mt-1.5 text-[12px] text-[var(--text-tertiary)] leading-relaxed">
                                <strong>General guidance:</strong> {w.guidance}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Suggested routines */}
                  <div className="card p-4 mt-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      Example Routine Structure
                    </p>
                    <p className="mb-3 text-[11px] text-[var(--text-tertiary)]">
                      General examples, not prescriptions. Individual needs vary.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {SUGGESTED_ROUTINES.map((r) => (
                        <div key={r.label} className="rounded-[10px] bg-[var(--bg-secondary)] p-3">
                          <p className="text-[12px] font-semibold text-[var(--text-primary)] mb-2">{r.label}</p>
                          <ol className="space-y-1.5">
                            {r.steps.map((step, i) => (
                              <li key={i} className="flex gap-2 text-[11px]">
                                <span className="shrink-0 font-bold text-[var(--text-muted)]">{i + 1}.</span>
                                <span>
                                  <strong className="text-[var(--text-primary)]">{step.category}</strong>{" "}
                                  <span className="text-[var(--text-tertiary)]">— {step.description}</span>
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Learn tab */}
              {activeTab === "learn" && (
                <div className="space-y-2 animate-fade-up">
                  <p className="text-[11px] text-[var(--text-muted)] mb-2">
                    Quick lessons — each takes under 30 seconds.
                  </p>
                  {FLASHCARDS.map((card) => {
                    const isOpen = expandedFlashcard === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setExpandedFlashcard(isOpen ? null : card.id)}
                        className="w-full text-left rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-4 py-3 transition hover:border-[var(--border-hover)]"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[13px] font-semibold text-[var(--text-primary)]">{card.topic}</p>
                          <svg
                            width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
                            className={`shrink-0 text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                          >
                            <path d="M3 5L6 8L9 5" />
                          </svg>
                        </div>
                        {isOpen && (
                          <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">{card.content}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Ask tab */}
              {activeTab === "ask" && (
                <div className="space-y-3 animate-fade-up">
                  <div className="card p-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      Ask About Skincare
                    </p>
                    <p className="mb-3 text-[11px] text-[var(--text-tertiary)]">
                      Educational information only, not medical advice.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleChat()}
                        placeholder="e.g. What is retinol? Can I use vitamin C with AHA?"
                        className="flex-1 rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-2 text-[13px] text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={handleChat}
                        disabled={!chatInput.trim()}
                        className="rounded-[8px] bg-[var(--accent)] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-40"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                  {chatHistory.length > 0 && (
                    <div className="space-y-3">
                      {chatHistory.map((entry, i) => (
                        <div key={i} className="card p-4">
                          <p className="text-[12px] font-semibold text-[var(--accent-dark)] mb-2">{entry.q}</p>
                          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{entry.a}</p>
                          {entry.related.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className="text-[10px] text-[var(--text-muted)]">Related:</span>
                              {entry.related.map((r) => {
                                const flashcard = FLASHCARDS.find((f) => f.id === r);
                                return flashcard ? (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => { setActiveTab("learn"); setExpandedFlashcard(r); }}
                                    className="rounded-full bg-[var(--accent-lighter)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)] hover:bg-[var(--accent-light)] transition"
                                  >
                                    {flashcard.topic}
                                  </button>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {chatHistory.length === 0 && (
                    <div className="card p-4">
                      <p className="mb-2 text-[11px] font-semibold text-[var(--text-muted)]">Try asking:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["What is retinol?", "Why was my routine flagged?", "How often should I exfoliate?", "What is the skin barrier?"].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setChatInput(q)}
                            className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--warm-300)] transition"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy */}
              <div className="rounded-[10px] border border-[var(--accent-light)] bg-[var(--accent-lighter)] px-4 py-3">
                <div className="flex items-start gap-2">
                  <IconShield size={14} className="text-[var(--accent)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-medium text-[var(--accent-dark)]">
                      Educational guidance only — not medical advice.
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      Routine data stays on this device. Consult a dermatologist for personal concerns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* ---------- Routine Column ---------- */

function RoutineColumn({
  label,
  slot,
  products,
  onRemove,
}: {
  label: string;
  slot: "am" | "pm";
  products: CopilotProduct[];
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</p>
      <div className="space-y-2">
        {products.length === 0 ? (
          <div className="rounded-[8px] bg-[var(--bg-secondary)] px-3 py-4 text-center">
            <p className="text-[11px] text-[var(--text-muted)]">No {slot === "am" ? "morning" : "night"} products</p>
          </div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {PRODUCT_CATEGORIES.find((c) => c.id === p.category)?.label} · {p.frequency}x/week
                    {p.slot === "both" && " · AM + PM"}
                  </p>
                  {p.selectedIngredients.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.selectedIngredients.map((ingId) => {
                        const ing = getIngredient(ingId);
                        if (!ing) return null;
                        return (
                          <span
                            key={ingId}
                            className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${STRENGTH_STYLES[ing.strength]}`}
                          >
                            {ing.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="shrink-0 text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--coral)] transition mt-0.5"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
