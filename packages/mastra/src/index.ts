/**
 * @tatenda/mastra
 *
 * Reusable Mastra AI package for Tatenda educational assistant.
 * Contains all agents, processors, and configuration for the AI system.
 */
import { Mastra } from "@mastra/core";

// Import all agents
import {
  tatendaFreeAgent,
  tatendaProAgent,
  getTatendaTextAgent,
} from "./agents/Tatenda";

import {
  tatendaRealtimeFreeAgent,
  tatendaRealtimeProAgent,
  getTatendaRealtimeAgent,
} from "./agents/TatendaRealtime";

import {
  tatendaImageFreeAgent,
  tatendaImageProAgent,
  getTatendaImageAgent,
} from "./agents/TatendaImage";

// Re-export agents
export * from "./agents";

// Re-export processors
export * from "./processors";

// Export individual agents for convenience
export {
  // Text agents
  tatendaFreeAgent,
  tatendaProAgent,
  getTatendaTextAgent,
  // Realtime agents
  tatendaRealtimeFreeAgent,
  tatendaRealtimeProAgent,
  getTatendaRealtimeAgent,
  // Image agents
  tatendaImageFreeAgent,
  tatendaImageProAgent,
  getTatendaImageAgent,
};

/**
 * Pre-configured Mastra instance with all Tatenda agents
 */
export const mastra = new Mastra({
  agents: {
    // Text agents
    "tatenda-free": tatendaFreeAgent,
    "tatenda-pro": tatendaProAgent,
    // Realtime agents
    "tatenda-realtime-free": tatendaRealtimeFreeAgent,
    "tatenda-realtime-pro": tatendaRealtimeProAgent,
    // Image agents
    "tatenda-image-free": tatendaImageFreeAgent,
    "tatenda-image-pro": tatendaImageProAgent,
  },
});

/**
 * Create a new Mastra instance with custom configuration
 */
export function createMastra(
  config?: Omit<ConstructorParameters<typeof Mastra>[0], "agents">
) {
  return new Mastra({
    agents: {
      "tatenda-free": tatendaFreeAgent,
      "tatenda-pro": tatendaProAgent,
      "tatenda-realtime-free": tatendaRealtimeFreeAgent,
      "tatenda-realtime-pro": tatendaRealtimeProAgent,
      "tatenda-image-free": tatendaImageFreeAgent,
      "tatenda-image-pro": tatendaImageProAgent,
    },
    ...config,
  });
}
