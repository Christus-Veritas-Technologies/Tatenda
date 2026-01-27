"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "../auth-client";

/**
 * Hook for protecting client components
 *
 * Checks if the user has an active session and redirects to /auth if not.
 * Shows a loading state while checking authentication.
 *
 * @returns {object} Object with isLoading, isAuthenticated, session, and user
 *
 * @example
 * // Usage in a client component
 * "use client";
 *
 * import { useProtectedRoute } from "@/lib/auth/use-protected-route";
 *
 * export function Dashboard() {
 *   const { isLoading, isAuthenticated, user } = useProtectedRoute();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return null; // Won't reach here, will redirect
 *
 *   return <h1>Welcome, {user?.name}</h1>;
 * }
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    // Only redirect when we're done loading and there's no session
    if (!isPending && !session?.user) {
      router.push("/auth");
    }
  }, [isPending, session, router]);

  return {
    isLoading: isPending,
    isAuthenticated,
    session,
    user: session?.user ?? null,
    error,
  };
}
