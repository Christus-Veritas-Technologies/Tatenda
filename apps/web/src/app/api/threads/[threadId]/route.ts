import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

// In-memory message counter (in production, use database)
const threadMessageCounts = new Map<string, number>();

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

    // Get message count from in-memory store
    const messageCount = threadMessageCounts.get(threadId) || 0;

    return Response.json({ 
      messageCount,
      isLimitReached: messageCount >= 30,
    });
  } catch (error) {
    console.error("[Thread API] Error fetching message count:", error);
    return Response.json(
      { message: "Failed to fetch message count" },
      { status: 500 }
    );
  }
}

// Export function to increment message count
export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const count = (threadMessageCounts.get(threadId) || 0) + 1;
    threadMessageCounts.set(threadId, count);
    
    return Response.json({ 
      messageCount: count,
      isLimitReached: count >= 30,
    });
  } catch (error) {
    return Response.json(
      { message: "Failed to increment count" },
      { status: 500 }
    );
  }
}
