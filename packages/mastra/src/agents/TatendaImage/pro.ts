/**
 * Tatenda Pro Image Generation Agent
 *
 * This is the pro tier image generation agent using DALL-E 3.
 * Available to users on Student and Pro plans with higher quality settings.
 */
import { Agent } from "@mastra/core/agent";
import { TATENDA_IMAGE_CONFIG, TATENDA_IMAGE_MODELS, TATENDA_IMAGE_INSTRUCTIONS } from "../config";
import { SecurityGuardrail } from "../../processors/security-guardrail";
import { OffTopicGuardrail } from "../../processors/off-topic-guardrail";

export const tatendaImageProAgent = new Agent({
  ...TATENDA_IMAGE_CONFIG,
  id: `${TATENDA_IMAGE_CONFIG.id}-pro`,
  instructions: TATENDA_IMAGE_INSTRUCTIONS,
  model: TATENDA_IMAGE_MODELS.pro,
  inputProcessors: [new SecurityGuardrail(), new OffTopicGuardrail()],
});
