import { NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?auth_error=denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=no_code", request.url));
  }

  try {
    const tokens = await getTokensFromCode(code);

    // Store access token in a httpOnly cookie
    const response = NextResponse.redirect(new URL("/?connected=google", request.url));

    response.cookies.set("google_access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : 3600,
      path: "/",
    });

    if (tokens.refresh_token) {
      response.cookies.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(new URL("/?auth_error=token_exchange", request.url));
  }
}
