import { createClient } from "@/lib/supabase/server";
import { getActiveVaultId } from "@/app/dashboard/actions";
import { WarrantiesUI } from "@/components/dashboard/warranties-ui";
import { Purchase } from "@/components/dashboard/dashboard-ui";

export default async function WarrantiesPage() {
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
    .gt("warranty_months", 0)
    .order("created_at", { ascending: false });

  const { data: purchases } = await query;

  return (
    <WarrantiesUI purchases={(purchases as Purchase[]) || []} />
  );
}
