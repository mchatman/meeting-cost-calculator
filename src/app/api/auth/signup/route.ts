import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, orgName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServer();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    // If org name provided, create the org and link the user as admin
    if (orgName) {
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: orgName, slug })
        .select("id")
        .single();

      if (!orgError && org) {
        await supabase
          .from("profiles")
          .update({ org_id: org.id, role: "admin" })
          .eq("id", authData.user.id);
      }
    }

    return NextResponse.json(
      { user: { id: authData.user.id, email: authData.user.email } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
