import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invite token is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Find the invite
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("id, org_id, email, role, status, expires_at")
      .eq("token", token)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid invite link." },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invite has already been used." },
        { status: 410 }
      );
    }

    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from("invites")
        .update({ status: "expired" })
        .eq("id", invite.id);

      return NextResponse.json(
        { error: "This invite has expired." },
        { status: 410 }
      );
    }

    // Check email matches
    if (invite.email !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite was sent to a different email address." },
        { status: 403 }
      );
    }

    // Check if user already in an org
    if (user.orgId) {
      return NextResponse.json(
        { error: "You already belong to an organization." },
        { status: 409 }
      );
    }

    // Link user to the org
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ org_id: invite.org_id, role: invite.role })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to join organization." },
        { status: 500 }
      );
    }

    // Mark invite as accepted
    await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    // Get org name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", invite.org_id)
      .single();

    return NextResponse.json({
      message: `You've joined ${org?.name || "the organization"}.`,
      orgId: invite.org_id,
      role: invite.role,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
