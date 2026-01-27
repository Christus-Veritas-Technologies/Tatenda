/**
 * Tatenda Pro Text Agent
 *
 * This is the pro tier text-based agent using gpt-5.2.
 * Available to users on Student and Pro plans.
 */
import { Agent } from "@mastra/core/agent";
import {
  TATENDA_AGENT_CONFIG,
  TATENDA_INSTRUCTIONS,
  TATENDA_MODELS,
} from "../config";
import { SecurityGuardrail } from "../../processors/security-guardrail";
import { OffTopicGuardrail } from "../../processors/off-topic-guardrail";

export const tatendaProAgent = new Agent({
  ...TATENDA_AGENT_CONFIG,
  id: `${TATENDA_AGENT_CONFIG.id}-pro`,
  instructions: TATENDA_INSTRUCTIONS,
  model: TATENDA_MODELS.pro,
  inputProcessors: [new SecurityGuardrail(), new OffTopicGuardrail()],
});
