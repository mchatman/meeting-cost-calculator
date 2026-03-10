import { NextResponse } from "next/server";
import { getZoomAuthUrl } from "@/lib/zoom";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = getZoomAuthUrl();
  return NextResponse.redirect(url);
}
