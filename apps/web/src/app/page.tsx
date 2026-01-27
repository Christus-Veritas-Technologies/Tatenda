import { protectRoute } from "@/lib/auth/protect-route";

export default async function Home() {
  // Protect this page - redirect to /auth if user is not authenticated
  const session = await protectRoute();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="grid gap-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome, {session.user.name || session.user.email}!
          </h1>
          <p className="text-muted-foreground">
            You're signed in to Tatenda. Start creating your ZIMSEC projects.
          </p>
        </section>
        
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary p-4">
              <h3 className="font-medium text-foreground">Start New Project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new ZIMSEC SBA project
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <h3 className="font-medium text-foreground">My Projects</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage your projects
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
