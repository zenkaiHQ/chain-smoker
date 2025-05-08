"use client";
import { useEffect, useState } from "react";
import { createEphemeralKeypair, generateGoogleLoginUrl } from "@/lib/zkLogin";

export default function LoginPage() {
  const [loginUrl, setLoginUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Validate environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    let redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    // Fallback to REDIRECT_URI if NEXT_PUBLIC_REDIRECT_URI is undefined
    if (!redirectUri) {
      console.warn(
        "NEXT_PUBLIC_REDIRECT_URI is undefined, falling back to hardcoded value"
      );
      redirectUri = "http://localhost:3000/api/oauth/callback";
    }

    if (!clientId) {
      setError("Missing Google Client ID in environment variables");
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is undefined");
      return;
    }

    if (!redirectUri) {
      setError("Missing Redirect URI in environment variables");
      console.error("Redirect URI is undefined");
      return;
    }

    // Generate login URL
    try {
      const { publicKey } = createEphemeralKeypair();
      const url = generateGoogleLoginUrl(clientId, redirectUri, 10, publicKey);
      setLoginUrl(url);
      console.log("Generated OAuth URL:", url); // Debug log
    } catch (err) {
      setError(`Failed to generate login URL: ${err.message}`);
      console.error("Error generating OAuth URL:", err);
    }
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <a
        href={loginUrl}
        className={`rounded bg-blue-500 px-4 py-2 text-white ${
          !loginUrl ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={(e) => !loginUrl && e.preventDefault()}
      >
        Login with Google
      </a>
    </div>
  );
}
