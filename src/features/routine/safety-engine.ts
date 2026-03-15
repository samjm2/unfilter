// ============================================================
// Barrier Safety Copilot — Safety Analysis Engine v2
//
// Selectable ingredient system with cross-reference conflict
// matrix. No typing required — users pick from categorized lists.
//
// DISCLAIMER: Educational guidance only. Not medical advice.
// ============================================================

/* ---------- Types ---------- */

export type IngredientCategory =
  | "exfoliant"
  | "retinoid"
  | "acne-treatment"
  | "antioxidant"
  | "hydration"
  | "barrier-repair";

export type Strength = "mild" | "moderate" | "strong";

export type ProductSlot = "am" | "pm" | "both";

export type ProductCategory =
  | "cleanser"
  | "toner"
  | "serum"
  | "treatment"
  | "moisturizer"
  | "sunscreen"
  | "other";

/* ---------- Selectable Ingredient Database ---------- */

export interface SelectableIngredient {
  id: string;
  label: string;
  category: IngredientCategory;
  strength: Strength;
  subtype?: string; // "aha" | "bha" | "pha"
}

// Grouped for display — users pick from these
export const INGREDIENT_GROUPS: { category: IngredientCategory; label: string; items: SelectableIngredient[] }[] = [
  {
    category: "retinoid",
    label: "Retinoids",
    items: [
      { id: "retinol", label: "Retinol", category: "retinoid", strength: "moderate" },
      { id: "retinaldehyde", label: "Retinaldehyde", category: "retinoid", strength: "strong" },
      { id: "adapalene", label: "Adapalene (Differin)", category: "retinoid", strength: "strong" },
      { id: "tretinoin", label: "Tretinoin (Rx)", category: "retinoid", strength: "strong" },
      { id: "retinyl-palmitate", label: "Retinyl Palmitate", category: "retinoid", strength: "mild" },
      { id: "bakuchiol", label: "Bakuchiol", category: "retinoid", strength: "mild" },
    ],
  },
  {
    category: "exfoliant",
    label: "Exfoliants (AHA / BHA / PHA)",
    items: [
      { id: "glycolic-acid", label: "Glycolic Acid (AHA)", category: "exfoliant", strength: "moderate", subtype: "aha" },
      { id: "lactic-acid", label: "Lactic Acid (AHA)", category: "exfoliant", strength: "mild", subtype: "aha" },
      { id: "mandelic-acid", label: "Mandelic Acid (AHA)", category: "exfoliant", strength: "mild", subtype: "aha" },
      { id: "salicylic-acid", label: "Salicylic Acid (BHA)", category: "exfoliant", strength: "moderate", subtype: "bha" },
      { id: "gluconolactone", label: "Gluconolactone (PHA)", category: "exfoliant", strength: "mild", subtype: "pha" },
    ],
  },
  {
    category: "acne-treatment",
    label: "Acne Treatments",
    items: [
      { id: "benzoyl-peroxide", label: "Benzoyl Peroxide", category: "acne-treatment", strength: "strong" },
      { id: "azelaic-acid", label: "Azelaic Acid", category: "acne-treatment", strength: "mild" },
      { id: "sulfur", label: "Sulfur", category: "acne-treatment", strength: "moderate" },
    ],
  },
  {
    category: "antioxidant",
    label: "Antioxidants",
    items: [
      { id: "vitamin-c", label: "Vitamin C (L-Ascorbic Acid)", category: "antioxidant", strength: "moderate" },
      { id: "vitamin-c-gentle", label: "Vitamin C (gentle form)", category: "antioxidant", strength: "mild" },
      { id: "vitamin-e", label: "Vitamin E", category: "antioxidant", strength: "mild" },
      { id: "ferulic-acid", label: "Ferulic Acid", category: "antioxidant", strength: "mild" },
    ],
  },
  {
    category: "hydration",
    label: "Hydration",
    items: [
      { id: "hyaluronic-acid", label: "Hyaluronic Acid", category: "hydration", strength: "mild" },
      { id: "niacinamide", label: "Niacinamide (Vitamin B3)", category: "hydration", strength: "mild" },
      { id: "glycerin", label: "Glycerin", category: "hydration", strength: "mild" },
      { id: "panthenol", label: "Panthenol (Pro-Vitamin B5)", category: "hydration", strength: "mild" },
      { id: "squalane", label: "Squalane", category: "hydration", strength: "mild" },
    ],
  },
  {
    category: "barrier-repair",
    label: "Barrier Repair",
    items: [
      { id: "ceramides", label: "Ceramides", category: "barrier-repair", strength: "mild" },
      { id: "centella", label: "Centella Asiatica (Cica)", category: "barrier-repair", strength: "mild" },
      { id: "allantoin", label: "Allantoin", category: "barrier-repair", strength: "mild" },
      { id: "colloidal-oatmeal", label: "Colloidal Oatmeal", category: "barrier-repair", strength: "mild" },
    ],
  },
];

// Flat lookup map
const INGREDIENT_MAP = new Map<string, SelectableIngredient>();
for (const group of INGREDIENT_GROUPS) {
  for (const item of group.items) {
    INGREDIENT_MAP.set(item.id, item);
  }
}

export function getIngredient(id: string): SelectableIngredient | undefined {
  return INGREDIENT_MAP.get(id);
}

/* ---------- Conflict Matrix ---------- */

// Each entry: [ingredientA pattern, ingredientB pattern, conflict info]
// Patterns match by ID prefix or exact ID, enabling category-level rules

interface ConflictRule {
  a: string | string[]; // ingredient IDs or category name
  b: string | string[]; // ingredient IDs or category name
  matchByCategory?: boolean; // if true, a/b are category names
  severity: "info" | "caution" | "warning";
  title: string;
  explanation: string;
  guidance: string;
  deduction: number;
  requireSameSlot?: boolean; // only flag if same AM/PM slot
}

const CONFLICT_MATRIX: ConflictRule[] = [
  // Retinoid + any AHA/BHA
  {
    a: ["retinol", "retinaldehyde", "adapalene", "tretinoin", "retinyl-palmitate", "bakuchiol"],
    b: ["glycolic-acid", "lactic-acid", "mandelic-acid", "salicylic-acid", "gluconolactone"],
    severity: "warning",
    title: "Retinoid + Exfoliating Acid",
    explanation: "Both increase cell turnover. Combining them in the same routine may overwhelm the skin barrier, leading to irritation, redness, and peeling.",
    guidance: "Many routines separate these into different days, or use the retinoid at night and the acid in the morning. Start one at a time to see how your skin responds.",
    deduction: 20,
    requireSameSlot: true,
  },
  // Retinoid + Benzoyl Peroxide
  {
    a: ["retinol", "retinaldehyde", "adapalene", "tretinoin"],
    b: ["benzoyl-peroxide"],
    severity: "warning",
    title: "Retinoid + Benzoyl Peroxide",
    explanation: "Some retinoid forms are deactivated by benzoyl peroxide on contact. This combination can also increase dryness and peeling significantly.",
    guidance: "Apply benzoyl peroxide in the morning and retinoid at night, or alternate days. Some newer formulations are designed to coexist — check with a professional.",
    deduction: 15,
  },
  // Vitamin C (L-ascorbic) + AHA/BHA
  {
    a: ["vitamin-c"],
    b: ["glycolic-acid", "lactic-acid", "mandelic-acid", "salicylic-acid"],
    severity: "info",
    title: "Vitamin C + Exfoliating Acid",
    explanation: "L-ascorbic acid is already acidic (pH ~3.5). Adding another acid may lower skin pH further, potentially causing stinging or flushing.",
    guidance: "Use vitamin C in the morning and acids at night. If you don't experience irritation, this combination may work fine for you.",
    deduction: 5,
    requireSameSlot: true,
  },
  // Vitamin C + Niacinamide (mild — old concern, mostly debunked)
  {
    a: ["vitamin-c"],
    b: ["niacinamide"],
    severity: "info",
    title: "Vitamin C + Niacinamide",
    explanation: "An older concern suggested these conflict, but recent research shows they can be used together safely. Some people experience mild flushing.",
    guidance: "This is generally considered safe. If you notice redness, try using them in separate routines (AM/PM).",
    deduction: 0,
  },
  // Benzoyl Peroxide + Vitamin C
  {
    a: ["benzoyl-peroxide"],
    b: ["vitamin-c", "vitamin-c-gentle"],
    severity: "caution",
    title: "Benzoyl Peroxide + Vitamin C",
    explanation: "Benzoyl peroxide is an oxidizer and vitamin C is an antioxidant — they can cancel each other out, making both less effective.",
    guidance: "Use them at different times of day (vitamin C in the morning, benzoyl peroxide at night).",
    deduction: 8,
  },
  // Multiple strong retinoids
  {
    a: ["adapalene", "tretinoin", "retinaldehyde"],
    b: ["adapalene", "tretinoin", "retinaldehyde", "retinol"],
    severity: "warning",
    title: "Multiple Retinoids",
    explanation: "Using more than one retinoid product multiplies irritation risk without proportional benefit. One retinoid at the right strength is more effective than stacking.",
    guidance: "Choose one retinoid product and use it consistently. Talk to a dermatologist about which strength is right for you.",
    deduction: 18,
  },
  // AHA + BHA together
  {
    a: ["glycolic-acid", "lactic-acid", "mandelic-acid"],
    b: ["salicylic-acid"],
    severity: "caution",
    title: "AHA + BHA Together",
    explanation: "AHAs and BHAs both exfoliate but work differently (surface vs. pore-level). Using both increases total exfoliation, which may thin the barrier over time.",
    guidance: "Alternating days (AHA one night, BHA the next) is a common approach. If combining, use lower concentrations.",
    deduction: 12,
    requireSameSlot: true,
  },
  // Benzoyl Peroxide + AHA
  {
    a: ["benzoyl-peroxide"],
    b: ["glycolic-acid", "lactic-acid", "mandelic-acid"],
    severity: "caution",
    title: "Benzoyl Peroxide + AHA",
    explanation: "Both are drying and can irritate skin when layered. The combination may cause excessive peeling, especially for sensitive or younger skin.",
    guidance: "Use on alternate days or in different routines (AM/PM). Start with lower frequencies to test tolerance.",
    deduction: 10,
    requireSameSlot: true,
  },
  // Sulfur + Retinoid
  {
    a: ["sulfur"],
    b: ["retinol", "retinaldehyde", "adapalene", "tretinoin"],
    severity: "caution",
    title: "Sulfur + Retinoid",
    explanation: "Both are drying ingredients. Combining them can lead to excessive dryness, flaking, and irritation.",
    guidance: "Avoid using these on the same day. Alternate between them and monitor for signs of over-drying.",
    deduction: 10,
  },
];

/* ---------- Product Type ---------- */

export interface CopilotProduct {
  id: string;
  name: string;
  slot: ProductSlot;
  category: ProductCategory;
  selectedIngredients: string[]; // ingredient IDs from INGREDIENT_GROUPS
  frequency: number; // times per week (1-7)
}

/* ---------- Safety Analysis Types ---------- */

export interface SafetyWarning {
  id: string;
  severity: "info" | "caution" | "warning";
  title: string;
  detected: string;
  explanation: string;
  guidance: string;
  deduction: number;
}

export interface SafetyAnalysis {
  score: number;
  riskLevel: "Low" | "Moderate" | "High";
  warnings: SafetyWarning[];
  ingredientSummary: { ingredient: SelectableIngredient; productName: string; slot: ProductSlot }[];
  missingElements: string[];
}

/* ---------- Conflict Detection Engine ---------- */

function slotsOverlap(slotA: ProductSlot, slotB: ProductSlot): boolean {
  if (slotA === "both" || slotB === "both") return true;
  return slotA === slotB;
}

export function analyzeRoutine(products: CopilotProduct[]): SafetyAnalysis {
  const warnings: SafetyWarning[] = [];
  const missingElements: string[] = [];
  const firedRules = new Set<string>(); // prevent duplicate warnings
  let deductions = 0;

  // Build flat list of all ingredients with context
  const allIngredients: { id: string; ingredient: SelectableIngredient; productName: string; slot: ProductSlot; frequency: number }[] = [];
  for (const product of products) {
    for (const ingId of product.selectedIngredients) {
      const ing = getIngredient(ingId);
      if (ing) {
        allIngredients.push({ id: ingId, ingredient: ing, productName: product.name, slot: product.slot, frequency: product.frequency });
      }
    }
  }

  // Summary for display
  const ingredientSummary = allIngredients.map((a) => ({
    ingredient: a.ingredient,
    productName: a.productName,
    slot: a.slot,
  }));

  // --- Cross-reference conflict matrix ---
  // Check every pair of ingredients across all products
  for (let i = 0; i < allIngredients.length; i++) {
    for (let j = i + 1; j < allIngredients.length; j++) {
      const a = allIngredients[i];
      const b = allIngredients[j];

      // Skip same ingredient in same product
      if (a.id === b.id && a.productName === b.productName) continue;

      for (const rule of CONFLICT_MATRIX) {
        const ruleId = rule.title;
        if (firedRules.has(ruleId)) continue;

        const aIds = Array.isArray(rule.a) ? rule.a : [rule.a];
        const bIds = Array.isArray(rule.b) ? rule.b : [rule.b];

        const matchForward = aIds.includes(a.id) && bIds.includes(b.id);
        const matchReverse = aIds.includes(b.id) && bIds.includes(a.id);

        if (matchForward || matchReverse) {
          // Check slot requirement
          if (rule.requireSameSlot && !slotsOverlap(a.slot, b.slot)) continue;

          const ingA = matchForward ? a : b;
          const ingB = matchForward ? b : a;

          firedRules.add(ruleId);
          warnings.push({
            id: ruleId.toLowerCase().replace(/\s+/g, "-"),
            severity: rule.severity,
            title: rule.title,
            detected: `${ingA.ingredient.label} (in ${ingA.productName}) + ${ingB.ingredient.label} (in ${ingB.productName})`,
            explanation: rule.explanation,
            guidance: rule.guidance,
            deduction: rule.deduction,
          });
          deductions += rule.deduction;
        }
      }
    }
  }

  // --- Structural rules (not pair-based) ---

  // Too many active (non-mild) ingredients
  const activeIngredients = allIngredients.filter(
    (a) => a.ingredient.strength !== "mild" && a.ingredient.category !== "hydration" && a.ingredient.category !== "barrier-repair"
  );
  const uniqueActives = new Set(activeIngredients.map((a) => a.id));
  if (uniqueActives.size > 3 && !firedRules.has("many-actives")) {
    firedRules.add("many-actives");
    warnings.push({
      id: "many-actives",
      severity: "warning",
      title: "Many Active Ingredients",
      detected: `${uniqueActives.size} active ingredients across your routine`,
      explanation: "Each active ingredient adds stress to the skin barrier. Even individually gentle products can cause irritation when stacked together.",
      guidance: "Start with 1-2 actives. Add more gradually (one at a time, every 2-4 weeks) so you can identify what works.",
      deduction: 15,
    });
    deductions += 15;
  } else if (uniqueActives.size === 3 && !firedRules.has("several-actives")) {
    firedRules.add("several-actives");
    warnings.push({
      id: "several-actives",
      severity: "caution",
      title: "Several Active Ingredients",
      detected: `${uniqueActives.size} active ingredients in use`,
      explanation: "Three actives is manageable for many people but is on the higher end. Monitor for stinging, redness, or dryness.",
      guidance: "If you notice sensitivity, pause one active and reintroduce later.",
      deduction: 5,
    });
    deductions += 5;
  }

  // Frequent exfoliation
  const exfoliantFreq = allIngredients
    .filter((a) => a.ingredient.category === "exfoliant")
    .reduce((sum, a) => sum + a.frequency, 0);
  if (exfoliantFreq > 5) {
    warnings.push({
      id: "over-exfoliation",
      severity: "warning",
      title: "Frequent Exfoliation",
      detected: `Exfoliating ~${exfoliantFreq}x per week combined`,
      explanation: "Exfoliating more than 2-3 times per week increases barrier damage risk, especially for younger skin. Over-exfoliation causes redness, sensitivity, and breakouts.",
      guidance: "Most skin types benefit from 1-3 exfoliations per week. If new to exfoliants, start at once per week.",
      deduction: 15,
    });
    deductions += 15;
  } else if (exfoliantFreq > 3) {
    warnings.push({
      id: "moderate-exfoliation",
      severity: "caution",
      title: "Moderate Exfoliation Frequency",
      detected: `Exfoliating ~${exfoliantFreq}x per week`,
      explanation: "This is on the higher side. Some skin types handle it well, but watch for dryness or tightness.",
      guidance: "If products sting when applied, you may be exfoliating too often.",
      deduction: 5,
    });
    deductions += 5;
  }

  // Missing sunscreen in AM
  const hasAM = products.some((p) => p.slot === "am" || p.slot === "both");
  const hasSunscreen = products.some(
    (p) => p.category === "sunscreen" && (p.slot === "am" || p.slot === "both")
  );
  if (hasAM && !hasSunscreen) {
    warnings.push({
      id: "no-am-sunscreen",
      severity: "caution",
      title: "No Sunscreen in Morning Routine",
      detected: "Morning routine has no sunscreen",
      explanation: "Sunscreen is widely considered the most important skincare step. It's especially critical when using retinoids, AHAs, or BHAs, which increase sun sensitivity.",
      guidance: "Add a broad-spectrum SPF 30+ as the last step of your morning routine.",
      deduction: 10,
    });
    deductions += 10;
  }

  // Missing moisturizer
  const hasMoisturizer = products.some((p) => p.category === "moisturizer");
  if (products.length >= 2 && !hasMoisturizer) {
    warnings.push({
      id: "no-moisturizer",
      severity: "caution",
      title: "No Moisturizer Detected",
      detected: "No moisturizer in your routine",
      explanation: "Moisturizer prevents water loss and buffers active ingredients. Without it, actives can be more irritating.",
      guidance: "A simple, fragrance-free moisturizer after treatments is a foundational step.",
      deduction: 8,
    });
    deductions += 8;
  }

  // Missing barrier support with actives
  const hasBarrierRepair = allIngredients.some((a) => a.ingredient.category === "barrier-repair");
  const hasHydration = allIngredients.some((a) => a.ingredient.category === "hydration");
  if (activeIngredients.length > 0 && !hasBarrierRepair && !hasHydration) {
    warnings.push({
      id: "no-barrier-support",
      severity: "info",
      title: "No Barrier Support Ingredients",
      detected: "Actives present but no hydrating or barrier-repair ingredients selected",
      explanation: "Ceramides, hyaluronic acid, and niacinamide help maintain barrier health alongside active ingredients.",
      guidance: "Look for moisturizers containing ceramides, hyaluronic acid, or niacinamide.",
      deduction: 5,
    });
    deductions += 5;
  }

  // Missing elements summary
  if (hasAM && !hasSunscreen) missingElements.push("Sunscreen (AM)");
  if (products.length >= 2 && !hasMoisturizer) missingElements.push("Moisturizer");
  if (!products.some((p) => p.category === "cleanser")) missingElements.push("Cleanser");
  if (activeIngredients.length > 0 && !hasBarrierRepair) missingElements.push("Barrier-repair ingredient");

  // Score
  const score = Math.max(0, 100 - deductions);
  const riskLevel: SafetyAnalysis["riskLevel"] =
    score >= 75 ? "Low" : score >= 45 ? "Moderate" : "High";

  return { score, riskLevel, warnings, ingredientSummary, missingElements };
}

/* ---------- Educational Flashcards ---------- */

export interface Flashcard {
  id: string;
  topic: string;
  content: string;
}

export const FLASHCARDS: Flashcard[] = [
  {
    id: "exfoliation-stacking",
    topic: "Why exfoliation stacking may irritate skin",
    content: "Exfoliants remove dead skin cells. Using multiple exfoliants (AHA + BHA, for example) means you're removing more cells than your skin can replace. This weakens the barrier and can cause redness, stinging, and increased breakouts.",
  },
  {
    id: "skin-barrier",
    topic: "What is the skin barrier?",
    content: "The skin barrier is the outermost layer of your skin. It keeps moisture in and irritants out. When it's healthy, skin feels smooth and hydrated. When it's damaged (from over-exfoliation or harsh products), skin can sting, flake, or break out.",
  },
  {
    id: "retinoid-basics",
    topic: "What retinoids do",
    content: "Retinoids increase how fast your skin cells turn over. This can help with acne and texture, but it also makes skin more sensitive — especially to sun and other active ingredients. Start slow (1-2x/week) and always use sunscreen.",
  },
  {
    id: "sunscreen-why",
    topic: "Why sunscreen matters with actives",
    content: "Many active ingredients (retinoids, AHAs, BHAs, vitamin C) make your skin more sensitive to UV damage. Without sunscreen, you may undo the benefits of your routine and increase the risk of dark spots and premature aging.",
  },
  {
    id: "less-is-more",
    topic: "Why simpler routines often work better",
    content: "Adding more products doesn't mean better results. Each new active ingredient is another variable your skin has to adapt to. Many dermatologists recommend a simple 3-step routine (cleanser, moisturizer, sunscreen) as a strong foundation.",
  },
  {
    id: "patch-testing",
    topic: "How to patch test",
    content: "Before using a new product on your full face, apply a small amount behind your ear or on your inner forearm. Wait 24-48 hours. If there's no redness, itching, or irritation, it's generally safer to try on a small area of your face.",
  },
  {
    id: "purging-vs-breakout",
    topic: "Purging vs. a breakout",
    content: "When starting a retinoid or exfoliant, some people experience 'purging' — temporary breakouts in areas where you normally get them. This usually lasts 4-6 weeks. If breakouts happen in new areas or worsen after 6 weeks, the product may not be right for you.",
  },
  {
    id: "tiktok-trends",
    topic: "Why trending routines can be risky",
    content: "Skincare routines you see online are often created for the person sharing them — not for you. What works for one skin type can cause irritation for another. Trending 10-step routines can overwhelm skin that only needs 3 steps.",
  },
];

/* ---------- Chatbot Q&A ---------- */

export interface ChatResponse {
  answer: string;
  relatedTopics: string[];
}

const QA_DATABASE: { keywords: string[]; answer: string; related: string[] }[] = [
  {
    keywords: ["retinol", "retinoid", "retinal", "tretinoin", "adapalene", "differin"],
    answer: "Retinoids are vitamin A derivatives that increase skin cell turnover. They can help with acne, texture, and fine lines. Common forms: retinol (OTC, milder), adapalene (stronger, OTC in some regions), tretinoin (prescription). Start with the lowest concentration, use at night, always wear sunscreen the next day.",
    related: ["retinoid-basics", "sunscreen-why"],
  },
  {
    keywords: ["exfoliat", "aha", "bha", "glycolic", "salicylic", "lactic", "mandelic"],
    answer: "Exfoliants remove dead skin cells. AHAs (glycolic, lactic, mandelic acid) work on the surface — good for dullness and texture. BHAs (salicylic acid) penetrate into pores — often recommended for acne. Both increase sun sensitivity. Start 1-2x per week.",
    related: ["exfoliation-stacking", "sunscreen-why"],
  },
  {
    keywords: ["benzoyl peroxide", "benzoyl"],
    answer: "Benzoyl peroxide kills acne-causing bacteria and helps unclog pores. Strengths: 2.5%, 5%, 10% — lower strengths can be just as effective with less irritation. It bleaches fabrics (use white towels). Avoid combining with retinoids in the same application.",
    related: ["less-is-more"],
  },
  {
    keywords: ["vitamin c", "ascorbic"],
    answer: "Vitamin C is an antioxidant that brightens skin and protects against environmental damage. L-ascorbic acid is most studied but can irritate. Gentler forms: ascorbyl glucoside, sodium ascorbyl phosphate. Often used in the morning before sunscreen.",
    related: ["sunscreen-why"],
  },
  {
    keywords: ["niacinamide", "vitamin b3"],
    answer: "Niacinamide (vitamin B3) helps with redness, enlarged pores, and uneven tone. It supports the skin barrier and pairs well with most ingredients. Generally safe for daily use and well-tolerated.",
    related: ["skin-barrier"],
  },
  {
    keywords: ["barrier", "damaged", "repair", "compromised"],
    answer: "Signs of a damaged barrier: stinging, redness, tightness, flaking, increased breakouts. To repair: stop all actives, use only gentle cleanser + moisturizer + sunscreen. Wait until skin feels normal (usually 1-2 weeks) before reintroducing actives one at a time.",
    related: ["skin-barrier", "less-is-more"],
  },
  {
    keywords: ["flagged", "why was", "warning", "risky", "score"],
    answer: "Your routine is analyzed against a conflict matrix that checks every combination of ingredients for known interaction patterns. Flags are based on dermatological research about irritation risks — they're educational prompts, not diagnoses.",
    related: ["exfoliation-stacking", "less-is-more"],
  },
  {
    keywords: ["how often", "frequency", "times per week", "how many"],
    answer: "General starting points: retinoids 1-2x/week, exfoliants 1-2x/week, vitamin C daily (if tolerated), moisturizer and sunscreen daily. The key is starting slow and increasing only if your skin handles it well over 2-4 weeks.",
    related: ["retinoid-basics", "patch-testing"],
  },
  {
    keywords: ["sunscreen", "spf", "sun"],
    answer: "Use broad-spectrum SPF 30+ every morning, even on cloudy days. Especially important with retinoids, AHAs, or BHAs which increase sun sensitivity. Reapply every 2 hours when outdoors.",
    related: ["sunscreen-why"],
  },
  {
    keywords: ["ceramide", "hyaluronic", "moisturiz", "hydrat"],
    answer: "Ceramides rebuild the skin barrier. Hyaluronic acid draws moisture into skin. Glycerin is a humectant. These are gentle, well-tolerated ingredients that complement actives and help protect the barrier.",
    related: ["skin-barrier"],
  },
  {
    keywords: ["purge", "purging", "breakout"],
    answer: "Purging can happen when starting a retinoid or exfoliant — temporary breakouts where you normally get them, lasting 4-6 weeks. If breakouts happen in new areas or worsen after 6 weeks, the product may not be right for you.",
    related: ["purging-vs-breakout", "retinoid-basics"],
  },
  {
    keywords: ["tiktok", "trend", "viral", "influencer", "social media"],
    answer: "Skincare trends aren't designed for your specific skin. What works for an influencer may cause irritation for you. Be cautious of routines with many actives, DIY treatments, or dramatic before/afters. A dermatologist's advice is more reliable than a viral video.",
    related: ["tiktok-trends", "less-is-more"],
  },
];

export function getChatResponse(question: string): ChatResponse {
  const q = question.toLowerCase();

  for (const entry of QA_DATABASE) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return { answer: entry.answer, relatedTopics: entry.related };
    }
  }

  return {
    answer: "I can explain skincare concepts like ingredient categories, routine patterns, irritation risks, and barrier health. Try asking about a specific ingredient (retinol, salicylic acid, niacinamide), or a concept like \"what is the skin barrier\" or \"why was my routine flagged.\" For specific skin concerns, consult a dermatologist.",
    relatedTopics: ["skin-barrier", "less-is-more"],
  };
}

/* ---------- Suggested Routine Structures ---------- */

export interface SuggestedRoutine {
  label: string;
  slot: "am" | "pm";
  steps: { category: string; description: string }[];
}

export const SUGGESTED_ROUTINES: SuggestedRoutine[] = [
  {
    label: "Morning (Example)",
    slot: "am",
    steps: [
      { category: "Cleanser", description: "Gentle, pH-balanced cleanser" },
      { category: "Antioxidant", description: "Vitamin C serum (optional)" },
      { category: "Moisturizer", description: "Lightweight, non-comedogenic" },
      { category: "Sunscreen", description: "Broad-spectrum SPF 30+" },
    ],
  },
  {
    label: "Night (Example)",
    slot: "pm",
    steps: [
      { category: "Cleanser", description: "Gentle cleanser (double cleanse if wearing SPF)" },
      { category: "Treatment", description: "One active ingredient (if using)" },
      { category: "Moisturizer", description: "Slightly richer than morning" },
    ],
  },
];
