import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { nanoid } from "nanoid";

export async function GET(request: Request) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });

    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // For now, return empty threads as they're managed by Memory internally
    // In a production app, you'd query threads from the database
    return Response.json({ threads: [] });
  } catch (error) {
    console.error("[Threads API] Error fetching threads:", error);
    return Response.json(
      { message: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: await headers(),
        throw: true,
      },
    });

    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body as { title?: string };

    // Generate a new thread ID
    const threadId = nanoid();

    // Create thread metadata
    const thread = {
      id: threadId,
      resourceId: session.user.id,
      title: title || "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
    };

    // Memory will automatically create thread when first message is sent
    return Response.json({ thread });
  } catch (error) {
    console.error("[Threads API] Error creating thread:", error);
    return Response.json(
      { message: "Failed to create thread" },
      { status: 500 }
    );
  }
}
