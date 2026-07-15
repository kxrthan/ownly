import { createClient } from "@/lib/supabase/server";
import { getActiveVaultId } from "@/app/dashboard/actions";
import { SubscriptionsUI } from "@/components/dashboard/subscriptions-ui";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const activeVaultId = await getActiveVaultId();
  
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true });

  return (
    <SubscriptionsUI subscriptions={subscriptions || []} />
  );
}
