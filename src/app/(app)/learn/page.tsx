"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import {
  LEARN_ARTICLES,
  CATEGORY_META,
  type LearnArticle,
  type LearnCategory,
} from "@/features/learn/content";
import { ButtonText, SectionLabel } from "@/components/ui";

export default function LearnPage() {
  const [filter, setFilter] = useState<LearnCategory | "all">("all");
  const [activeArticle, setActiveArticle] = useState<LearnArticle | null>(null);

  const filtered =
    filter === "all"
      ? LEARN_ARTICLES
      : LEARN_ARTICLES.filter((a) => a.category === filter);

  // Article reader view
  if (activeArticle) {
    return (
      <OnboardingGate>
        <AppShell>
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => setActiveArticle(null)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#8a7d6e] hover:text-[#5c5245] transition mb-6"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Learn Hub
            </button>

            <div className="animate-fade-up">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[24px]">{activeArticle.emoji}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#b0a697]">
                  {CATEGORY_META[activeArticle.category].label}
                </span>
              </div>
              <h1 className="text-heading text-[24px] text-[#2e2a25] mb-2">
                {activeArticle.title}
              </h1>
              <p className="text-[14px] text-[#8a7d6e] leading-relaxed mb-8">
                {activeArticle.summary}
              </p>

              <div className="space-y-6">
                {activeArticle.content.map((section, i) => (
                  <div
                    key={i}
                    className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                  >
                    <h2 className="text-[16px] font-semibold text-[#2e2a25] mb-2">
                      {section.heading}
                    </h2>
                    <p className="text-[14px] text-[#5c5245] leading-[1.75]">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mt-8 rounded-xl bg-[#f7f4ef] border border-[#e8e2d8] px-4 py-3">
                <p className="text-[11px] text-[#8a7d6e] leading-relaxed">
                  This content is for educational purposes only and does not
                  constitute medical advice. Consult a healthcare professional
                  for personalized guidance.
                </p>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {activeArticle.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#f0ede7] px-2.5 py-1 text-[10px] font-semibold text-[#8a7d6e]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AppShell>
      </OnboardingGate>
    );
  }

  // Main hub view
  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6 animate-fade-up">
            <h1 className="text-heading text-[24px] text-[#2e2a25]">
              Learn Hub
            </h1>
            <p className="mt-1 text-[14px] text-[#8a7d6e]">
              Real information. No TikTok myths. No sponsored nonsense.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 animate-fade-up stagger-1 no-scrollbar">
            <FilterPill
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="All"
              icon="📖"
            />
            {(Object.keys(CATEGORY_META) as LearnCategory[]).map((cat) => (
              <FilterPill
                key={cat}
                active={filter === cat}
                onClick={() => setFilter(cat)}
                label={CATEGORY_META[cat].label}
                icon={CATEGORY_META[cat].icon}
              />
            ))}
          </div>

          {/* Category cards (when showing "all") */}
          {filter === "all" && (
            <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up stagger-2">
              {(Object.keys(CATEGORY_META) as LearnCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat];
                const count = LEARN_ARTICLES.filter(
                  (a) => a.category === cat
                ).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`card-interactive border-l-[3px] ${meta.color} p-4 text-left`}
                  >
                    <span className="text-[20px]">{meta.icon}</span>
                    <p className="text-[13px] font-semibold text-[#2e2a25] mt-2">
                      {meta.label}
                    </p>
                    <p className="text-[11px] text-[#8a7d6e] mt-0.5">
                      {count} {count === 1 ? "article" : "articles"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Article list */}
          <div className="space-y-2.5 animate-fade-up stagger-3">
            <SectionLabel>
              {filter === "all" ? "All Articles" : CATEGORY_META[filter].label}
            </SectionLabel>
            {filtered.map((article) => (
              <button
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className={`w-full card-interactive border-l-[3px] ${CATEGORY_META[article.category].color} p-4 text-left flex gap-3.5 items-start`}
              >
                <span className="text-[20px] shrink-0 mt-0.5">
                  {article.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#2e2a25]">
                    {article.title}
                  </p>
                  <p className="text-[12px] text-[#8a7d6e] mt-0.5 line-clamp-2">
                    {article.summary}
                  </p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-[#c4bbb0] shrink-0 mt-1"
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
      </AppShell>
    </OnboardingGate>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
        active
          ? "bg-[#3d5a3d] text-white shadow-sm"
          : "bg-[#f0ede7] text-[#6b5e50] hover:bg-[#e8e2d8]"
      }`}
    >
      <span className="text-[13px]">{icon}</span>
      {label}
    </button>
  );
}
