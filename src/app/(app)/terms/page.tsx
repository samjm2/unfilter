"use client";

import { useRouter } from "next/navigation";
import { PrivacyStep } from "@/features/onboarding/steps/PrivacyStep";
import { useAuthStore } from "@/features/auth/store";

export default function TermsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleAccept = () => {
    // Set a long-lived cookie that middleware reads to confirm terms
    document.cookie =
      "unfilter_terms_v1=1; max-age=31536000; path=/; SameSite=Lax";
    router.replace("/");
  };

  const handleDecline = async () => {
    // Sign out and go back to login — can't use the app without accepting
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center py-10">
      <PrivacyStep onAccept={handleAccept} onDecline={handleDecline} />
    </div>
  );
}
