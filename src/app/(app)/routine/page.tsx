"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { useRoutineStore } from "@/features/routine/store";
import {
  ROUTINE_TEMPLATES,
  CATEGORY_INFO,
  type Routine,
  type RoutineStep,
  type ProductCategory,
  type ProductEntry,
} from "@/features/routine/types";
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonText,
  CalloutPanel,
  SectionLabel,
} from "@/components/ui";
import { RecommendedRoutine } from "@/features/routine/RecommendedRoutine";

const TODAY = new Date().toISOString().split("T")[0];

export default function RoutinePage() {
  const {
    routines,
    products,
    logs,
    addRoutine,
    deleteRoutine,
    addStepToRoutine,
    removeStepFromRoutine,
    addProduct,
    deleteProduct,
    logRoutine,
    getStreak,
  } = useRoutineStore();

  const [view, setView] = useState<"routines" | "products" | "log">("routines");
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 animate-fade-up">
            <h1 className="text-heading text-[24px] text-[#2e2a25]">
              Routine Builder
            </h1>
            <p className="mt-1 text-[14px] text-[#8a7d6e]">
              Simple, safe routines. Build consistency. Track what works.
            </p>
          </div>

          {/* View tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-[#f0ede7] animate-fade-up stagger-1">
            {(["routines", "log", "products"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                  view === v
                    ? "bg-white text-[#2e2a25] shadow-sm"
                    : "text-[#8a7d6e] hover:text-[#5c5245]"
                }`}
              >
                {v === "routines" && "🧴 Routines"}
                {v === "log" && "✅ Daily Log"}
                {v === "products" && "📦 Product Shelf"}
              </button>
            ))}
          </div>

          {/* ============ ROUTINES TAB ============ */}
          {view === "routines" && (
            <div className="space-y-4 animate-fade-up stagger-2">
              {/* Personalized recommendation */}
              <RecommendedRoutine />

              {/* Existing routines */}
              {routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  streak={getStreak(routine.id)}
                  isEditing={editingId === routine.id}
                  onEdit={() =>
                    setEditingId(editingId === routine.id ? null : routine.id)
                  }
                  onDelete={() => deleteRoutine(routine.id)}
                  onAddStep={(step) => addStepToRoutine(routine.id, step)}
                  onRemoveStep={(stepId) =>
                    removeStepFromRoutine(routine.id, stepId)
                  }
                />
              ))}

              {/* Empty state / add routine */}
              {routines.length === 0 && !showTemplates && (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-4">🧴</span>
                  <h3 className="text-heading text-[18px] text-[#2e2a25] mb-2">
                    No routines yet
                  </h3>
                  <p className="text-[14px] text-[#8a7d6e] mb-6 max-w-xs mx-auto">
                    Start with a template or build your own from scratch.
                  </p>
                  <ButtonPrimary onClick={() => setShowTemplates(true)}>
                    Browse Templates
                  </ButtonPrimary>
                </div>
              )}

              {routines.length > 0 && !showTemplates && (
                <ButtonSecondary
                  onClick={() => setShowTemplates(true)}
                  className="w-full"
                >
                  + Add a Routine
                </ButtonSecondary>
              )}

              {/* Template picker */}
              {showTemplates && (
                <TemplatePicker
                  onSelect={(template) => {
                    const routine: Routine = {
                      ...template,
                      id: `routine-${Date.now()}`,
                      createdAt: Date.now(),
                    };
                    addRoutine(routine);
                    setShowTemplates(false);
                  }}
                  onClose={() => setShowTemplates(false)}
                />
              )}

              {/* Safety callout */}
              <CalloutPanel icon="⚠️" variant="warm">
                <strong>One at a time.</strong> If you&apos;re adding a new
                active ingredient (like retinoids or acids), introduce only one
                per 2 weeks and patch test first.
              </CalloutPanel>
            </div>
          )}

          {/* ============ DAILY LOG TAB ============ */}
          {view === "log" && (
            <div className="space-y-4 animate-fade-up stagger-2">
              {routines.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[14px] text-[#8a7d6e]">
                    Create a routine first to start logging.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[14px] font-medium text-[#2e2a25]">
                    Today — {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {routines.map((routine) => {
                    const todayLog = logs.find(
                      (l) => l.routineId === routine.id && l.date === TODAY
                    );
                    const done = todayLog?.completed ?? false;
                    const streak = getStreak(routine.id);
                    const timeIcon =
                      routine.time === "am"
                        ? "🌅"
                        : routine.time === "pm"
                          ? "🌙"
                          : "🏃";

                    return (
                      <button
                        key={routine.id}
                        onClick={() => logRoutine(routine.id, TODAY, !done)}
                        className={`w-full card p-4 text-left flex items-center gap-4 transition-all ${
                          done
                            ? "border-[#c8d9c8] bg-[#f4f7f4]"
                            : "hover:bg-[#faf8f4]"
                        }`}
                      >
                        {/* Check circle */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            done
                              ? "border-[#3d5a3d] bg-[#3d5a3d]"
                              : "border-[#d0c9bf]"
                          }`}
                        >
                          {done && (
                            <svg
                              width="16"
                              height="12"
                              viewBox="0 0 16 12"
                              fill="none"
                            >
                              <path
                                d="M2 6l4 4L14 2"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-[14px] font-semibold ${
                              done ? "text-[#3d5a3d]" : "text-[#2e2a25]"
                            }`}
                          >
                            {timeIcon} {routine.name}
                          </p>
                          <p className="text-[12px] text-[#8a7d6e]">
                            {routine.steps.length} steps
                            {streak > 0 && ` · 🔥 ${streak}-day streak`}
                          </p>
                        </div>
                        {done && (
                          <span className="text-[12px] font-semibold text-[#5c875c]">
                            Done ✓
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Week overview */}
                  <div className="card p-4">
                    <SectionLabel>This week</SectionLabel>
                    <WeekGrid routines={routines} logs={logs} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============ PRODUCT SHELF TAB ============ */}
          {view === "products" && (
            <div className="space-y-4 animate-fade-up stagger-2">
              <p className="text-[13px] text-[#8a7d6e] mb-2">
                Track what you&apos;re using and when you started. This helps
                identify what might be causing reactions.
              </p>

              {products.map((p) => (
                <div
                  key={p.id}
                  className="card p-4 flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ede7] text-[18px]">
                    {CATEGORY_INFO[p.category]?.icon ?? "✨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#2e2a25] truncate">
                      {p.name}
                    </p>
                    <p className="text-[12px] text-[#8a7d6e]">
                      Started{" "}
                      {new Date(p.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {p.notes && ` · ${p.notes}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    className="text-[12px] text-[#b0a697] hover:text-[#8b3a2a] transition"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {products.length === 0 && !showAddProduct && (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-3">📦</span>
                  <p className="text-[14px] text-[#8a7d6e] mb-4">
                    No products tracked yet.
                  </p>
                </div>
              )}

              {!showAddProduct ? (
                <ButtonSecondary
                  onClick={() => setShowAddProduct(true)}
                  className="w-full"
                >
                  + Add a Product
                </ButtonSecondary>
              ) : (
                <AddProductForm
                  onAdd={(p) => {
                    addProduct(p);
                    setShowAddProduct(false);
                  }}
                  onCancel={() => setShowAddProduct(false)}
                />
              )}
            </div>
          )}
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* ================================================================
   ROUTINE CARD
   ================================================================ */

function RoutineCard({
  routine,
  streak,
  isEditing,
  onEdit,
  onDelete,
  onAddStep,
  onRemoveStep,
}: {
  routine: Routine;
  streak: number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddStep: (step: RoutineStep) => void;
  onRemoveStep: (stepId: string) => void;
}) {
  const [showAddStep, setShowAddStep] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const timeIcon =
    routine.time === "am" ? "🌅" : routine.time === "pm" ? "🌙" : "🏃";
  const timeLabel =
    routine.time === "am"
      ? "Morning"
      : routine.time === "pm"
        ? "Evening"
        : "Post-Workout";

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[16px]">{timeIcon}</span>
            <h3 className="text-heading text-[16px] text-[#2e2a25]">
              {routine.name}
            </h3>
          </div>
          <p className="text-[12px] text-[#8a7d6e] mt-0.5">
            {timeLabel} · {routine.steps.length} steps
            {streak > 0 && ` · 🔥 ${streak}-day streak`}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="text-[12px] font-medium text-[#8a7d6e] hover:text-[#5c5245] transition"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {routine.steps
          .sort((a, b) => a.order - b.order)
          .map((step, i) => (
            <div
              key={step.id}
              className="flex items-center gap-3 rounded-xl bg-[#f7f4ef] px-3.5 py-3"
            >
              <span className="text-[11px] font-bold text-[#b0a697] w-4 text-center">
                {i + 1}
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[14px]">
                {CATEGORY_INFO[step.category]?.icon ?? "✨"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#2e2a25] truncate">
                  {step.product}
                </p>
                {step.notes && (
                  <p className="text-[11px] text-[#8a7d6e] truncate">
                    {step.notes}
                  </p>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemoveStep(step.id)}
                  className="text-[11px] text-[#b0a697] hover:text-[#8b3a2a] transition shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
      </div>

      {/* Editing controls */}
      {isEditing && (
        <div className="mt-3 space-y-2">
          {!showAddStep ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddStep(true)}
                className="flex-1 rounded-xl border border-dashed border-[#d0c9bf] py-2.5 text-[13px] font-medium text-[#8a7d6e] hover:bg-[#f7f4ef] transition"
              >
                + Add Step
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-xl border border-[#f8ddd6] px-4 py-2.5 text-[13px] font-medium text-[#8b3a2a] hover:bg-[#fef5f3] transition"
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={onDelete}
                  className="rounded-xl bg-[#8b3a2a] px-4 py-2.5 text-[13px] font-medium text-white"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          ) : (
            <AddStepForm
              nextOrder={routine.steps.length + 1}
              onAdd={(step) => {
                onAddStep(step);
                setShowAddStep(false);
              }}
              onCancel={() => setShowAddStep(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TEMPLATE PICKER
   ================================================================ */

function TemplatePicker({
  onSelect,
  onClose,
}: {
  onSelect: (t: Omit<Routine, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const timeIcon = (t: string) =>
    t === "am" ? "🌅" : t === "pm" ? "🌙" : "🏃";

  return (
    <div className="card-elevated p-5 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-heading text-[16px] text-[#2e2a25]">
          Choose a Template
        </h3>
        <button onClick={onClose} className="text-[13px] text-[#8a7d6e]">
          Cancel
        </button>
      </div>
      <div className="space-y-2">
        {ROUTINE_TEMPLATES.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelect(t)}
            className="w-full card-interactive p-3.5 text-left flex items-center gap-3"
          >
            <span className="text-[18px]">{timeIcon(t.time)}</span>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-[#2e2a25]">
                {t.name}
              </p>
              <p className="text-[12px] text-[#8a7d6e]">
                {t.steps.length} steps ·{" "}
                {t.steps.map((s) => s.product).join(", ")}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-[#c4bbb0]"
            >
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   ADD STEP FORM (inline)
   ================================================================ */

function AddStepForm({
  nextOrder,
  onAdd,
  onCancel,
}: {
  nextOrder: number;
  onAdd: (step: RoutineStep) => void;
  onCancel: () => void;
}) {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState<ProductCategory>("cleanser");
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-xl bg-[#f7f4ef] p-4 space-y-3">
      <input
        type="text"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        placeholder="Product name (e.g. CeraVe Cleanser)"
        className="w-full rounded-xl border border-[#e0dbd3] bg-white px-3 py-2.5 text-[13px] text-[#2e2a25] placeholder:text-[#c4bbb0] focus:border-[#a3bfa3] focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORY_INFO) as ProductCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
              category === cat
                ? "bg-[#3d5a3d] text-white"
                : "bg-white text-[#6b5e50] border border-[#e0dbd3]"
            }`}
          >
            {CATEGORY_INFO[cat].icon} {CATEGORY_INFO[cat].label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full rounded-xl border border-[#e0dbd3] bg-white px-3 py-2.5 text-[13px] text-[#2e2a25] placeholder:text-[#c4bbb0] focus:border-[#a3bfa3] focus:outline-none"
      />
      <div className="flex gap-2">
        <ButtonPrimary
          onClick={() => {
            if (!product.trim()) return;
            onAdd({
              id: `step-${Date.now()}`,
              product: product.trim(),
              category,
              notes: notes.trim(),
              order: nextOrder,
            });
          }}
          className="flex-1 !py-2.5 !text-[13px]"
        >
          Add Step
        </ButtonPrimary>
        <ButtonSecondary onClick={onCancel} className="!py-2.5 !text-[13px]">
          Cancel
        </ButtonSecondary>
      </div>
    </div>
  );
}

/* ================================================================
   ADD PRODUCT FORM
   ================================================================ */

function AddProductForm({
  onAdd,
  onCancel,
}: {
  onAdd: (p: ProductEntry) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("cleanser");
  const [notes, setNotes] = useState("");

  return (
    <div className="card p-4 space-y-3 animate-scale-in">
      <p className="text-[13px] font-semibold text-[#2e2a25]">
        Add a product to your shelf
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product name"
        className="w-full rounded-xl border border-[#e0dbd3] bg-white px-3 py-2.5 text-[13px] text-[#2e2a25] placeholder:text-[#c4bbb0] focus:border-[#a3bfa3] focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORY_INFO) as ProductCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
              category === cat
                ? "bg-[#3d5a3d] text-white"
                : "bg-white text-[#6b5e50] border border-[#e0dbd3]"
            }`}
          >
            {CATEGORY_INFO[cat].icon} {CATEGORY_INFO[cat].label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full rounded-xl border border-[#e0dbd3] bg-white px-3 py-2.5 text-[13px] text-[#2e2a25] placeholder:text-[#c4bbb0] focus:border-[#a3bfa3] focus:outline-none"
      />
      <div className="flex gap-2">
        <ButtonPrimary
          onClick={() => {
            if (!name.trim()) return;
            onAdd({
              id: `product-${Date.now()}`,
              name: name.trim(),
              category,
              startDate: Date.now(),
              notes: notes.trim(),
            });
          }}
          className="flex-1 !py-2.5 !text-[13px]"
        >
          Add Product
        </ButtonPrimary>
        <ButtonSecondary onClick={onCancel} className="!py-2.5 !text-[13px]">
          Cancel
        </ButtonSecondary>
      </div>
    </div>
  );
}

/* ================================================================
   WEEK GRID — 7-day adherence overview
   ================================================================ */

function WeekGrid({
  routines,
  logs,
}: {
  routines: Routine[];
  logs: { routineId: string; date: string; completed: boolean }[];
}) {
  const days: { label: string; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      date: d.toISOString().split("T")[0],
    });
  }

  return (
    <div className="space-y-2.5">
      {routines.map((routine) => {
        const timeIcon =
          routine.time === "am" ? "🌅" : routine.time === "pm" ? "🌙" : "🏃";
        return (
          <div key={routine.id}>
            <p className="text-[12px] font-medium text-[#6b5e50] mb-1.5">
              {timeIcon} {routine.name}
            </p>
            <div className="flex gap-1.5">
              {days.map((day) => {
                const done = logs.some(
                  (l) =>
                    l.routineId === routine.id &&
                    l.date === day.date &&
                    l.completed
                );
                const isToday = day.date === TODAY;
                return (
                  <div key={day.date} className="flex-1 text-center">
                    <p className="text-[10px] text-[#b0a697] mb-1">
                      {day.label}
                    </p>
                    <div
                      className={`h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                        done
                          ? "bg-[#3d5a3d] text-white"
                          : isToday
                            ? "border-2 border-dashed border-[#d0c9bf] text-[#b0a697]"
                            : "bg-[#f0ede7] text-[#d0c9bf]"
                      }`}
                    >
                      {done ? "✓" : "·"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
