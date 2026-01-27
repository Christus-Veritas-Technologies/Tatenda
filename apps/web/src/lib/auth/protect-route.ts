import { redirect } from "next/navigation";
import { authClient } from "../auth-client";

/**
 * Server-side authentication guard
 *
 * Protects server components and server pages by checking if the user has an active session.
 * If no session exists, redirects to the /auth page.
 *
 * @throws Will redirect to /auth if user is not authenticated
 * @returns Promise<void>
 *
 * @example
 * // Usage in a server component or page
 * export default async function ProtectedPage() {
 *   await protectRoute();
 *
 *   return <h1>This page is protected</h1>;
 * }
 */
export async function protectRoute(): Promise<void> {
  try {
    // Fetch the current session from the auth client
    const session = await authClient.getSession();

    // If no session exists, redirect to auth page
    if (!session || !session.data) {
      redirect("/auth");
    }
  } catch (error) {
    // If there's any error fetching the session, redirect to auth
    console.error("Auth check error:", error);
    redirect("/auth");
  }
}
