/**
 * Tatenda Pro Text Agent
 *
 * This is the pro tier text-based agent using gpt-4o.
 * Available to users on Student and Pro plans.
 */
import { Agent } from "@mastra/core/agent";
import {
  TATENDA_AGENT_CONFIG,
  TATENDA_INSTRUCTIONS,
  TATENDA_MODELS,
} from "../config";
import { generatePDFTool } from "../../tools";

export const tatendaProAgent = new Agent({
  ...TATENDA_AGENT_CONFIG,
  id: `${TATENDA_AGENT_CONFIG.id}-pro`,
  name: "tatenda-pro",
  instructions: TATENDA_INSTRUCTIONS,
  model: TATENDA_MODELS.pro,
  tools: {
    generatePDF: generatePDFTool,
  },
});
