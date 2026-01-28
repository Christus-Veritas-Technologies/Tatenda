/**
 * Tatenda Free Text Agent
 *
 * This is the free tier text-based agent using gpt-5-mini.
 * Available to all users on the free plan.
 */
import { Agent } from "@mastra/core/agent";
import {
  TATENDA_AGENT_CONFIG,
  TATENDA_INSTRUCTIONS,
  TATENDA_MODELS,
} from "../config";
import { SecurityGuardrail } from "../../processors/security-guardrail";
import { OffTopicGuardrail } from "../../processors/off-topic-guardrail";

export const tatendaFreeAgent = new Agent({
  ...TATENDA_AGENT_CONFIG,
  id: `${TATENDA_AGENT_CONFIG.id}-free`,
  instructions: TATENDA_INSTRUCTIONS,
  model: TATENDA_MODELS.free,
  inputProcessors: [new SecurityGuardrail(), new OffTopicGuardrail()],
});
