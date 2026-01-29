/**
 * Tatenda Free Image Generation Agent
 *
 * This is the free tier image generation agent using DALL-E 3.
 * Available to all users on the free plan for educational image generation.
 */
import { Agent } from "@mastra/core/agent";
import { TATENDA_IMAGE_CONFIG, TATENDA_IMAGE_MODELS, TATENDA_IMAGE_INSTRUCTIONS } from "../config";
import { SecurityGuardrail } from "../../processors/security-guardrail";
import { OffTopicGuardrail } from "../../processors/off-topic-guardrail";

export const tatendaImageFreeAgent = new Agent({
  ...TATENDA_IMAGE_CONFIG,
  id: `${TATENDA_IMAGE_CONFIG.id}-free`,
  instructions: TATENDA_IMAGE_INSTRUCTIONS,
  model: TATENDA_IMAGE_MODELS.free,
  inputProcessors: [new SecurityGuardrail(), new OffTopicGuardrail()],
});
