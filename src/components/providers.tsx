"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { FeedbackProvider } from "@/components/feedback/feedback-provider";
import {
  getPreferencesServerSnapshot,
  getPreferencesSnapshot,
  subscribePreferences,
} from "@/lib/preferences-store";

// Les animations framer-motion passent par JavaScript : le CSS ne peut pas
// les couper. MotionConfig s'en charge — « user » suit le réglage du
// système, « always » s'applique quand l'utilisateur les a réduites dans
// l'app (voir /profil, section Confort).
export function Providers({ children }: { children: ReactNode }) {
  const prefs = useSyncExternalStore(
    subscribePreferences,
    getPreferencesSnapshot,
    getPreferencesServerSnapshot,
  );

  return (
    <MotionConfig reducedMotion={prefs.animations === "reduites" ? "always" : "user"}>
      <FeedbackProvider>{children}</FeedbackProvider>
    </MotionConfig>
  );
}
