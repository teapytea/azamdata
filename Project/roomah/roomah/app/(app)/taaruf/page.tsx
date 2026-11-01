import { createClient } from "@/lib/supabase/client-server";
import IncomingList from "@/features/taaruf/IncomingList";
import OutgoingList from "@/features/taaruf/OutgoingList";
import HistoryList from "@/features/taaruf/HistoryList";

export default async function TaarufPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [incomingRes, outgoingRes, historyRes] = await Promise.all([
    supabase
      .from("taaruf_requests")
      .select("*")
      .eq("target_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabase
      .from("taaruf_requests")
      .select("*")
      .eq("requester_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),

    supabase
      .from("taaruf_requests")
      .select("*")
      .or(`requester_id.eq.${user.id},target_user_id.eq.${user.id}`)
      .neq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const incoming = incomingRes.data ?? [];
  const outgoing = outgoingRes.data ?? [];
  const history = historyRes.data ?? [];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Taaruf Saya</h1>

      <section className="mb-8">
        <h2 className="font-medium mb-3">
          Permintaan Masuk ({incoming.length})
        </h2>
        <IncomingList requests={incoming} />
      </section>

      <section className="mb-8">
        <h2 className="font-medium mb-3">
          Permintaan Terkirim ({outgoing.length})
        </h2>
        <OutgoingList requests={outgoing} />
      </section>

      <section>
        <h2 className="font-medium mb-3">Riwayat ({history.length})</h2>
        <HistoryList requests={history} selfId={user.id} />
      </section>
    </div>
  );
}
