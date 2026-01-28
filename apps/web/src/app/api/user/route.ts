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

    // Get credits from database
    const creditsRemaining = user.credits;

    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          credits: user.credits,
        },
        projects: user.projects,
        credits: {
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
