/**
 * Tatenda Image Agents Index
 *
 * Exports all image generation agent variants (free and pro).
 */
export { tatendaImageFreeAgent } from "./free";
export { tatendaImageProAgent } from "./pro";

import { tatendaImageFreeAgent } from "./free";
import { tatendaImageProAgent } from "./pro";
import type { PlanTier } from "../config";

/**
 * Get the appropriate image agent based on the user's plan tier
 */
export function getTatendaImageAgent(tier: PlanTier) {
  return tier === "pro" ? tatendaImageProAgent : tatendaImageFreeAgent;
}
