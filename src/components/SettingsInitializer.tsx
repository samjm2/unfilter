"use client";

import { useEffect } from "react";
import {
  applyPreferencesToDocument,
  getPreferencesStorageKey,
  loadPreferences,
} from "@/features/settings/preferences";

export function SettingsInitializer() {
  useEffect(() => {
    applyPreferencesToDocument(loadPreferences());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== getPreferencesStorageKey()) return;
      applyPreferencesToDocument(loadPreferences());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
