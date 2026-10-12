// ============================================================
// Unfilter — Check-in Flow Types
// ============================================================

/** Quality gate assessment for uploaded images */
export interface QualityReport {
  pass: boolean;
  blur: { score: number; pass: boolean; message: string };
  lighting: { score: number; pass: boolean; message: string };
  glare: { score: number; pass: boolean; message: string };
  resolution: { pass: boolean; message: string };
  overall: string; // user-facing summary
}

/** Guided context questions answered by the user */
export interface SymptomContext {
  itchOrPain: "none" | "itch" | "pain" | "both";
  duration: "today" | "fewDays" | "week" | "moreThanWeek";
  spreading: boolean;
  fever: boolean;
  newProducts: string; // free text, optional
  location: string; // body area
  stressLevel: "low" | "medium" | "high" | "skip";
}

/** Red flag signals that trigger safety escalation */
export interface RedFlagResult {
  triggered: boolean;
  flags: string[];
  escalationLevel: "none" | "monitor" | "guardian" | "nurse" | "urgentCare";
  message: string;
}

/** Educational result category */
export interface SkinCategory {
  name: string;
  confidence: number; // 0-1
  description: string;
  severity: "low" | "medium" | "high";
}

/** Metrics extracted from the image via CV pixel analysis */
export interface SkinMetrics {
  redness: number; // 0-1
  texture: number; // 0-1
  spotCount: number;
  uniformity: number; // 0-1
  reliability: number; // 0-1 — how trustworthy is this reading
  skinPixelRatio?: number; // fraction of image that was detected as skin
  analysisMethod?: "cv-pixel" | "mock"; // what ran the analysis
}

/** Full result from a check-in */
export interface CheckInResult {
  id: string;
  timestamp: number;
  quality: QualityReport;
  metrics: SkinMetrics;
  symptoms: SymptomContext;
  categories: SkinCategory[];
  redFlags: RedFlagResult;
  actionPlan: ActionPlan;
}

/** Action plan generated from results */
export interface ActionPlan {
  doItems: string[];
  avoidItems: string[];
  trackItems: string[];
  productTips: string[];
}

/** Steps in the check-in wizard */
export type CheckInStep =
  | "capture"
  | "quality"
  | "questions"
  | "analyzing"
  | "results";
