import { Mastra } from "@mastra/core";

// Text agents
import { tatendaFreeAgent, tatendaProAgent, getTatendaTextAgent } from "./agents/Tatenda";

// Realtime audio agents
import {
  tatendaRealtimeFreeAgent,
  tatendaRealtimeProAgent,
  getTatendaRealtimeAgent,
} from "./agents/TatendaRealtime";

// Image generation agents
import {
  tatendaImageFreeAgent,
  tatendaImageProAgent,
  getTatendaImageAgent,
} from "./agents/TatendaImage";

// Export agent config and types
export * from "./agents/config";

// Export individual agents
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

export const mastra = new Mastra({
  agents: {
    // Text agents
    tatendaFreeAgent,
    tatendaProAgent,
    // Realtime agents
    tatendaRealtimeFreeAgent,
    tatendaRealtimeProAgent,
    // Image agents
    tatendaImageFreeAgent,
    tatendaImageProAgent,
  },
});
