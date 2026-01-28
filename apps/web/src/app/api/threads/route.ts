import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { storage } from "@tatenda/mastra/storage";
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

    // Get memory store
    const memoryStore = await storage.getStore("memory");
    if (!memoryStore) {
      return Response.json({ threads: [] });
    }

    // Get threads for this user (resourceId)
    const threads = await memoryStore.getThreadsByResourceId({
      resourceId: session.user.id,
    });

    // Sort by most recent first
    const sortedThreads = threads.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return Response.json({ threads: sortedThreads });
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

    // Initialize thread in storage
    const memoryStore = await storage.getStore("memory");
    if (memoryStore) {
      await memoryStore.saveMessages({
        messages: [],
        resourceId: session.user.id,
        threadId,
      });
    }

    return Response.json({ thread });
  } catch (error) {
    console.error("[Threads API] Error creating thread:", error);
    return Response.json(
      { message: "Failed to create thread" },
      { status: 500 }
    );
  }
}
