"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingStep, Goal, TimeBudget } from "./types";
import { useOnboardingStore } from "./store";
import { useAuthStore } from "@/features/auth/store";
import { WelcomeStep } from "./steps/WelcomeStep";
import { AgeGateStep } from "./steps/AgeGateStep";
import { Under13Step } from "./steps/Under13Step";
import { PersonalizeStep } from "./steps/PersonalizeStep";
import { TutorialStep } from "./steps/TutorialStep";

const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "age-gate",
  "personalize",
  "tutorial",
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const {
    setAgeGroup,
    toggleGoal,
    setSensitivities,
    setTimeBudget,
    completeOnboarding,
  } = useOnboardingStore();
  const { user } = useAuthStore();

  const finish = () => {
    completeOnboarding();
    // Mark intro as seen so returning users skip onboarding
    document.cookie = "unfilter_intro_done=1; max-age=31536000; path=/; SameSite=Lax";
    // If already logged in (e.g. cleared localStorage), go straight to app
    router.push(user ? "/" : "/login");
  };

  const currentIdx = STEP_ORDER.indexOf(step);
  const showProgress = step !== "welcome" && step !== "complete";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-primary)]">
      {/* Progress bar */}
      {showProgress && (
        <div className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border)]/60">
          <div className="max-w-lg mx-auto px-6 py-3 flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-dark)] shrink-0">
              <span className="text-white text-[11px] font-bold" style={{ fontFamily: "Outfit" }}>U</span>
            </div>

            {/* Step bar */}
            <div className="flex-1 flex gap-1.5">
              {STEP_ORDER.slice(1).map((s, i) => {
                const stepIdx = i + 1; // offset since we skip "welcome"
                const isActive = stepIdx === currentIdx;
                const isDone = stepIdx < currentIdx;
                return (
                  <div key={s} className="flex-1">
                    <div
                      className={`h-[3px] rounded-full transition-all duration-500 ${
                        isDone
                          ? "bg-[var(--accent-dark)]"
                          : isActive
                            ? "bg-[var(--accent)]"
                            : "bg-[var(--border)]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Step count */}
            <p className="text-[11px] font-medium text-[var(--text-muted)] tabular-nums shrink-0">
              {Math.min(currentIdx, 4)}/4
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-start justify-center">
        <div className="w-full">
          {step === "welcome" && (
            <WelcomeStep onContinue={() => setStep("age-gate")} />
          )}

          {step === "age-gate" && (
            <AgeGateStep
              onSelect={(age) => {
                setAgeGroup(age);
                if (age === "under13") {
                  setStep("complete");
                } else {
                  setStep("personalize");
                }
              }}
            />
          )}

          {step === "complete" && (
            <Under13Step
              onContinueLearnOnly={finish}
            />
          )}

          {step === "personalize" && (
            <PersonalizeStep
              onContinue={(data: {
                goals: Goal[];
                sensitivities: string;
                timeBudget: TimeBudget;
              }) => {
                data.goals.forEach((g) => toggleGoal(g));
                setSensitivities(data.sensitivities);
                setTimeBudget(data.timeBudget);
                setStep("tutorial");
              }}
              onSkip={() => setStep("tutorial")}
            />
          )}

          {step === "tutorial" && <TutorialStep onFinish={finish} />}
        </div>
      </div>
    </div>
  );
}
