import type { Processor, ProcessorContext } from "@mastra/core/processors";

/**
 * Security Guardrail Processor
 * 
 * Prevents users from:
 * - Extracting API keys or credentials
 * - Requesting system prompts or instructions
 * - Attempting prompt injection attacks
 * - Confusing or reprogramming the agent
 */
export class SecurityGuardrail implements Processor {
  id = "security-guardrail";

  async processInputStep(context: ProcessorContext) {
    // Skip if context doesn't have messages
    if (!("messages" in context)) {
      return [];
    }

    const messages = context.messages as Array<{ role: string; content: string | unknown[] }>;
    if (!messages || messages.length === 0) {
      return [];
    }

    const latestMessage = messages[messages.length - 1];
    
    if (!latestMessage || latestMessage.role !== "user") {
      return [];
    }

    const content = typeof latestMessage.content === "string" 
      ? latestMessage.content.toLowerCase()
      : Array.isArray(latestMessage.content)
        ? latestMessage.content
            .filter((part) => typeof part === "object" && part !== null && "type" in part && (part as Record<string, unknown>).type === "text")
            .map((part) => typeof part === "object" && part !== null && "text" in part ? (part as Record<string, unknown>).text : "")
            .join(" ")
            .toLowerCase()
        : "";

    // Detect attempts to extract sensitive information
    const sensitivePatterns = [
      /api[\s\-_]*key/i,
      /secret/i,
      /credential/i,
      /password/i,
      /token/i,
      /system[\s\-_]*prompt/i,
      /instructions/i,
      /ignore[\s\-_]*(previous|all|above)/i,
      /forget[\s\-]*(everything|all|previous)/i,
      /you[\s\-_]*are[\s\-_]*now/i,
      /new[\s\-_]*role/i,
      /act[\s\-_]*as/i,
      /pretend/i,
      /\bDAN\b/i, // "Do Anything Now" jailbreak
      /jailbreak/i,
      /override/i,
      /bypass/i,
      /reveal[\s\-_]*(your|the)[\s\-_]*(prompt|instructions|system)/i,
      /show[\s\-_]*(me[\s\-_]*)?(your|the)[\s\-_]*(prompt|instructions|system)/i,
      /what[\s\-_]*(are|is)[\s\-_]*your[\s\-_]*(instructions|prompts|system)/i,
      /configuration/i,
      /admin/i,
      /root/i,
    ];

    const isBlocked = sensitivePatterns.some((pattern) => pattern.test(content));

    if (isBlocked) {
      if ("abort" in context && typeof context.abort === "function") {
        (context.abort as Function)(
          "I'm Tatenda, an educational assistant for ZIMSEC projects. I'm designed to help you with your school assignments and learning. I cannot provide system information, credentials, or change my core purpose. How can I assist you with your ZIMSEC project today?",
          {
            retry: false,
            metadata: {
              reason: "Attempted to extract sensitive information or bypass guardrails",
              processorId: this.id,
            },
          }
        );
      }
    }

    return [];
  }
}
