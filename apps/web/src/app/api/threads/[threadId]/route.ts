import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { storage } from "@tatenda/mastra/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
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

    const { threadId } = await params;

    // Get memory store
    const memoryStore = await storage.getStore("memory");
    if (!memoryStore) {
      return Response.json({ messageCount: 0 });
    }

    // Get messages for this thread
    const messages = await memoryStore.getMessages({
      threadId,
      resourceId: session.user.id,
    });

    return Response.json({ 
      messageCount: messages.length,
      isLimitReached: messages.length >= 30,
    });
  } catch (error) {
    console.error("[Thread API] Error fetching message count:", error);
    return Response.json(
      { message: "Failed to fetch message count" },
      { status: 500 }
    );
  }
}
