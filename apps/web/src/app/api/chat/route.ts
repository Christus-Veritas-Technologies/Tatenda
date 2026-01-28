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
    const { message, userName, userEmail, threadId } = body as { 
      message: string; 
      userName: string; 
      userEmail: string;
      threadId: string;
    };

    if (!message) {
      return Response.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    if (!threadId) {
      return Response.json(
        { message: "Thread ID is required" },
        { status: 400 }
      );
    }

    console.log("[Chat] User:", userName, userEmail);
    console.log("[Chat] Thread ID:", threadId);
    console.log("[Chat] Message:", message);

    // Increment message count
    await fetch(`${request.url.split('/api/')[0]}/api/threads/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(err => console.error("[Chat] Failed to increment message count:", err));

    // Stream response with memory context
    const stream = await tatendaFreeAgent.stream(
      message,
      {
        memory: {
          thread: threadId,
          resource: session.user.id,
        },
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
    let toolCallResults: any[] = [];
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Listen for tool calls
          for await (const chunk of stream.fullStream) {
            // Check if this chunk contains tool results
            if (chunk.type === 'tool-result') {
              toolCallResults.push(chunk);
            }
          }

          // Stream the text response
          for await (const textChunk of stream.textStream) {
            controller.enqueue(encoder.encode(textChunk));
          }

          // If PDF was generated, append PDF metadata as JSON
          const pdfToolResult = toolCallResults.find(
            (result: any) => result.toolName === 'generatePDF' && result.result?.success
          );

          if (pdfToolResult?.result) {
            const pdfData = pdfToolResult.result;
            const pdfMetadata = JSON.stringify({
              __PDF_ATTACHMENT__: true,
              fileName: pdfData.fileName,
              fileSize: pdfData.fileSize,
              downloadUrl: pdfData.downloadUrl,
              createdAt: pdfData.createdAt,
            });
            controller.enqueue(encoder.encode(`\n\n${pdfMetadata}`));
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
