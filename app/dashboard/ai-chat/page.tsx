import { createClient } from "@/lib/supabase/server";
import { AIChatUI } from "@/components/dashboard/ai-chat-ui";

export default async function AIChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const plan = user?.user_metadata?.plan || "Free";

  return <AIChatUI isFreePlan={plan === "Free"} />;
}
