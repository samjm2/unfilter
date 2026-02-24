// ============================================================
// Product Recommendations — Unbiased, Derm-Aligned
//
// These are commonly recommended by dermatologists for teens.
// No affiliate links. No sponsorships. Just honest picks.
//
// DISCLAIMER: Educational recommendations only.
// Always patch test. Individual results vary.
// ============================================================

import type { ProductCategory } from "@/features/routine/types";

export interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  priceRange: "$" | "$$" | "$$$";
  goodFor: string[]; // e.g. ["acne", "sensitive", "dry"]
  avoidIf: string[]; // sensitivities to flag
  keyIngredients: string[];
  whyWePickedIt: string;
  howToUse: string;
  size: string;
}

export const RECOMMENDED_PRODUCTS: RecommendedProduct[] = [
  // ---- CLEANSERS ----
  {
    id: "cerave-foaming",
    name: "Foaming Facial Cleanser",
    brand: "CeraVe",
    category: "cleanser",
    priceRange: "$",
    goodFor: ["acne", "oily", "normal"],
    avoidIf: [],
    keyIngredients: ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
    whyWePickedIt:
      "Gentle enough for daily use but effective at removing oil. Contains ceramides that help repair your skin barrier. Fragrance-free.",
    howToUse:
      "Wet face with lukewarm water. Massage a small amount in circles for 30–60 seconds. Rinse and pat dry.",
    size: "12 oz / ~$15",
  },
  {
    id: "cerave-hydrating",
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    category: "cleanser",
    priceRange: "$",
    goodFor: ["dry", "sensitive", "eczema"],
    avoidIf: [],
    keyIngredients: ["Ceramides", "Hyaluronic Acid", "Glycerin"],
    whyWePickedIt:
      "Won't strip moisture from dry or sensitive skin. Cream-based formula that cleanses without that tight, dry feeling.",
    howToUse:
      "Apply to damp skin, massage gently, rinse with lukewarm water. Don't scrub — let the product do the work.",
    size: "12 oz / ~$15",
  },
  {
    id: "vanicream-cleanser",
    name: "Gentle Facial Cleanser",
    brand: "Vanicream",
    category: "cleanser",
    priceRange: "$",
    goodFor: ["sensitive", "eczema", "irritation", "dry"],
    avoidIf: [],
    keyIngredients: ["Glycerin"],
    whyWePickedIt:
      "The gentlest option on this list. Free of dyes, fragrance, parabens, and common irritants. Dermatologists recommend this for the most reactive skin.",
    howToUse: "Use morning and night on damp skin. Rinse thoroughly.",
    size: "8 oz / ~$10",
  },
  {
    id: "lrp-toleriane",
    name: "Toleriane Hydrating Gentle Cleanser",
    brand: "La Roche-Posay",
    category: "cleanser",
    priceRange: "$$",
    goodFor: ["sensitive", "dry", "normal"],
    avoidIf: [],
    keyIngredients: ["Ceramide-3", "Niacinamide", "Glycerin"],
    whyWePickedIt:
      "Prebiotic formula that respects your skin's microbiome. Extremely gentle. A favorite among dermatologists for sensitive teen skin.",
    howToUse: "Massage onto damp skin, rinse with lukewarm water.",
    size: "13.5 oz / ~$16",
  },

  // ---- MOISTURIZERS ----
  {
    id: "cerave-lotion",
    name: "Daily Moisturizing Lotion",
    brand: "CeraVe",
    category: "moisturizer",
    priceRange: "$",
    goodFor: ["normal", "oily", "acne"],
    avoidIf: [],
    keyIngredients: ["Ceramides", "Hyaluronic Acid", "MVE Technology"],
    whyWePickedIt:
      "Lightweight enough for acne-prone skin but still hydrating. The MVE technology releases moisture throughout the day. Non-comedogenic.",
    howToUse:
      "Apply after cleansing while skin is still slightly damp. Use a nickel-sized amount for your face.",
    size: "12 oz / ~$16",
  },
  {
    id: "cerave-cream",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    category: "moisturizer",
    priceRange: "$",
    goodFor: ["dry", "eczema", "sensitive"],
    avoidIf: [],
    keyIngredients: ["Ceramides", "Hyaluronic Acid", "Petrolatum"],
    whyWePickedIt:
      "Thicker formula for dry or eczema-prone skin. Locks in moisture effectively. Accepted by the National Eczema Association.",
    howToUse: "Apply generously after cleansing. Great as a night cream.",
    size: "16 oz / ~$18",
  },
  {
    id: "vanicream-moisturizer",
    name: "Moisturizing Skin Cream",
    brand: "Vanicream",
    category: "moisturizer",
    priceRange: "$",
    goodFor: ["sensitive", "eczema", "irritation"],
    avoidIf: [],
    keyIngredients: ["Petrolatum", "Sorbitol", "Glyceryl Stearate"],
    whyWePickedIt:
      "Absolutely minimal ingredient list. No dyes, fragrance, or common allergens. The safest choice for very reactive skin.",
    howToUse: "Apply as needed. Works well as both a face and body moisturizer.",
    size: "16 oz / ~$14",
  },
  {
    id: "neutrogena-hydro",
    name: "Hydro Boost Water Gel",
    brand: "Neutrogena",
    category: "moisturizer",
    priceRange: "$$",
    goodFor: ["oily", "acne", "normal"],
    avoidIf: ["fragrance"],
    keyIngredients: ["Hyaluronic Acid", "Glycerin"],
    whyWePickedIt:
      "Gel texture absorbs fast and feels weightless. Great for oily or acne-prone skin that still needs hydration. Get the fragrance-free version.",
    howToUse:
      "Apply a dime-sized amount after cleansing. Layers well under sunscreen.",
    size: "1.7 oz / ~$20",
  },

  // ---- SUNSCREEN ----
  {
    id: "lrp-anthelios",
    name: "Anthelios Melt-In Milk SPF 60",
    brand: "La Roche-Posay",
    category: "sunscreen",
    priceRange: "$$",
    goodFor: ["normal", "sensitive", "acne", "oily", "dry"],
    avoidIf: [],
    keyIngredients: ["Avobenzone", "Homosalate", "La Roche-Posay Thermal Spring Water"],
    whyWePickedIt:
      "Consistently top-rated by dermatologists. Lightweight, doesn't leave a white cast on most skin tones. Water-resistant for 80 minutes.",
    howToUse:
      "Apply generously 15 min before sun exposure. Reapply every 2 hours, or after swimming/sweating.",
    size: "3 oz / ~$28",
  },
  {
    id: "cerave-spf30",
    name: "AM Facial Moisturizing Lotion SPF 30",
    brand: "CeraVe",
    category: "sunscreen",
    priceRange: "$",
    goodFor: ["normal", "dry", "oily"],
    avoidIf: [],
    keyIngredients: ["Zinc Oxide", "Ceramides", "Niacinamide"],
    whyWePickedIt:
      "Combines moisturizer + sunscreen in one step — perfect for a 2-minute routine. Mineral-based, so it's gentle. Contains niacinamide to help with redness.",
    howToUse:
      "Apply as the last step of your morning routine. Use enough to cover your entire face and neck.",
    size: "2 oz / ~$16",
  },
  {
    id: "elta-md-uv-clear",
    name: "UV Clear Broad-Spectrum SPF 46",
    brand: "EltaMD",
    category: "sunscreen",
    priceRange: "$$$",
    goodFor: ["acne", "sensitive", "oily"],
    avoidIf: [],
    keyIngredients: ["Zinc Oxide", "Niacinamide", "Hyaluronic Acid"],
    whyWePickedIt:
      "The #1 dermatologist-recommended sunscreen for acne-prone skin. Contains niacinamide which calms redness. Oil-free, won't clog pores. Worth the price if breakouts are your main concern.",
    howToUse: "Apply liberally to face 15 min before sun exposure.",
    size: "1.7 oz / ~$39",
  },

  // ---- TREATMENTS ----
  {
    id: "panoxyl-bp",
    name: "Acne Foaming Wash 4%",
    brand: "PanOxyl",
    category: "treatment",
    priceRange: "$",
    goodFor: ["acne", "oily"],
    avoidIf: ["sensitive", "eczema"],
    keyIngredients: ["Benzoyl Peroxide 4%"],
    whyWePickedIt:
      "Benzoyl peroxide is one of the most effective acne-fighting ingredients available without a prescription. The wash format is less irritating than leave-on products. Start with the 4% if you're new to BP.",
    howToUse:
      "Use as a cleanser 1x per day (evening). Leave on skin for 1–2 min before rinsing. May bleach towels and pillowcases — use white ones.",
    size: "5.5 oz / ~$10",
  },
  {
    id: "stridex-red",
    name: "Maximum Strength Pads (2% Salicylic Acid)",
    brand: "Stridex",
    category: "treatment",
    priceRange: "$",
    goodFor: ["acne", "blackheads", "oily"],
    avoidIf: ["salicylic acid", "sensitive"],
    keyIngredients: ["Salicylic Acid 2%"],
    whyWePickedIt:
      "Simple, effective BHA exfoliant. Helps unclog pores and reduce blackheads. Alcohol-free formula. One of the most affordable treatments available.",
    howToUse:
      "Swipe one pad over clean, dry skin at night. Start with every other day. Don't rinse off — let it dry, then moisturize.",
    size: "90 pads / ~$5",
  },
  {
    id: "hero-patches",
    name: "Mighty Patch Original",
    brand: "Hero Cosmetics",
    category: "treatment",
    priceRange: "$",
    goodFor: ["acne"],
    avoidIf: [],
    keyIngredients: ["Hydrocolloid"],
    whyWePickedIt:
      "Hydrocolloid patches absorb fluid from pimples overnight. They also stop you from picking (which causes scarring). No active chemicals — safe for all skin types.",
    howToUse:
      "Apply to a clean, dry pimple before bed. Leave on 6+ hours. Peel off in the morning — you'll see what it absorbed.",
    size: "36 patches / ~$13",
  },
];

// ============================================================
// Recommendation engine — matches profile to products
// ============================================================

export interface ProfileForRecommendation {
  goals: string[];
  sensitivities: string;
  timeBudget: string;
}

export function getPersonalizedRecommendations(
  profile: ProfileForRecommendation
): {
  routine: RecommendedProduct[];
  reasoning: string[];
} {
  const sensLower = profile.sensitivities.toLowerCase();
  const isSensitive =
    sensLower.includes("sensitive") ||
    sensLower.includes("eczema") ||
    sensLower.includes("fragrance");

  const hasAcne = profile.goals.includes("acne");
  const hasIrritation = profile.goals.includes("irritation");

  // Build a personalized routine
  const routine: RecommendedProduct[] = [];
  const reasoning: string[] = [];

  // 1. Cleanser
  if (isSensitive || hasIrritation) {
    const pick =
      RECOMMENDED_PRODUCTS.find((p) => p.id === "vanicream-cleanser") ??
      RECOMMENDED_PRODUCTS.find((p) => p.id === "cerave-hydrating");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "We picked the gentlest cleanser since you mentioned sensitivities."
      );
    }
  } else if (hasAcne) {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "cerave-foaming");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "A foaming cleanser helps manage oil without being harsh."
      );
    }
  } else {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "lrp-toleriane");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "A gentle, versatile cleanser that works for most skin types."
      );
    }
  }

  // 2. Treatment (only if acne goal and NOT too sensitive)
  if (hasAcne && !isSensitive && profile.timeBudget !== "2min") {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "stridex-red");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "Salicylic acid pads help unclog pores. Start every other day."
      );
    }
  }

  // 3. Moisturizer
  if (isSensitive || hasIrritation) {
    const pick = RECOMMENDED_PRODUCTS.find(
      (p) => p.id === "vanicream-moisturizer"
    );
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "Minimal ingredients to avoid triggering reactions."
      );
    }
  } else if (hasAcne) {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "cerave-lotion");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "Lightweight and non-comedogenic — won't clog pores."
      );
    }
  } else {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "cerave-lotion");
    if (pick) {
      routine.push(pick);
      reasoning.push("A great daily moisturizer that works for most people.");
    }
  }

  // 4. Sunscreen
  if (hasAcne) {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "elta-md-uv-clear");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "The dermatologist favorite for acne-prone skin. Contains niacinamide."
      );
    }
  } else {
    const pick = RECOMMENDED_PRODUCTS.find((p) => p.id === "cerave-spf30");
    if (pick) {
      routine.push(pick);
      reasoning.push(
        "Moisturizer + SPF in one step keeps things simple."
      );
    }
  }

  // Filter out anything that conflicts with sensitivities
  const filtered = routine.filter((p) => {
    for (const avoid of p.avoidIf) {
      if (sensLower.includes(avoid.toLowerCase())) return false;
    }
    return true;
  });

  return { routine: filtered, reasoning };
}
