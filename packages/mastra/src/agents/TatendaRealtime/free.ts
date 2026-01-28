/**
 * Tatenda Free Realtime Audio Agent
 *
 * This is the free tier realtime voice agent using gpt-5-mini-realtime.
 * Available to all users on the free plan for voice conversations.
 */
import { Agent } from "@mastra/core/agent";
import { TATENDA_REALTIME_CONFIG, TATENDA_REALTIME_MODELS } from "../config";
import { SecurityGuardrail } from "../../processors/security-guardrail";
import { OffTopicGuardrail } from "../../processors/off-topic-guardrail";
import { memory } from "../../storage";

export const tatendaRealtimeFreeAgent = new Agent({
  ...TATENDA_REALTIME_CONFIG,
  id: `${TATENDA_REALTIME_CONFIG.id}-free`,
  instructions: TATENDA_REALTIME_CONFIG.instructions,
  model: TATENDA_REALTIME_MODELS.free,
  inputProcessors: [new SecurityGuardrail(), new OffTopicGuardrail()],
  memory,
});
