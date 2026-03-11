import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

// POST — admin invites one or more emails
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !user.orgId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can invite members." },
      { status: 403 }
    );
  }

  try {
    const { emails, role = "employee" } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of email addresses." },
        { status: 400 }
      );
    }

    if (emails.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 invites at a time." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const results = [];

    for (const email of emails) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        results.push({ email: normalizedEmail, status: "invalid" });
        continue;
      }

      // Check if already a member
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .eq("org_id", user.orgId)
        .maybeSingle();

      if (existingProfile) {
        results.push({ email: normalizedEmail, status: "already_member" });
        continue;
      }

      // Check if pending invite exists
      const { data: existingInvite } = await supabase
        .from("invites")
        .select("id")
        .eq("org_id", user.orgId)
        .eq("email", normalizedEmail)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        results.push({ email: normalizedEmail, status: "already_invited" });
        continue;
      }

      const token = nanoid(32);

      const { error } = await supabase.from("invites").insert({
        org_id: user.orgId,
        email: normalizedEmail,
        role: role === "admin" ? "admin" : "employee",
        invited_by: user.id,
        token,
      });

      if (error) {
        results.push({ email: normalizedEmail, status: "error" });
      } else {
        results.push({ email: normalizedEmail, status: "invited", token });
      }
    }

    return NextResponse.json({ results }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

// GET — list invites for the org
export async function GET() {
  const user = await getCurrentUser();

  if (!user || !user.orgId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can view invites." },
      { status: 403 }
    );
  }

  const supabase = getSupabase();

  const { data: invites, error } = await supabase
    .from("invites")
    .select("id, email, role, status, created_at, expires_at")
    .eq("org_id", user.orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch invites." },
      { status: 500 }
    );
  }

  return NextResponse.json({ invites });
}
