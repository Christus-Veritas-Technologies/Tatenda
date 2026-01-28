"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    <div className="flex flex-col mt-12 items-center justify-center">
      <Card className="w-48 h-48 rounded-full overflow-hidden mb-6 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <Image
          src="/icons/void.png"
          alt="No projects"
          width={192}
          height={192}
          className="object-contain"
        />
      </Card>
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
