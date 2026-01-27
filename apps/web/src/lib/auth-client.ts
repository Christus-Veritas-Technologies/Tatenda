import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth`
  : "http://localhost:3000/api/auth";

export const authClient = createAuthClient({
  baseURL,
  plugins: [magicLinkClient()],
});

// Re-export useSession for convenience
export const { useSession, signIn, signOut } = authClient;

