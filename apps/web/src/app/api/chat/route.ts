import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { tatendaFreeAgent } from "@tatenda/mastra";

// Structured response types
export type MessageType = "normal" | "pdf" | "normal-with-pdf";

export interface ChatResponse {
  messageType: MessageType;
  text: string | null;
  pdf: {
    url: string;
    name: string;
    size: string; // Formatted size (e.g., "1.2 MB")
  } | null;
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

    // Generate response with memory context (non-streaming for reliability)
    const response = await tatendaFreeAgent.generate(message, {
      memory: {
        thread: threadId,
        resource: session.user.id,
      },
    });

    console.log("[Chat] Response received:", {
      textLength: response.text?.length,
      toolCallsCount: response.toolCalls?.length || 0,
      toolResultsCount: (response as any).toolResults?.length || 0,
    });

    // Check if PDF was generated - toolResults contains executed tool results
    // Structure: { type: "tool-result", payload: { toolName, result: {...} } }
    let pdfResult: any = null;
    const toolResults = (response as any).toolResults;
    if (toolResults && Array.isArray(toolResults)) {
      for (const item of toolResults) {
        const toolName = item.payload?.toolName;
        const result = item.payload?.result;
        
        console.log("[Chat] Checking tool result:", { toolName, success: result?.success });
        
        if ((toolName === 'generatePDF' || toolName === 'generate-pdf') && result?.success) {
          pdfResult = result;
          console.log("[Chat] PDF generated:", pdfResult);
          break;
        }
      }
    }

    // Format file size helper
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    };

    // Build structured response
    const chatResponse: ChatResponse = {
      messageType: pdfResult 
        ? (response.text ? "normal-with-pdf" : "pdf") 
        : "normal",
      text: response.text || null,
      pdf: pdfResult ? {
        url: pdfResult.downloadUrl,
        name: pdfResult.fileName,
        size: formatFileSize(pdfResult.fileSize),
      } : null,
    };

    console.log("[Chat] Sending response:", {
      messageType: chatResponse.messageType,
      hasText: !!chatResponse.text,
      hasPdf: !!chatResponse.pdf,
    });

    return Response.json(chatResponse);

  } catch (error) {
    console.error("[Chat] Error:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return error as structured response
    const errorResponse: ChatResponse = {
      messageType: "normal",
      text: "We couldn't process your message. Please try again.",
      pdf: null,
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
