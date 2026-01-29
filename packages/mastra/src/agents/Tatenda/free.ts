/**
 * Tatenda Free Text Agent
 *
 * This is the free tier text-based agent using gpt-4o.
 * Available to all users on the free plan.
 */
import { Agent } from "@mastra/core/agent";
import {
  TATENDA_AGENT_CONFIG,
  TATENDA_INSTRUCTIONS,
  TATENDA_MODELS,
} from "../config";
import { 
  generatePDFTool, 
  generateProjectTool,
  pickProjectTool,
  showTemplatesTool,
  editProjectTool,
  regenerateProjectTool,
} from "../../tools";
import { memory } from "../../storage";

export const tatendaFreeAgent = new Agent({
  ...TATENDA_AGENT_CONFIG,
  id: `${TATENDA_AGENT_CONFIG.id}-free`,
  name: "tatenda-free",
  instructions: TATENDA_INSTRUCTIONS,
  model: TATENDA_MODELS.free,
  tools: {
    generatePDF: generatePDFTool,
    generateProject: generateProjectTool,
    pickProject: pickProjectTool,
    showTemplates: showTemplatesTool,
    editProject: editProjectTool,
    regenerateProject: regenerateProjectTool,
  },
  memory,
});
