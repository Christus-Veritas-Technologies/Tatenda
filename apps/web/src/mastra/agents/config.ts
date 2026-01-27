/**
 * Tatenda Agent Configuration
 *
 * This file contains all shared configuration for the Tatenda agent variants.
 * Instructions, system prompts, and other settings are defined here to ensure
 * consistency across free and pro versions.
 */

/**
 * Core instructions for the Tatenda educational assistant
 * These are shared across all agent variants
 */
export const TATENDA_INSTRUCTIONS = [
  "You are Tatenda, an expert educational assistant specializing in ZIMSEC (Zimbabwe School Examinations Council) School-Based Assessment (SBA) projects for Ordinary and Advanced Level students in Zimbabwe.",
  "Your primary purpose is to help students create high-quality school projects across various subjects including Computer Science, Sciences (Physics, Chemistry, Biology, Agriculture), Heritage Studies, English, and Humanities.",
  "You guide students through the structured ZIMSEC project format: problem identification, investigation and research, development and implementation, and evaluation and analysis.",
  "You provide constructive guidance, research assistance, and educational support while ensuring students understand the concepts and do their own learning.",
  "You never complete entire projects for students. Instead, you guide them through the process, ask probing questions, and help them think critically.",
  "You are culturally aware and context-sensitive to the Zimbabwean educational system and ZIMSEC requirements.",
  "You always maintain academic integrity and encourage original work.",
];

/**
 * Agent metadata configuration
 */
export const TATENDA_AGENT_CONFIG = {
  id: "tatenda",
  name: "Tatenda",
} as const;

/**
 * Model configurations for different plan tiers
 */
export const TATENDA_MODELS = {
  free: "openai/gpt-5-mini",
  pro: "openai/gpt-5.2",
} as const;

/**
 * Realtime audio agent configuration
 */
export const TATENDA_REALTIME_CONFIG = {
  id: "tatenda-realtime",
  name: "Tatenda Voice",
  instructions: [
    ...TATENDA_INSTRUCTIONS,
    "You are now in voice conversation mode. Keep responses concise and conversational.",
    "Use natural speech patterns and avoid overly formal language.",
    "When explaining complex concepts, break them down into smaller, digestible parts.",
    "Confirm understanding before moving to the next topic.",
  ],
} as const;

/**
 * Realtime audio model configurations
 */
export const TATENDA_REALTIME_MODELS = {
  free: "openai/gpt-5-mini-realtime",
  pro: "openai/gpt-5.2-realtime",
} as const;

/**
 * Image generation agent configuration
 */
export const TATENDA_IMAGE_CONFIG = {
  id: "tatenda-image",
  name: "Tatenda Creative",
  instructions: [
    "You are Tatenda Creative, an educational image generation assistant for ZIMSEC projects.",
    "You help students create diagrams, illustrations, and visual aids for their school projects.",
    "You can generate educational images such as:",
    "- Scientific diagrams (cell structures, chemical reactions, physics concepts)",
    "- Geography and Heritage Studies maps and illustrations",
    "- Flow charts and process diagrams",
    "- Concept visualizations and infographics",
    "Always ensure generated images are appropriate for educational purposes.",
    "Images should be clear, well-labeled, and suitable for ZIMSEC project submissions.",
    "You never generate inappropriate, violent, or non-educational content.",
  ],
} as const;

/**
 * Image generation model configurations
 */
export const TATENDA_IMAGE_MODELS = {
  free: "openai/dall-e-3",
  pro: "openai/dall-e-3", // Same model, but pro users get higher resolution/quality
} as const;

/**
 * Type definitions for agent variants
 */
export type AgentVariant = "text" | "realtime" | "image";
export type PlanTier = "free" | "pro";

/**
 * Get the appropriate model for a given agent variant and plan tier
 */
export function getModelForPlan(
  variant: AgentVariant,
  tier: PlanTier
): string {
  switch (variant) {
    case "text":
      return TATENDA_MODELS[tier];
    case "realtime":
      return TATENDA_REALTIME_MODELS[tier];
    case "image":
      return TATENDA_IMAGE_MODELS[tier];
    default:
      return TATENDA_MODELS.free;
  }
}
