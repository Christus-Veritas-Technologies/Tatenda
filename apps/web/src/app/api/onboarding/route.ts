import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import db from "@tatenda/db";

export async function POST(request: Request) {
  try {
    // Get the current session
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

    const body = await request.json();

    // Validate required fields
    if (!body.fullName || !body.grade || !body.school || !body.city) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update user with onboarding data
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: body.fullName,
        age: body.age ? parseInt(body.age) : undefined,
        schoolLevel: body.schoolLevel,
        grade: body.grade,
        school: body.school,
        city: body.city,
        referralSources: body.referralSources || [],
        onboardingCompleted: true,
      },
    });

    return Response.json(
      { user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return Response.json(
      { message: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
