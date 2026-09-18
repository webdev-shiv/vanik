import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = (supabaseUrl && supabasePublishableKey)
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

/**
 * Subscribe to realtime table updates for the authenticated merchant
 */
export function subscribeToMerchantRealtime(
  merchantId: string,
  onEvent: (payload: { table: string; eventType: string; newRecord: any; oldRecord: any }) => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`merchant-sync-${merchantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        filter: `merchant_id=eq.${merchantId}`,
      },
      (payload: any) => {
        onEvent({
          table: payload.table,
          eventType: payload.eventType,
          newRecord: payload.new,
          oldRecord: payload.old,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
