/**
 * Tatenda Text Agents Index
 *
 * Exports all text-based agent variants (free and pro).
 */
export { tatendaFreeAgent } from "./free";
export { tatendaProAgent } from "./pro";

import { tatendaFreeAgent } from "./free";
import { tatendaProAgent } from "./pro";
import type { PlanTier } from "../config";

/**
 * Get the appropriate text agent based on the user's plan tier
 */
export function getTatendaTextAgent(tier: PlanTier) {
  return tier === "pro" ? tatendaProAgent : tatendaFreeAgent;
}
