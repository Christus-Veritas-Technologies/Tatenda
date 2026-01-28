/**
 * Tatenda Agents Index
 *
 * Exports all agent variants and their configuration.
 */

// Export config and types
export * from "./config";
export * from "./training-data";

// Export text agents
export {
  tatendaFreeAgent,
  tatendaProAgent,
  getTatendaTextAgent,
} from "./Tatenda";

// Export realtime agents
export {
  tatendaRealtimeFreeAgent,
  tatendaRealtimeProAgent,
  getTatendaRealtimeAgent,
} from "./TatendaRealtime";

// Export image agents
export {
  tatendaImageFreeAgent,
  tatendaImageProAgent,
  getTatendaImageAgent,
} from "./TatendaImage";
