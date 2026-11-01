"use client";

type TReq = {
  id: number;
  requester_id: string;
  target_user_id: string;
  status: "accepted" | "rejected" | "cancelled";
  decided_at: string | null;
  note: string | null;
  created_at: string;
};

export default function HistoryList({
  requests,
  selfId,
}: {
  requests: TReq[];
  selfId: string;
}) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>;
  }

  return (
    <ul className="space-y-2">
      {requests.map((r) => {
        const isRequester = r.requester_id === selfId;
        const otherId = isRequester ? r.target_user_id : r.requester_id;

        return (
          <li key={r.id} className="border rounded-md p-3">
            <div className="text-sm">
              <div>
                <span className="font-medium">
                  {isRequester ? "Kepada" : "Dari"}:
                </span>{" "}
                {otherId.slice(0, 8)}…
              </div>
              <div className="text-muted-foreground">
                Status: <span className="uppercase">{r.status}</span> • Dibuat:{" "}
                {new Date(r.created_at).toLocaleString()}
                {r.decided_at
                  ? ` • Diputus: ${new Date(r.decided_at).toLocaleString()}`
                  : ""}
              </div>
              {r.note && <div className="mt-1 italic">Catatan: “{r.note}”</div>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
