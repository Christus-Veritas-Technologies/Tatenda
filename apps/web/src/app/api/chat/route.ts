import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { mastra } from "@tatenda/mastra";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { message, userName, userEmail } = body as { 
      message: string; 
      userName: string; 
      userEmail: string;
    };

    if (!message) {
      return Response.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    console.log("[Chat] User:", userName, userEmail);
    console.log("[Chat] Message:", message);

    // Get the Tatenda agent from Mastra
    const agent = mastra.getAgent("tatenda");

    // Generate response with user context and memory
    const response = await agent.generate(
      `User: ${userName} (${userEmail})\nMessage: ${message}`,
      {
        memory: {
          resource: session.user.id,
          thread: `chat-${session.user.id}`,
        },
      }
    );

    console.log("[Chat] Response generated:", response.text?.substring(0, 100));

    return Response.json({
      success: true,
      response: response.text,
    });
  } catch (error) {
    console.error("[Chat] Error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      { 
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
