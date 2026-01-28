import type { Processor, ProcessorContext } from "@mastra/core/processors";

/**
 * Off-Topic Guardrail Processor
 *
 * Filters out messages that are not related to ZIMSEC education or school projects.
 * This helps save API costs by preventing the agent from processing irrelevant requests.
 */
export class OffTopicGuardrail implements Processor {
  id = "off-topic-guardrail";

  // Keywords and phrases that indicate educational/ZIMSEC-related content
  private educationalKeywords = [
    // ZIMSEC specific
    "zimsec",
    "sba",
    "school-based assessment",
    "o level",
    "ordinary level",
    "a level",
    "advanced level",
    "form 4",
    "form 5",
    "form 6",
    "upper 6",
    "lower 6",

    // Subjects
    "biology",
    "chemistry",
    "physics",
    "mathematics",
    "maths",
    "english",
    "shona",
    "ndebele",
    "geography",
    "history",
    "heritage studies",
    "computer science",
    "ict",
    "information technology",
    "agriculture",
    "commerce",
    "accounting",
    "economics",
    "business studies",
    "food science",
    "fashion and fabrics",
    "technical graphics",
    "music",
    "art",

    // Educational terms
    "project",
    "assignment",
    "homework",
    "essay",
    "research",
    "experiment",
    "hypothesis",
    "methodology",
    "conclusion",
    "introduction",
    "abstract",
    "bibliography",
    "reference",
    "citation",
    "diagram",
    "graph",
    "table",
    "chart",
    "analysis",
    "evaluation",
    "investigation",
    "report",
    "presentation",
    "exam",
    "test",
    "quiz",
    "study",
    "learn",
    "understand",
    "explain",
    "describe",
    "compare",
    "contrast",
    "discuss",
    "define",
    "calculate",
    "solve",
    "prove",
    "demonstrate",
    "illustrate",
    "identify",
    "classify",
    "outline",
    "summarize",
    "evaluate",
    "assess",
    "analyze",

    // Zimbabwe-specific
    "zimbabwe",
    "harare",
    "bulawayo",
    "mutare",
    "gweru",
    "masvingo",
    "school",
    "teacher",
    "student",
    "learner",
    "syllabus",
    "curriculum",

    // General greetings and common interactions (allow these)
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "thank you",
    "thanks",
    "please",
    "help",
    "can you",
    "could you",
    "how do i",
    "what is",
    "why",
    "when",
    "where",
    "who",
  ];

  // Topics that are clearly off-topic
  private offTopicPatterns = [
    // Entertainment
    /\b(movie|film|netflix|youtube|tiktok|instagram|facebook|twitter|snapchat|celebrity|music video|concert|gaming|video game|fortnite|minecraft)\b/i,

    // Personal/Social
    /\b(dating|relationship advice|girlfriend|boyfriend|crush|love life|break ?up)\b/i,

    // Adult content
    /\b(adult|explicit|nsfw|porn|sex)\b/i,

    // Violence/Harmful
    /\b(weapon|gun|bomb|kill|murder|suicide|self[- ]?harm)\b/i,

    // Drugs/Illegal
    /\b(drugs|marijuana|cocaine|illegal substance|how to hack)\b/i,

    // Gambling
    /\b(betting|gamble|casino|lottery)\b/i,

    // Political (controversial)
    /\b(vote for|political party|election campaign|propaganda)\b/i,

    // Commercial/Spam
    /\b(buy now|free money|get rich quick|mlm|pyramid scheme|crypto investment)\b/i,

    // Completely unrelated
    /\b(recipe|cooking tips|fashion advice|celebrity gossip|sports betting|horoscope)\b/i,
  ];

  async processInputStep(context: ProcessorContext) {
    // Skip processing if no messages
    if (!("messages" in context)) {
      return [];
    }

    const messages = context.messages as Array<{
      role: string;
      content: string | unknown[];
    }>;
    if (!messages || messages.length === 0) {
      return [];
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.role !== "user") {
      return [];
    }

    const content =
      typeof latestMessage.content === "string"
        ? latestMessage.content.toLowerCase()
        : Array.isArray(latestMessage.content)
          ? latestMessage.content
              .filter(
                (part) =>
                  typeof part === "object" &&
                  part !== null &&
                  "type" in part &&
                  part.type === "text"
              )
              .map((part) => {
                if (
                  typeof part === "object" &&
                  part !== null &&
                  "text" in part
                ) {
                  return (part as Record<string, unknown>).text || "";
                }
                return "";
              })
              .join(" ")
              .toLowerCase()
          : "";

    // Skip very short messages (likely greetings or follow-ups)
    if (content.length < 15) {
      return [];
    }

    // Check if message contains any educational keywords
    const hasEducationalContent = this.educationalKeywords.some((keyword) =>
      content.includes(keyword.toLowerCase())
    );

    // Check if message matches off-topic patterns
    const isOffTopic = this.offTopicPatterns.some((pattern) =>
      pattern.test(content)
    );

    // Block if clearly off-topic and no educational content
    if (isOffTopic && !hasEducationalContent) {
      if ("abort" in context && typeof context.abort === "function") {
        (context.abort as Function)(
          "I'm Tatenda, your ZIMSEC educational assistant! I'm here to help you with school projects, assignments, and academic questions related to your O Level and A Level studies. Could you please ask me something related to your schoolwork? For example, I can help you with:\n\n• ZIMSEC SBA projects\n• Subject-specific questions (Sciences, Humanities, Languages, etc.)\n• Research and investigation guidance\n• Essay and report writing tips\n• Exam preparation\n\nHow can I assist with your studies today?",
          {
            retry: false,
            metadata: {
              reason: "Off-topic message detected",
              processorId: this.id,
            },
          }
        );
      }
    }

    return [];
  }
}
