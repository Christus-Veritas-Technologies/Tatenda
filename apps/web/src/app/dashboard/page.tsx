import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileScriptIcon, CoinsIcon, SparklesIcon } from "@hugeicons/core-free-icons";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Mock data - replace with actual user data from database
  const stats = {
    projectsGenerated: 3,
    creditsLeft: 7,
    totalCredits: 10,
    plan: "Student",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session.user.name}! Here's an overview of your Tatenda account.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Projects Generated */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projects Generated
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={FileScriptIcon}
                  size={24}
                  color="#7148FC"
                  strokeWidth={1.5}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projectsGenerated}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ZIMSEC SBA projects created
              </p>
            </CardContent>
          </Card>

          {/* Credits Left */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Credits Remaining
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={CoinsIcon}
                  size={24}
                  color="#f59e0b"
                  strokeWidth={1.5}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.creditsLeft} / {stats.totalCredits}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Projects you can still create
              </p>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Plan
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  size={24}
                  color="#10b981"
                  strokeWidth={1.5}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.plan}</div>
              <p className="text-xs text-muted-foreground mt-1">
                10 projects for $5/month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest project generations and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={FileScriptIcon}
                    size={20}
                    color="#7148FC"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Combined Science Project: Bilharzia Prevention
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generated 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={FileScriptIcon}
                    size={20}
                    color="#7148FC"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Mathematics Project: Statistics Analysis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generated yesterday
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
