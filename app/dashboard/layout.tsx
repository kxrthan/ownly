import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Use Admin Client to safely fetch vaults bypassing RLS join bugs
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch all vaults the user is a member of
  const { data: vaultMembers } = await supabaseAdmin
    .from("vault_members")
    .select("vaults(id, name, owner_id)")
    .eq("user_id", user.id);

  const rawVaults = vaultMembers?.map(vm => vm.vaults).filter(Boolean) || [];
  
  // Deduplicate vaults to handle race conditions where multiple 'Personal Vault's are created
  const uniqueVaults = new Map();
  rawVaults.forEach((v: any) => {
    if (v.name === "Personal Vault") {
      if (!uniqueVaults.has("Personal Vault")) {
        uniqueVaults.set("Personal Vault", v);
      }
    } else {
      uniqueVaults.set(v.id, v);
    }
  });
  
  let vaults = Array.from(uniqueVaults.values());

  // If the user has NO vaults (e.g., brand new sign-up), automatically create a Personal Vault for them
  if (vaults.length === 0) {
    const { data: newVault } = await supabaseAdmin
      .from("vaults")
      .insert({ name: "Personal Vault", owner_id: user.id })
      .select("id, name, owner_id")
      .single();

    if (newVault) {
      await supabaseAdmin
        .from("vault_members")
        .insert({ vault_id: newVault.id, user_id: user.id, role: "owner" });
        
      vaults = [newVault];
    }
  }
  
  // 2. Determine active vault
  const cookieStore = await cookies();
  let activeVaultId = cookieStore.get("ownly_active_vault")?.value;
  
  if (!activeVaultId && vaults.length > 0) {
    // Default to the personal vault (where user is owner) or the first available
    const personalVault = vaults.find((v: any) => v.owner_id === user.id);
    activeVaultId = personalVault ? personalVault.id : vaults[0].id;
  }

  // 3. Fetch data ONLY for the active vault (only if we have an active vault)
  let purchases: any[] = [];
  let subscriptions: any[] = [];

  if (activeVaultId) {
    const { data: pData } = await supabase
      .from("purchases")
      .select("*")
      .eq("vault_id", activeVaultId);
    purchases = pData || [];

    const { data: sData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("vault_id", activeVaultId);
    subscriptions = sData || [];
  }

  return (
    <DashboardLayoutClient
      user={user}
      purchases={purchases || []}
      subscriptions={subscriptions || []}
      vaults={vaults}
      activeVaultId={activeVaultId}
    >
      {children}
    </DashboardLayoutClient>
  );
}
