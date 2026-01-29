"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        // User is signed in, redirect to dashboard
        router.replace("/dashboard");
      } else {
        // User is not signed in, redirect to auth
        router.replace("/auth");
      }
    }
  }, [session, isPending, router]);

  // Show nothing while redirecting
  return null;
}
