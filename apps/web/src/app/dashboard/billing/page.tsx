import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/dashboard-layout";
import db from "@tatenda/db";

export default async function BillingPage() {
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

  const creditsRemaining = user.credits;

  return (
    <DashboardLayout creditsRemaining={creditsRemaining}>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription and payment methods.</p>
      </div>
    </DashboardLayout>
  );
}
