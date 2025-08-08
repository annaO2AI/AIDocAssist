"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Ensure window is available (client-side only)
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      // Set cookie with secure flags
      document.cookie = `access_token=${token}; path=/; secure; samesite=strict${
        process.env.NODE_ENV === "production" ? "; secure" : ""
      }`;
      
      // Use replace to avoid adding to browser history
      router.replace("/");
    } else {
      // Redirect with error parameter
      router.replace("/auth/login?error=missing_token");
    }
  }, [router]); // Added router to dependencies

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Logging in...</p>
    </div>
  );
}