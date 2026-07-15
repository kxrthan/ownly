import { createClient } from "@/lib/supabase/server";
import { getActiveVaultId } from "@/app/dashboard/actions";
import { PurchasesUI } from "@/components/dashboard/purchases-ui";

export default async function PurchasesPage() {
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

  return (
    <PurchasesUI purchases={purchases || []} plan={plan} />
  );
}
