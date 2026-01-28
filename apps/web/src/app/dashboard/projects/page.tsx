import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/dashboard-layout";
import db from "@tatenda/db";

export default async function ProjectsPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login" as any);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      projects: true,
    },
  });

  if (!user) {
    redirect("/login" as any);
  }

  const creditsPerPlan = {
    free: 0,
    student: 10,
    pro: 100,
  };

  const totalCredits = creditsPerPlan[user.plan as keyof typeof creditsPerPlan] || 0;
  const creditsRemaining = Math.max(0, totalCredits - user.projects.length);

  return (
    <DashboardLayout creditsRemaining={creditsRemaining}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Projects</h1>
        <p className="text-muted-foreground mt-2">Your ZIMSEC SBA projects will appear here.</p>
      </div>
    </DashboardLayout>
  );
}
