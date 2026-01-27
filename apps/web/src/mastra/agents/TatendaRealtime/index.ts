/**
 * Tatenda Realtime Agents Index
 *
 * Exports all realtime audio agent variants (free and pro).
 */
export { tatendaRealtimeFreeAgent } from "./free";
export { tatendaRealtimeProAgent } from "./pro";

import { tatendaRealtimeFreeAgent } from "./free";
import { tatendaRealtimeProAgent } from "./pro";
import type { PlanTier } from "../config";

/**
 * Get the appropriate realtime agent based on the user's plan tier
 */
export function getTatendaRealtimeAgent(tier: PlanTier) {
  return tier === "pro" ? tatendaRealtimeProAgent : tatendaRealtimeFreeAgent;
}
