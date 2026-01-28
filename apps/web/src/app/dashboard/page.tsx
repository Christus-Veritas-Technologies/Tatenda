import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectCard } from "@/components/project-card";
import { ProjectsEmptyState } from "@/components/projects-empty-state";
import db from "@tatenda/db";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login" as any);
  }

  // Fetch user with projects
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login" as any);
  }

  // Calculate credits
  const creditsPerPlan = {
    free: 0,
    student: 10,
    pro: 100,
  };

  const totalCredits = creditsPerPlan[user.plan as keyof typeof creditsPerPlan] || 0;
  const creditsUsed = user.projects.length;
  const creditsRemaining = Math.max(0, totalCredits - creditsUsed);

  return (
    <DashboardLayout creditsRemaining={creditsRemaining}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">
            All your ZIMSEC SBA projects in one place
          </p>
        </div>

        {/* Projects Grid or Empty State */}
        {user.projects.length === 0 ? (
          <ProjectsEmptyState creditsRemaining={creditsRemaining} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description || undefined}
                subject={project.subject || undefined}
                createdAt={project.createdAt}
                onView={(id) => {
                  // TODO: Navigate to project view
                  console.log("View project:", id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
