import { NextResponse } from "next/server";
import { getZoomTokensFromCode } from "@/lib/zoom";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/?auth_error=zoom_denied", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=zoom_no_code", request.url));
  }

  try {
    const tokens = await getZoomTokensFromCode(code);

    const response = NextResponse.redirect(new URL("/?connected=zoom", request.url));

    response.cookies.set("zoom_access_token", tokens.access_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in || 3600,
      path: "/",
    });

    if (tokens.refresh_token) {
      response.cookies.set("zoom_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("Zoom OAuth error:", err);
    return NextResponse.redirect(new URL("/?auth_error=zoom_token_exchange", request.url));
  }
}
