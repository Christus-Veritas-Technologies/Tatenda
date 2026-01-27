import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../auth";

/**
 * Server-side authentication guard
 *
 * Protects server components and server pages by checking if the user has an active session.
 * If no session exists, redirects to the /auth page.
 *
 * @throws Will redirect to /auth if user is not authenticated
 * @returns The session object if authenticated
 *
 * @example
 * // Usage in a server component or page
 * export default async function ProtectedPage() {
 *   const session = await protectRoute();
 *
 *   return <h1>Welcome, {session.user.name}</h1>;
 * }
 */
export async function protectRoute() {
  // Get session using server-side auth API with request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session exists, redirect to auth page
  if (!session) {
    redirect("/auth");
  }

  return session;
}
