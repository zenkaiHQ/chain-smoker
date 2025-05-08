import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/lib/zkLogin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `OAuth Error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.json(
        { error: `Token exchange failed: ${errorData.error_description}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;
    if (!idToken) {
      return NextResponse.json(
        { error: "No ID token received" },
        { status: 400 }
      );
    }

    const decodedJwt = jwtDecode<JwtPayload>(idToken);

    // Use absolute URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const dashboardUrl = `${baseUrl}/dashboard?jwt=${encodeURIComponent(
      idToken
    )}`;

    return NextResponse.redirect(dashboardUrl);
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    );
  }
}
