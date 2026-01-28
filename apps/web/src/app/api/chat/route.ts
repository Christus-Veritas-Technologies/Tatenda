import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { mastra, tatendaFreeAgent } from "@tatenda/mastra";

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

    // Stream response with user context
    const stream = await tatendaFreeAgent.stream(
      [{ role: "user", content: message }],
      {
        onFinish: ({ text, finishReason, usage }) => {
          console.log("[Chat] Response finished:", { 
            textLength: text?.length,
            finishReason,
            usage 
          });
        },
      }
    );

    // Create a ReadableStream from the agent's textStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("[Chat] Streaming error:", error);
          controller.enqueue(encoder.encode("We couldn't process your message"));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[Chat] Error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response("We couldn't process your message", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
