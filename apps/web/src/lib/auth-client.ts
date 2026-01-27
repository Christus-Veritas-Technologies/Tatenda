import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "/api/auth", // Use local Next.js API route
  plugins: [magicLinkClient()],
});

// Re-export useSession for convenience
export const { useSession, signIn, signOut } = authClient;

