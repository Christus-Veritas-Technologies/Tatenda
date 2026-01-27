"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "../auth-client";

/**
 * Hook for protecting client components
 *
 * Checks if the user has an active session and redirects to /auth if not.
 * Shows a loading state while checking authentication.
 *
 * @returns {object} Object with isLoading and isAuthenticated status
 *
 * @example
 * // Usage in a client component
 * "use client";
 *
 * import { useProtectedRoute } from "@/lib/auth/use-protected-route";
 *
 * export function Dashboard() {
 *   const { isLoading, isAuthenticated } = useProtectedRoute();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return null; // Won't reach here, will redirect
 *
 *   return <h1>Welcome to Dashboard</h1>;
 * }
 */
export function useProtectedRoute() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (!session || !session.data) {
          // No session found, redirect to auth
          router.push("/auth");
          setIsAuthenticated(false);
        } else {
          // Session exists, user is authenticated
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Error checking auth, redirect to auth page
        console.error("Auth check error:", error);
        router.push("/auth");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isLoading, isAuthenticated };
}
