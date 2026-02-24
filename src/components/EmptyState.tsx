"use client";

import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div className="icon-container icon-xl icon-warm rounded-[20px] mb-6">
        {icon}
      </div>
      <h2 className="text-heading text-[22px] text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2 text-[15px] text-[var(--text-secondary)] max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
