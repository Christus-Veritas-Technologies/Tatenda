/**
 * Tatenda Pro Realtime Audio Agent
 *
 * This is the pro tier realtime voice agent using gpt-5.2-realtime.
 * Available to users on Student and Pro plans for voice conversations.
 */
import { Agent } from "@mastra/core/agent";
import { TATENDA_REALTIME_CONFIG, TATENDA_REALTIME_MODELS } from "../config";
import { SecurityGuardrail } from "../../processors/security-guardrail";
import { OffTopicGuardrail } from "../../processors/off-topic-guardrail";
import { memory } from "../../storage";

export const tatendaRealtimeProAgent = new Agent({
  ...TATENDA_REALTIME_CONFIG,
  id: `${TATENDA_REALTIME_CONFIG.id}-pro`,
  instructions: TATENDA_REALTIME_CONFIG.instructions,
  model: TATENDA_REALTIME_MODELS.pro,
  inputProcessors: [new SecurityGuardrail(), new OffTopicGuardrail()],
  memory,
});
