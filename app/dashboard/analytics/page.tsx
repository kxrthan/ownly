import { createClient } from "@/lib/supabase/server";
import { getActiveVaultId } from "@/app/dashboard/actions";
import { AnalyticsUI } from "@/components/dashboard/analytics-ui";
import { Purchase } from "@/components/dashboard/dashboard-ui";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const activeVaultId = await getActiveVaultId();
  const { data: { user } } = await supabase.auth.getUser();
  const plan = user?.user_metadata?.plan || "Free";

  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  const query = supabase
    .from("purchases")
    .select("*")
    .eq('vault_id', activeVaultId)
    .order("created_at", { ascending: false });

  const { data: purchases } = await query;

  return (
    <AnalyticsUI purchases={(purchases as Purchase[]) || []} plan={plan} />
  );
}
