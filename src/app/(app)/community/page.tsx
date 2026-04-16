"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OnboardingGate } from "@/components/OnboardingGate";
import { IconUsers, IconShield, IconEye, IconX, IconCheck } from "@/components/icons";
import { PageHeader, CalloutPanel, SectionLabel } from "@/components/ui";

/* ================================================================
   TYPES
   ================================================================ */

type Role = "parent" | "friend" | "doctor" | "counselor";

interface CircleMember {
  id: string;
  name: string;
  role: Role;
  permissions: {
    routineUpdates: boolean;
    journalSummaries: boolean;
    checkInTrends: boolean;
    confidenceProgress: boolean;
  };
}

/* ================================================================
   ROLE CONFIG
   ================================================================ */

const ROLE_META: Record<Role, { label: string; color: string; bgColor: string; borderColor: string }> = {
  parent: {
    label: "Parent / Guardian",
    color: "var(--accent)",
    bgColor: "var(--accent-light)",
    borderColor: "var(--accent-light)",
  },
  friend: {
    label: "Friend",
    color: "var(--gold)",
    bgColor: "var(--gold-light)",
    borderColor: "var(--gold-light)",
  },
  doctor: {
    label: "Doctor / Dermatologist",
    color: "var(--coral)",
    bgColor: "var(--coral-light)",
    borderColor: "var(--coral-light)",
  },
  counselor: {
    label: "School Counselor",
    color: "var(--warm-700)",
    bgColor: "var(--warm-200)",
    borderColor: "var(--warm-300)",
  },
};

const PERMISSION_LABELS: Record<keyof CircleMember["permissions"], string> = {
  routineUpdates: "Routine updates",
  journalSummaries: "Journal summaries",
  checkInTrends: "Check-in trends",
  confidenceProgress: "Confidence progress",
};

/* ================================================================
   ROLE ICONS (inline SVG, no emojis)
   ================================================================ */

function RoleIcon({ role, size = 22 }: { role: Role; size?: number }) {
  const color = ROLE_META[role].color;
  switch (role) {
    case "parent":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 11v3M10 12.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "friend":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "doctor":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "counselor":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ color }}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 7v4M10 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function CommunityPage() {
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addRole, setAddRole] = useState<Role>("parent");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  const addMember = () => {
    if (!addName.trim()) return;
    const member: CircleMember = {
      id: Date.now().toString(),
      name: addName.trim(),
      role: addRole,
      permissions: {
        routineUpdates: true,
        journalSummaries: false,
        checkInTrends: true,
        confidenceProgress: false,
      },
    };
    setMembers((prev) => [...prev, member]);
    setAddName("");
    setShowAddForm(false);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (expandedMember === id) setExpandedMember(null);
  };

  const togglePermission = (id: string, key: keyof CircleMember["permissions"]) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, permissions: { ...m.permissions, [key]: !m.permissions[key] } } : m
      )
    );
  };

  return (
    <OnboardingGate>
      <AppShell>
        <div className="mx-auto max-w-4xl animate-fade-up">
          <PageHeader
            title="Trusted Circle"
            subtitle="Share parts of your skin journey with a small group of people you trust. You control exactly what each person can see."
            icon={<IconUsers size={28} />}
          />

          {/* Privacy callout */}
          <div className="mb-6 animate-fade-up stagger-1">
            <CalloutPanel icon={<IconShield size={18} />} variant="sage">
              <strong>Your circle, your rules.</strong> No one is added without your permission.
              You choose what each person can see, and you can remove anyone at any time.
              Photos are never shared — only summaries and progress you approve.
            </CalloutPanel>
          </div>

          {/* Coming Soon banner */}
          <div className="mb-6 animate-fade-up stagger-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--gold-light)] bg-[var(--gold-light)] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="icon-container icon-sm icon-amber rounded-[10px] mt-0.5">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
                    Sharing is coming soon
                  </p>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    You can set up your circle and configure privacy controls now.
                    Actual sharing will be enabled in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Circle members */}
          <div className="mb-6 animate-fade-up stagger-3">
            <SectionLabel>Your Circle</SectionLabel>

            {members.length === 0 && !showAddForm && (
              <div className="card rounded-[var(--radius-md)] p-8 text-center">
                <div className="icon-container icon-lg icon-warm rounded-[18px] mx-auto mb-4">
                  <IconUsers size={28} />
                </div>
                <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">
                  No one in your circle yet
                </p>
                <p className="text-[13px] text-[var(--text-tertiary)] mb-5 max-w-xs mx-auto">
                  Add a parent, friend, doctor, or counselor to start building your support network.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  Add someone
                </button>
              </div>
            )}

            {members.length > 0 && (
              <div className="space-y-3">
                {members.map((member) => {
                  const meta = ROLE_META[member.role];
                  const isExpanded = expandedMember === member.id;
                  const visibleCount = Object.values(member.permissions).filter(Boolean).length;

                  return (
                    <div
                      key={member.id}
                      className="card rounded-[var(--radius-md)] overflow-hidden transition-all"
                    >
                      {/* Member header */}
                      <button
                        type="button"
                        onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                        className="w-full px-5 py-4 flex items-center gap-4 text-left"
                      >
                        <div
                          className="icon-container icon-md rounded-[14px]"
                          style={{ background: meta.bgColor, color: meta.color }}
                        >
                          <RoleIcon role={member.role} size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                            {member.name}
                          </p>
                          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                            {meta.label}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-tertiary)]">
                            <IconEye size={12} />
                            {visibleCount} of {Object.keys(member.permissions).length}
                          </span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          >
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded: privacy controls */}
                      {isExpanded && (
                        <div className="px-5 pb-5 animate-fade-up">
                          <div className="rounded-[12px] bg-[var(--bg-secondary)] p-4 mb-3">
                            <p className="text-[12px] font-bold tracking-[0.08em] uppercase text-[var(--text-muted)] mb-3">
                              What {member.name.split(" ")[0]} can see
                            </p>
                            <div className="space-y-2.5">
                              {(Object.entries(PERMISSION_LABELS) as [keyof CircleMember["permissions"], string][]).map(
                                ([key, label]) => (
                                  <div key={key} className="flex items-center justify-between gap-3">
                                    <p className="text-[13px] text-[var(--text-secondary)]">{label}</p>
                                    <button
                                      type="button"
                                      role="switch"
                                      aria-checked={member.permissions[key]}
                                      onClick={() => togglePermission(member.id, key)}
                                      className={`relative shrink-0 h-7 w-12 rounded-full transition ${
                                        member.permissions[key] ? "bg-[var(--accent)]" : "bg-[var(--warm-400)]"
                                      }`}
                                    >
                                      <span
                                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                                          member.permissions[key] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="flex items-center gap-2 rounded-[10px] border border-[var(--coral)]/20 bg-[var(--coral)]/5 px-3 py-2 text-[12px] font-semibold text-[var(--coral)] hover:bg-[var(--coral)]/10 transition"
                          >
                            <IconX size={14} />
                            Remove from circle
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add member form */}
          {showAddForm && (
            <div className="mb-6 animate-fade-up">
              <SectionLabel>Add to your circle</SectionLabel>
              <div className="card rounded-[var(--radius-md)] p-5">
                {/* Name input */}
                <div className="mb-4">
                  <label
                    htmlFor="circle-name"
                    className="block text-[13px] font-semibold text-[var(--text-primary)] mb-2"
                  >
                    Their name
                  </label>
                  <input
                    id="circle-name"
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Mom, Dr. Patel, Alex"
                    className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addMember();
                    }}
                  />
                </div>

                {/* Role selector */}
                <div className="mb-5">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">
                    Their role
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([role, meta]) => {
                      const active = addRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setAddRole(role)}
                          className={`flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-all ${
                            active
                              ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                              : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          <RoleIcon role={role} size={18} />
                          <span
                            className={`text-[13px] font-semibold ${
                              active ? "text-[var(--accent-dark)]" : "text-[var(--text-secondary)]"
                            }`}
                          >
                            {meta.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addMember}
                    disabled={!addName.trim()}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <IconCheck size={16} />
                    Add to circle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddName("");
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add button (when members exist and form is hidden) */}
          {members.length > 0 && !showAddForm && (
            <div className="mb-6 animate-fade-up">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full rounded-[var(--radius-md)] border border-dashed border-[var(--border-hover)] bg-[var(--bg-card)] px-5 py-4 text-center transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
              >
                <span className="text-[14px] font-semibold text-[var(--text-secondary)]">
                  + Add another person
                </span>
              </button>
            </div>
          )}

          {/* How it works */}
          <div className="animate-fade-up stagger-4">
            <SectionLabel>How Trusted Circle works</SectionLabel>
            <div className="grid gap-3 md:grid-cols-3">
              <HowItWorksCard
                step={1}
                title="You choose who"
                description="Add people you trust. Only you can add or remove members from your circle."
              />
              <HowItWorksCard
                step={2}
                title="You choose what"
                description="Toggle exactly what each person can see. Routine updates, journal summaries, trends, or progress."
              />
              <HowItWorksCard
                step={3}
                title="Photos stay private"
                description="Your photos never leave your device. Circle members only see text summaries you approve."
              />
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="mt-8 text-center animate-fade-up stagger-5">
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
              Trusted Circle is designed around consent and control. No data is shared
              until you explicitly approve it.
            </p>
          </div>
        </div>
      </AppShell>
    </OnboardingGate>
  );
}

/* ================================================================
   HOW IT WORKS CARD
   ================================================================ */

function HowItWorksCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="card rounded-[var(--radius-md)] p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent-light)] text-[13px] font-bold text-[var(--accent)] mb-3">
        {step}
      </div>
      <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">{title}</p>
      <p className="text-[12px] text-[var(--text-tertiary)] leading-relaxed">{description}</p>
    </div>
  );
}
