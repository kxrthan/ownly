import { createClient } from "@/lib/supabase/server";
import { ReceiptsUI } from "@/components/dashboard/receipts-ui";
import { Purchase } from "@/components/dashboard/dashboard-ui";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plan = user?.user_metadata?.plan || "Free";

  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();
  
  const query = supabase
    .from("purchases")
    .select("*")
    .eq('user_id', user?.id)
    .not("receipt_url", "is", null)
    .order("created_at", { ascending: false });

  const { data: purchases } = await query;

  // Generate temporary signed URLs for each private receipt image
  const purchasesWithUrls = purchases ? await Promise.all(
    purchases.map(async (p) => {
      // 3600 seconds = 1 hour validity
      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(p.receipt_url, 3600);
      
      return {
        ...p,
        signed_url: data?.signedUrl
      };
    })
  ) : [];

  return (
    <ReceiptsUI purchases={(purchasesWithUrls as Purchase[]) || []} plan={plan} />
  );
}
