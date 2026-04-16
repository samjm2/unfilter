"use client";

import { useState, useRef } from "react";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui";

interface PrivacyStepProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyStep({ onAccept, onDecline }: PrivacyStepProps) {
  const [tab, setTab] = useState<"terms" | "privacy">("terms");
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) setScrolledToBottom(true);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <h2 className="text-heading text-[22px] text-[var(--text-primary)] mb-1">
          Terms &amp; Privacy
        </h2>
        <p className="text-[13px] text-[var(--text-tertiary)]">
          Please review before continuing. Last updated February 2026.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-[var(--border)] mb-0 animate-fade-up stagger-1">
        <TabButton
          active={tab === "terms"}
          onClick={() => { setTab("terms"); setScrolledToBottom(false); }}
        >
          Terms of Service
        </TabButton>
        <TabButton
          active={tab === "privacy"}
          onClick={() => { setTab("privacy"); setScrolledToBottom(false); }}
        >
          Privacy Policy
        </TabButton>
      </div>

      {/* Scrollable legal content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[380px] overflow-y-auto border border-t-0 border-[var(--border)] bg-white rounded-b-2xl px-5 py-5 text-[13px] leading-[1.7] text-[var(--text-secondary)] animate-fade-up stagger-2"
      >
        {tab === "terms" ? <TermsContent /> : <PrivacyContent />}
      </div>

      {/* Scroll hint */}
      {!scrolledToBottom && (
        <div className="flex items-center justify-center gap-1.5 mt-2 animate-fade-in">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--text-muted)]">
            <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-[11px] text-[var(--text-muted)]">Scroll to review</p>
        </div>
      )}

      {/* Agreement notice */}
      <div className="mt-5 rounded-xl bg-[var(--warm-100)] border border-[var(--warm-300)] px-4 py-3 animate-fade-up stagger-3">
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          By tapping &quot;I Agree,&quot; you confirm that you have read and
          agree to the Terms of Service and Privacy Policy. If you are under 18,
          you confirm that your parent or legal guardian has reviewed and
          consents to these terms on your behalf.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-5 space-y-2.5 animate-fade-up stagger-4">
        <ButtonPrimary onClick={onAccept} className="w-full">
          I Agree — Continue
        </ButtonPrimary>
        <ButtonSecondary onClick={onDecline} className="w-full">
          Decline — Limited Access Only
        </ButtonSecondary>
      </div>
    </div>
  );
}

/* ================================================================
   TERMS OF SERVICE CONTENT
   ================================================================ */

function TermsContent() {
  return (
    <div className="space-y-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
        Effective Date: February 2026
      </p>

      <Section title="1. Acceptance of Terms">
        By accessing or using the Unfilter application (&quot;App&quot;), you
        agree to be bound by these Terms of Service (&quot;Terms&quot;). If you
        do not agree to these Terms, you may not use the App. If you are under
        the age of 18, your parent or legal guardian must review and agree to
        these Terms on your behalf before you use the App.
      </Section>

      <Section title="2. Description of Service">
        Unfilter is an educational skin health and confidence application
        designed for teens and young adults. The App provides educational
        guidance, skincare routine recommendations, and confidence-building
        content. <strong>Unfilter does not provide medical diagnosis,
        treatment recommendations, or clinical advice of any kind.</strong> The
        App is intended for informational and educational purposes only.
      </Section>

      <Section title="3. Eligibility">
        The App is intended for users aged 13 and older. Users under the age of
        13 may access limited features (Learn Hub and Confidence Mode only) and
        are not permitted to use photo-based check-in features. Users between
        the ages of 13 and 17 must have parental or guardian consent to use the
        App. By using the App, you represent that you meet these eligibility
        requirements.
      </Section>

      <Section title="4. Not Medical Advice">
        <strong>The information provided by Unfilter is educational in nature
        and does not constitute medical advice, diagnosis, or
        treatment.</strong> The App uses image analysis to provide general
        educational categories and guidance. These outputs are not clinical
        assessments. You should not rely on the App as a substitute for
        professional medical advice. Always consult a qualified healthcare
        provider for medical concerns. If you experience symptoms that may
        indicate a serious condition, seek medical attention promptly.
      </Section>

      <Section title="5. Privacy and Data Processing">
        Your privacy is fundamental to our design. All image processing occurs
        on your device. Photos are not uploaded to external servers. By default,
        photos are automatically deleted after each check-in session. Please
        refer to our Privacy Policy for complete details regarding data
        collection, processing, storage, and your rights.
      </Section>

      <Section title="6. User Conduct">
        You agree not to: (a) use the App for any purpose other than personal
        educational use; (b) attempt to reverse-engineer, decompile, or extract
        source code from the App; (c) use the App to generate or distribute
        harmful, misleading, or inappropriate content; (d) share or distribute
        other users&apos; information obtained through the Trusted Circle
        feature without their explicit consent.
      </Section>

      <Section title="7. Intellectual Property">
        All content, features, and functionality of the App — including but not
        limited to text, graphics, logos, icons, images, and software — are the
        property of Unfilter and are protected by applicable intellectual
        property laws. You are granted a limited, non-exclusive,
        non-transferable license to use the App for personal, non-commercial
        purposes.
      </Section>

      <Section title="8. Disclaimer of Warranties">
        The App is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, either express or implied, including but
        not limited to implied warranties of merchantability, fitness for a
        particular purpose, or non-infringement. We do not warrant that the
        App&apos;s educational guidance will be accurate, complete, or suitable
        for your specific situation.
      </Section>

      <Section title="9. Limitation of Liability">
        To the fullest extent permitted by applicable law, Unfilter and its
        developers shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, or any loss of data, use, or
        goodwill, arising out of or in connection with your use of the App.
        Our total liability shall not exceed the amount you paid to use the App
        in the twelve months preceding the claim.
      </Section>

      <Section title="10. Modifications">
        We reserve the right to modify these Terms at any time. Updated Terms
        will be posted within the App with a revised effective date. Your
        continued use of the App following any changes constitutes acceptance of
        the modified Terms.
      </Section>

      <Section title="11. Termination">
        We may suspend or terminate your access to the App at any time, with
        or without cause, and with or without notice. Upon termination, your
        right to use the App will immediately cease. Provisions that by their
        nature should survive termination shall survive.
      </Section>

      <Section title="12. Governing Law">
        These Terms shall be governed by and construed in accordance with the
        laws of the United States, without regard to conflict of law principles.
      </Section>

      <Section title="13. Contact">
        For questions regarding these Terms, please contact us through the
        App&apos;s Help &amp; Resources section.
      </Section>
    </div>
  );
}

/* ================================================================
   PRIVACY POLICY CONTENT
   ================================================================ */

function PrivacyContent() {
  return (
    <div className="space-y-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
        Effective Date: February 2026
      </p>

      <Section title="1. Introduction">
        Unfilter (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
        committed to protecting your privacy. This Privacy Policy describes how
        we collect, use, and safeguard information when you use the Unfilter
        application. This policy is designed to comply with applicable data
        protection regulations, including COPPA (Children&apos;s Online Privacy
        Protection Act) requirements for users under 13.
      </Section>

      <Section title="2. Information We Do Not Collect">
        Unfilter is designed with a privacy-first architecture. We do{" "}
        <strong>not</strong> collect, transmit, or store: (a) photos or images
        on external servers; (b) facial recognition or biometric data; (c)
        personal identifying information such as names, email addresses, or
        phone numbers; (d) location data; (e) device identifiers for tracking
        purposes; (f) usage analytics or behavioral data transmitted to third
        parties.
      </Section>

      <Section title="3. On-Device Processing">
        All image analysis and processing occurs entirely on your device using
        on-device machine learning models. Photos are never transmitted to
        external servers for analysis. This architecture ensures that your
        images remain under your exclusive control at all times.
      </Section>

      <Section title="4. Data Stored on Your Device">
        The following data may be stored locally on your device if you choose to
        save it: (a) redacted check-in photos (with face blur and EXIF data
        removed); (b) skin metrics and analysis results; (c) symptom and
        context questionnaire responses; (d) routine preferences and journal
        entries; (e) onboarding preferences (age group, goals, sensitivities).
        All locally stored data stays on this device and is never uploaded.
      </Section>

      <Section title="5. Automatic Data Deletion">
        By default, photos are automatically deleted immediately after each
        check-in session. If you choose to save check-in data, you may set a
        custom retention period after which data is automatically and
        permanently deleted. You may delete all stored data at any time using
        the &quot;Delete All Data&quot; function in Settings.
      </Section>

      <Section title="6. EXIF Data and Metadata">
        All EXIF metadata (including geolocation, device information, and
        timestamps embedded in image files) is automatically stripped from
        photos upon import into the App. This occurs before any analysis or
        storage takes place.
      </Section>

      <Section title="7. Face Detection and Redaction">
        If a face is detected in an uploaded image, the App applies automatic
        blur to facial regions by default. This feature is designed to protect
        your identity. Face detection is performed on-device and no facial
        recognition or identification is performed.
      </Section>

      <Section title="8. Trusted Circle (Community Feature)">
        If you choose to use the Trusted Circle feature: (a) shared content is
        transmitted only to members you have explicitly invited; (b) all shared
        photos are subject to the same redaction protections (face blur, EXIF
        removal, cropping); (c) you control what information is shared and with
        whom; (d) you may delete shared content or leave a circle at any time.
      </Section>

      <Section title="9. Children&apos;s Privacy (COPPA Compliance)">
        Users under the age of 13 are restricted to Learn-Only and Confidence
        Mode features. Photo-based check-in features are not available to users
        under 13. We do not knowingly collect personal information from children
        under 13. If we become aware that we have inadvertently collected
        information from a child under 13, we will take steps to delete such
        information promptly.
      </Section>

      <Section title="10. Data Export">
        You may export a summary of your check-in data as a PDF document for
        sharing with a healthcare provider, parent, or guardian. Export requires
        your explicit confirmation before any data is prepared. Exported
        documents contain only the information you choose to include.
      </Section>

      <Section title="11. Third-Party Services">
        Unfilter does not integrate with third-party analytics, advertising,
        or tracking services. The App does not contain advertisements. No data
        is shared with or sold to third parties.
      </Section>

      <Section title="12. Security">
        We implement appropriate technical measures to protect data stored on
        your device. However, no method of electronic storage is 100% secure,
        and we cannot guarantee absolute security of locally stored data.
      </Section>

      <Section title="13. Your Rights">
        You have the right to: (a) access all data stored by the App on your
        device; (b) export your data at any time; (c) delete any or all stored
        data at any time; (d) modify your privacy preferences in Settings;
        (e) withdraw consent and discontinue use of the App at any time.
      </Section>

      <Section title="14. Changes to This Policy">
        We may update this Privacy Policy from time to time. The updated policy
        will be posted within the App with a revised effective date. We
        encourage you to review this policy periodically. Continued use of the
        App after changes constitutes acceptance of the revised policy.
      </Section>

      <Section title="15. Contact">
        For questions or concerns regarding this Privacy Policy, please contact
        us through the App&apos;s Help &amp; Resources section.
      </Section>
    </div>
  );
}

/* ================================================================
   HELPER COMPONENTS
   ================================================================ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-1.5">{title}</h3>
      <div className="text-[12.5px] leading-[1.75] text-[var(--text-secondary)]">
        {children}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-3 text-[13px] font-semibold text-center transition-all
        border-b-2 -mb-px
        ${
          active
            ? "border-[var(--accent-dark)] text-[var(--text-primary)]"
            : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }
      `}
    >
      {children}
    </button>
  );
}
