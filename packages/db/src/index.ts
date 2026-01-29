import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@tatenda/env/server";
import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export default prisma;

// Re-export types for convenience
export type { Template, Project, User } from "../prisma/generated/client";
