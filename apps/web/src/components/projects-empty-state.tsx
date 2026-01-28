"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "./ui/card";
import { useRouter } from "next/navigation";

interface ProjectsEmptyStateProps {
  onCreateProject?: () => void;
  creditsRemaining: number;
}

export function ProjectsEmptyState({
  onCreateProject,
  creditsRemaining,
}: ProjectsEmptyStateProps) {
  const hasCredits = creditsRemaining > 0;

  const router = useRouter();

  return (
    <Card className="flex flex-col mt-12 items-center justify-center self-center justify-self-center pt-0 w-fit">
      <div className="border flex flex-col justify-center items-center border-gray-200 w-full">
        <Image
          src="/icons/void.png"
          alt="No projects"
          width={192}
          height={192}
          className="object-contain"
        />
      </div>
      <article className="flex flex-col px-4 gap-6">
       <article className="flex flex-col gap-2">
         <h3 className="text-2xl font-semibold text-foreground text-center">
        No projects yet
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        {hasCredits
          ? "Start creating your first ZIMSEC SBA project now. Your AI assistant is ready to help!"
          : "You've used all your available credits. Upgrade your plan to create more projects."}
      </p>
       </article>
        {
          hasCredits ? (
            <Button 
              size="lg" 
              onClick={onCreateProject}
              disabled={!hasCredits}
            >
              Generate Your First Project
            </Button>
          ) : (
            <Button
              onClick={() => {
                router.push("/packages")
              }}
            >
              Purchase more credits
            </Button>
          )
        }
      </article>
    </Card>
  );
}
