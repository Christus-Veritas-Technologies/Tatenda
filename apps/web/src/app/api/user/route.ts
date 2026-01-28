import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import db from "@tatenda/db";

export async function GET(request: Request) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });

    if (!session?.user) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
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
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Calculate credits remaining based on plan
    const creditsPerPlan = {
      free: 0,
      student: 10,
      pro: 100,
    };

    const totalCredits = creditsPerPlan[user.plan as keyof typeof creditsPerPlan] || 0;
    const creditsUsed = user.projects.length;
    const creditsRemaining = Math.max(0, totalCredits - creditsUsed);

    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          plan: user.plan,
        },
        projects: user.projects,
        credits: {
          total: totalCredits,
          used: creditsUsed,
          remaining: creditsRemaining,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json(
      { message: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
