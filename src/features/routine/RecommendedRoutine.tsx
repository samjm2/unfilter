"use client";

import { useMemo } from "react";
import { useOnboardingStore } from "@/features/onboarding/store";
import {
  getPersonalizedRecommendations,
  type RecommendedProduct,
} from "@/features/routine/recommendations";
import { CATEGORY_INFO } from "@/features/routine/types";
import { CalloutPanel, SectionLabel } from "@/components/ui";

export function RecommendedRoutine() {
  const profile = useOnboardingStore((s) => s.profile);

  const { routine, reasoning } = useMemo(
    () =>
      getPersonalizedRecommendations({
        goals: profile.goals,
        sensitivities: profile.sensitivities,
        timeBudget: profile.timeBudget,
      }),
    [profile]
  );

  if (routine.length === 0) return null;

  return (
    <div className="card-elevated p-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef3ee]">
          <span className="text-[18px]">⭐</span>
        </div>
        <div>
          <h3 className="text-heading text-[16px] text-[#2e2a25]">
            Unfilter Recommends
          </h3>
          <p className="text-[12px] text-[#8a7d6e]">
            Based on your goals and preferences
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 mb-4 rounded-xl bg-[#f7f4ef] border border-[#e8e2d8] px-3.5 py-2.5">
        <p className="text-[11px] text-[#6b5e50] leading-relaxed">
          These are products commonly recommended by dermatologists — not a
          prescription. We have no affiliate deals or sponsorships. Always
          patch test new products and consult a professional if you&apos;re
          unsure.
        </p>
      </div>

      {/* Routine steps */}
      <div className="space-y-3 mb-4">
        {routine.map((product, i) => (
          <ProductRecommendationCard
            key={product.id}
            product={product}
            stepNumber={i + 1}
            reason={reasoning[i]}
          />
        ))}
      </div>

      {/* Cost estimate */}
      <div className="flex items-center justify-between px-1 mb-4">
        <p className="text-[12px] text-[#8a7d6e]">
          Estimated total cost
        </p>
        <p className="text-[14px] font-semibold text-[#2e2a25]">
          {estimateCost(routine)}
        </p>
      </div>

      {/* Tips */}
      <CalloutPanel icon="💡" variant="sage">
        <strong>Start simple.</strong> You don&apos;t need to buy everything at
        once. Begin with a cleanser and moisturizer — add sunscreen and
        treatments later. Introduce one new product every 1–2 weeks.
      </CalloutPanel>
    </div>
  );
}

function ProductRecommendationCard({
  product,
  stepNumber,
  reason,
}: {
  product: RecommendedProduct;
  stepNumber: number;
  reason?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e2d8] bg-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#faf8f4] border-b border-[#f0ede7]">
        <span className="text-[11px] font-bold text-[#b0a697] w-4 text-center">
          {stepNumber}
        </span>
        <span className="text-[14px]">
          {CATEGORY_INFO[product.category]?.icon}
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#b0a697]">
          {CATEGORY_INFO[product.category]?.label}
        </p>
        <span className="ml-auto text-[11px] font-semibold text-[#8a7d6e]">
          {product.priceRange === "$"
            ? "Budget"
            : product.priceRange === "$$"
              ? "Mid-range"
              : "Premium"}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[14px] font-semibold text-[#2e2a25]">
              {product.brand} {product.name}
            </p>
            <p className="text-[12px] text-[#8a7d6e] mt-0.5">
              {product.size}
            </p>
          </div>
        </div>

        {/* Why */}
        <p className="text-[13px] text-[#6b5e50] leading-relaxed mt-2">
          {product.whyWePickedIt}
        </p>

        {/* Key ingredients */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.keyIngredients.map((ing) => (
            <span
              key={ing}
              className="rounded-full bg-[#f0ede7] px-2.5 py-1 text-[10px] font-semibold text-[#6b5e50]"
            >
              {ing}
            </span>
          ))}
        </div>

        {/* How to use */}
        <div className="mt-3 rounded-lg bg-[#f7f4ef] px-3 py-2.5">
          <p className="text-[11px] font-bold text-[#8a7d6e] mb-0.5">
            How to use
          </p>
          <p className="text-[12px] text-[#6b5e50] leading-relaxed">
            {product.howToUse}
          </p>
        </div>

        {/* Personalized reason */}
        {reason && (
          <div className="mt-2.5 flex items-start gap-2">
            <span className="text-[12px] mt-0.5">💬</span>
            <p className="text-[12px] text-[#7da37d] font-medium italic">
              {reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function estimateCost(products: RecommendedProduct[]): string {
  let low = 0;
  let high = 0;
  for (const p of products) {
    if (p.priceRange === "$") { low += 5; high += 18; }
    else if (p.priceRange === "$$") { low += 15; high += 30; }
    else { low += 25; high += 45; }
  }
  return `~$${low}–$${high}`;
}
