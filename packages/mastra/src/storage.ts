import { PostgresStore } from "@mastra/pg";
import { Memory } from "@mastra/memory";

// Extend the global type to include our instances
declare global {
  var pgStore: PostgresStore | undefined;
  var memory: Memory | undefined;
}

// Get or create the PostgresStore instance
function getPgStore(): PostgresStore {
  if (!global.pgStore) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    global.pgStore = new PostgresStore({
      id: "tatenda-pg-storage",
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
    });
  }
  return global.pgStore;
}

// Get or create the Memory instance
function getMemory(): Memory {
  if (!global.memory) {
    global.memory = new Memory({
      storage: getPgStore(),
      options: {
        generateTitle: true, // Automatically generate titles for threads
      },
    });
  }
  return global.memory;
}

export const storage = getPgStore();
export const memory = getMemory();
