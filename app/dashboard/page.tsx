import { DashboardUI } from "@/components/dashboard/dashboard-ui";
import { createClient } from "@/lib/supabase/server";
import { getActiveVaultId } from "@/app/dashboard/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const activeVaultId = await getActiveVaultId();
  
  const { data: { user } } = await supabase.auth.getUser();
  const plan = user?.user_metadata?.plan || "Free";

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  const query = supabase
    .from("purchases")
    .select("*")
    .eq('vault_id', activeVaultId)
    .order("created_at", { ascending: false });

  const { data: purchases } = await query;

  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .eq('vault_id', activeVaultId);

  return (
    <DashboardUI 
      purchases={purchases || []} 
      subscriptions={subscriptions || []} 
      isFreePlan={plan === "Free"}
    />
  );
}
