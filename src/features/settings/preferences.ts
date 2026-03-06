export type TextSize = "small" | "medium" | "large";
export type ThemeMode = "light" | "dark";
export type ContrastMode = "normal" | "high";

export type AccessibilityPreferences = {
  textSize: TextSize;
  theme: ThemeMode;
  contrast: ContrastMode;
};

const STORAGE_KEY = "unfilter-accessibility-preferences";

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  textSize: "medium",
  theme: "light",
  contrast: "normal",
};

function isTextSize(value: unknown): value is TextSize {
  return value === "small" || value === "medium" || value === "large";
}

function isTheme(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

function isContrast(value: unknown): value is ContrastMode {
  return value === "normal" || value === "high";
}

function sanitizePreferences(input: unknown): AccessibilityPreferences {
  if (!input || typeof input !== "object") return DEFAULT_PREFERENCES;

  const raw = input as Partial<AccessibilityPreferences>;

  return {
    textSize: isTextSize(raw.textSize) ? raw.textSize : DEFAULT_PREFERENCES.textSize,
    theme: isTheme(raw.theme) ? raw.theme : DEFAULT_PREFERENCES.theme,
    contrast: isContrast(raw.contrast) ? raw.contrast : DEFAULT_PREFERENCES.contrast,
  };
}

export function getDefaultPreferences(): AccessibilityPreferences {
  return DEFAULT_PREFERENCES;
}

export function loadPreferences(): AccessibilityPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw);
    return sanitizePreferences(parsed);
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: AccessibilityPreferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function applyPreferencesToDocument(preferences: AccessibilityPreferences): void {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-text-size", preferences.textSize);
  document.documentElement.setAttribute("data-theme", preferences.theme);
  document.documentElement.setAttribute("data-contrast", preferences.contrast);
}

export function getPreferencesStorageKey(): string {
  return STORAGE_KEY;
}
