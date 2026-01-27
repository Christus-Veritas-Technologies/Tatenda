import { Mastra } from "@mastra/core";
import { tatendaAgent } from "./agents/tatenda-agent";

export const mastra = new Mastra({
  agents: { tatendaAgent },
});
