import { createSupabaseServer } from "./supabase-server";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  orgId: string | null;
  role: "admin" | "employee";
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, org_id, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email || "",
    fullName: profile?.full_name || null,
    orgId: profile?.org_id || null,
    role: profile?.role || "employee",
  };
}
