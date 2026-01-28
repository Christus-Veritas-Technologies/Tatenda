"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileAddIcon } from "@hugeicons/core-free-icons";

interface ProjectsEmptyStateProps {
  onCreateProject?: () => void;
  creditsRemaining: number;
}

export function ProjectsEmptyState({
  onCreateProject,
  creditsRemaining,
}: ProjectsEmptyStateProps) {
  const hasCredits = creditsRemaining > 0;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20">
      <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-6">
        <HugeiconsIcon
          icon={FileAddIcon}
          size={48}
          color="#7148FC"
          strokeWidth={1}
        />
      </div>
      <h3 className="text-2xl font-semibold text-foreground mb-2 text-center">
        No projects yet
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {hasCredits
          ? "Start creating your first ZIMSEC SBA project now. Your AI assistant is ready to help!"
          : "You've used all your available credits. Upgrade your plan to create more projects."}
      </p>
      {hasCredits && (
        <Button size="lg" onClick={onCreateProject}>
          Generate Your First Project
        </Button>
      )}
    </div>
  );
}
