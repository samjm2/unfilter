"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { CalloutPanel, SectionLabel } from "@/components/ui";

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "red-flags"
  );

  const toggle = (id: string) =>
    setExpandedSection(expandedSection === id ? null : id);

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 animate-fade-up">
            <h1 className="text-display text-[clamp(24px,3.5vw,36px)] text-[var(--text-primary)]">
              Teen Skin Literacy Guide
            </h1>
            <p className="mt-1 text-[15px] text-[var(--text-secondary)]">
              Educational support only: filter distortion, ingredient interactions, routine simplification, and when to escalate care.
            </p>
          </div>

          <div className="mb-6 animate-fade-up stagger-1">
            <div className="card rounded-[var(--radius-md)] p-4">
              <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">
                Scope of this guide
              </p>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                It can explain filter distortion, ingredient interactions, and simpler routines, and help identify when professional care may be needed. It does not diagnose skin conditions.
              </p>
            </div>
          </div>

          {/* Urgent banner */}
          <div className="mb-6 animate-fade-up stagger-2">
            <CalloutPanel icon="🚨" variant="coral">
              <strong>If you feel very unwell right now</strong> — high fever,
              rapidly spreading rash, difficulty breathing, or severe swelling —
              tell a parent or guardian immediately and seek medical attention.
              Don&apos;t wait.
            </CalloutPanel>
          </div>

          <div className="space-y-3">
            {/* ============ RED FLAGS ============ */}
            <AccordionSection
              id="red-flags"
              icon="⚠️"
              title="When to get help"
              subtitle="Red flags that mean it's time to see someone"
              expanded={expandedSection === "red-flags"}
              onToggle={() => toggle("red-flags")}
              color="border-l-[var(--coral)]"
            >
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                Most skin concerns are mild and improve with gentle care. But
                some signs mean you should talk to a professional sooner rather
                than later:
              </p>

              <div className="space-y-2.5">
                <RedFlag
                  level="soon"
                  title="See someone within a few days"
                  items={[
                    "A rash or breakout that hasn't improved after 2–3 months of gentle care",
                    "Skin that's getting noticeably worse despite a consistent routine",
                    "Breakouts that are leaving scars or dark marks",
                    "Persistent dryness, flaking, or irritation that moisturizer doesn't fix",
                    "A new mole or spot that looks different from your others",
                  ]}
                />
                <RedFlag
                  level="prompt"
                  title="See someone within a day or two"
                  items={[
                    "A rash that's spreading quickly",
                    "Skin that's painful to the touch (not just a sore pimple)",
                    "Swelling around the eyes, lips, or throat",
                    "A warm, red area that's growing in size (possible infection)",
                    "Oozing, crusting, or yellow discharge from a skin area",
                  ]}
                />
                <RedFlag
                  level="urgent"
                  title="Get help today"
                  items={[
                    "Fever combined with a rash or skin changes",
                    "Rapidly spreading redness with warmth and pain",
                    "Signs of allergic reaction: hives, swelling, difficulty breathing",
                    "A bite or wound that's showing red streaks spreading outward",
                    "Blistering that appeared suddenly without a known cause",
                  ]}
                />
              </div>

              <div className="mt-4 rounded-xl bg-[var(--warm-100)] border border-[var(--warm-300)] px-4 py-3">
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  <strong>When in doubt, ask.</strong> It&apos;s always better
                  to check and find out it&apos;s nothing than to wait and find
                  out it wasn&apos;t. No doctor will ever be annoyed at you for
                  being cautious.
                </p>
              </div>
            </AccordionSection>

            {/* ============ ESCALATION LADDER ============ */}
            <AccordionSection
              id="escalation"
              icon="🪜"
              title="Who to talk to"
              subtitle="Step-by-step escalation, from easiest to most formal"
              expanded={expandedSection === "escalation"}
              onToggle={() => toggle("escalation")}
              color="border-l-[var(--amber)]"
            >
              <div className="space-y-3">
                <EscalationStep
                  number={1}
                  title="Parent, guardian, or trusted family member"
                  when="First step for any concern"
                  why="They know your history, can help you assess, and can make appointments. Most skin stuff is easier to handle with backup."
                  tip="Use the conversation scripts below if you're not sure how to bring it up."
                />
                <EscalationStep
                  number={2}
                  title="School nurse"
                  when="Concern during school hours, or if home isn't an option"
                  why="They can do a quick visual check, tell you if it looks concerning, and help you figure out next steps. It's free, private, and what they're there for."
                  tip="You can just walk in during lunch or a free period. You don't need a reason beyond 'I want someone to look at something on my skin.'"
                />
                <EscalationStep
                  number={3}
                  title="Primary care doctor (pediatrician / family doctor)"
                  when="Something isn't improving, or you want a professional opinion"
                  why="Your regular doctor can diagnose most skin conditions, prescribe medication if needed, and refer you to a dermatologist if it's something more complex."
                  tip="Ask your parent to schedule an appointment. You can mention it's about a skin concern so they schedule enough time."
                />
                <EscalationStep
                  number={4}
                  title="Dermatologist"
                  when="Your doctor refers you, or a skin issue is persistent/complex"
                  why="Dermatologists specialize in skin. They can handle acne that won't respond to basic treatment, identify unusual rashes, and create treatment plans for chronic conditions like eczema or psoriasis."
                  tip="Dermatologist appointments can take weeks to get. If your doctor recommends one, book early."
                />
                <EscalationStep
                  number={5}
                  title="Urgent care or ER"
                  when="Severe symptoms that can't wait for an appointment"
                  why="Allergic reactions, rapidly spreading infections, high fever with rash — these need same-day attention."
                  tip="Always go with a parent/guardian if possible. If you're alone and it's serious, call 911 or go to the nearest emergency room."
                />
              </div>
            </AccordionSection>

            {/* ============ CONVERSATION SCRIPTS ============ */}
            <AccordionSection
              id="scripts"
              icon="💬"
              title="How to bring it up"
              subtitle="Conversation starters for talking to adults about your skin"
              expanded={expandedSection === "scripts"}
              onToggle={() => toggle("scripts")}
              color="border-l-[var(--accent)]"
            >
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                It can feel awkward to bring up skin concerns with adults.
                Here are some real scripts you can use — pick the one that
                feels most natural:
              </p>

              <div className="space-y-3">
                <ScriptCard
                  context="Casual — for a parent at home"
                  script="Hey, can I show you something on my skin? It's been bothering me for [time period] and I want to know if you think I should see a doctor about it."
                />
                <ScriptCard
                  context="Direct — if you've been putting it off"
                  script="I need to talk to you about my skin. I've been trying to handle it on my own but it's not getting better. Can we look into seeing a doctor or dermatologist?"
                />
                <ScriptCard
                  context="For the school nurse"
                  script="Hi, I have a skin concern I'd like you to look at. It's [describe: itchy/painful/spreading/not going away]. Can you tell me if it looks like something I should see a doctor for?"
                />
                <ScriptCard
                  context="If it's affecting your confidence"
                  script="I know this might seem like a small thing, but my skin has been really affecting how I feel about myself. I've been avoiding [social events/photos/etc]. I think seeing a dermatologist could help. Can we make that happen?"
                />
                <ScriptCard
                  context="If a parent dismisses your concern"
                  script="I hear you that it might go away on its own, but it's been [time period] and it's bothering me. Even if it's not serious, I'd feel a lot better if a doctor looked at it. It's important to me."
                />
              </div>

              <div className="mt-4">
                <CalloutPanel icon="💛" variant="sage">
                  You deserve to have your concerns taken seriously. If the
                  first person you talk to doesn&apos;t help, try someone else.
                  School counselors, other family members, or another trusted
                  adult can also step in.
                </CalloutPanel>
              </div>
            </AccordionSection>

            {/* ============ LOCAL OPTIONS ============ */}
            <AccordionSection
              id="local"
              icon="📍"
              title="Where to go"
              subtitle="Types of places that can help — no tracking, no data collection"
              expanded={expandedSection === "local"}
              onToggle={() => toggle("local")}
              color="border-l-[#8b7ec8]"
            >
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                We don&apos;t track your location or collect any data about
                where you go. Here are the types of places that can help with
                skin concerns:
              </p>

              <div className="space-y-2.5">
                <LocationType
                  icon="🏫"
                  name="School nurse's office"
                  details="Free, during school hours. No appointment needed. They can do an initial assessment and advise on next steps."
                />
                <LocationType
                  icon="🏥"
                  name="Your regular doctor's office"
                  details="Schedule an appointment through your parent/guardian. Covered by most insurance. Can diagnose and treat most skin conditions."
                />
                <LocationType
                  icon="⚕️"
                  name="Urgent care clinic"
                  details="Walk-in, no appointment needed. For same-day concerns that aren't emergencies. Usually open evenings and weekends."
                />
                <LocationType
                  icon="🩺"
                  name="Dermatologist"
                  details="Specialist referral, usually needs an appointment (can take weeks). Your primary doctor can refer you. Best for persistent or complex skin issues."
                />
                <LocationType
                  icon="🏪"
                  name="Pharmacy / pharmacist"
                  details="For advice on over-the-counter products. Pharmacists can recommend gentle cleansers, moisturizers, and basic treatments. Free to ask."
                />
                <LocationType
                  icon="📱"
                  name="Telehealth / virtual dermatology"
                  details="Some services let you upload photos and get a dermatologist's opinion online. Ask your parent about options covered by your insurance."
                />
              </div>

              <div className="mt-4 rounded-xl bg-[var(--warm-100)] border border-[var(--warm-300)] px-4 py-3">
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  <strong>Note:</strong> Unfilter doesn&apos;t track your
                  location, doesn&apos;t know where you are, and will never
                  collect data about where you seek care. Your health journey
                  is private.
                </p>
              </div>
            </AccordionSection>
          </div>

          {/* Bottom disclaimer */}
          <div className="mt-8 text-center animate-fade-up stagger-5">
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
              Unfilter provides educational information only — not medical
              advice. In an emergency, call 911 or your local emergency
              services.
            </p>
          </div>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* ================================================================
   ACCORDION SECTION
   ================================================================ */

function AccordionSection({
  id,
  icon,
  title,
  subtitle,
  expanded,
  onToggle,
  color,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`card border-l-[3px] ${color} overflow-hidden transition-all animate-fade-up`}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-3.5 text-left"
      >
        <span className="text-[20px] shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {expanded && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

/* ================================================================
   RED FLAG CARD
   ================================================================ */

function RedFlag({
  level,
  title,
  items,
}: {
  level: "soon" | "prompt" | "urgent";
  title: string;
  items: string[];
}) {
  const styles = {
    soon: { bg: "bg-[var(--warm-100)]", border: "border-[var(--warm-300)]", dot: "bg-[var(--amber)]" },
    prompt: { bg: "bg-[var(--amber-light)]", border: "border-[var(--amber-light)]", dot: "bg-[var(--amber)]" },
    urgent: { bg: "bg-[var(--coral-light)]", border: "border-[var(--coral-light)]", dot: "bg-[var(--coral)]" },
  };
  const s = styles[level];

  return (
    <div className={`rounded-xl ${s.bg} border ${s.border} p-4`}>
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-2.5">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div
              className={`h-[6px] w-[6px] rounded-full ${s.dot} mt-[7px] shrink-0`}
            />
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   ESCALATION STEP
   ================================================================ */

function EscalationStep({
  number,
  title,
  when,
  why,
  tip,
}: {
  number: number;
  title: string;
  when: string;
  why: string;
  tip: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--warm-100)] border border-[var(--warm-300)] p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-bold text-[var(--text-secondary)] shadow-sm">
          {number}
        </div>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</p>
      </div>
      <div className="ml-10 space-y-1.5">
        <p className="text-[12px] text-[var(--text-tertiary)]">
          <strong className="text-[var(--text-secondary)]">When:</strong> {when}
        </p>
        <p className="text-[12px] text-[var(--text-tertiary)]">
          <strong className="text-[var(--text-secondary)]">Why:</strong> {why}
        </p>
        <p className="text-[12px] text-[var(--accent)] font-medium">💡 {tip}</p>
      </div>
    </div>
  );
}

/* ================================================================
   SCRIPT CARD
   ================================================================ */

function ScriptCard({ context, script }: { context: string; script: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl bg-white border border-[var(--warm-300)] p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">
          {context}
        </p>
        <button
          onClick={handleCopy}
          className="text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--accent-dark)] transition"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <p className="text-[13px] text-[var(--text-primary)] leading-relaxed italic">
        &quot;{script}&quot;
      </p>
    </div>
  );
}

/* ================================================================
   LOCATION TYPE
   ================================================================ */

function LocationType({
  icon,
  name,
  details,
}: {
  icon: string;
  name: string;
  details: string;
}) {
  return (
    <div className="flex gap-3.5 items-start rounded-xl bg-[var(--warm-100)] border border-[var(--warm-300)] p-4">
      <span className="text-[18px] shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{name}</p>
        <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed mt-0.5">
          {details}
        </p>
      </div>
    </div>
  );
}
