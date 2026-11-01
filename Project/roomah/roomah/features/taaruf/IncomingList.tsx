"use client";

import { acceptRequest, rejectRequest } from "@/app/(app)/taaruf/actions";
import { useTransition } from "react";

type TReq = {
  id: number;
  requester_id: string;
  created_at: string;
  note: string | null;
};

export default function IncomingList({ requests }: { requests: TReq[] }) {
  const [pending, start] = useTransition();

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Tidak ada permintaan masuk.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {requests.map((r) => (
        <li
          key={r.id}
          className="border rounded-md p-3 flex items-center justify-between"
        >
          <div className="text-sm">
            <div>
              <span className="font-medium">Dari:</span>{" "}
              {r.requester_id.slice(0, 8)}…
            </div>
            <div className="text-muted-foreground">
              Dikirim: {new Date(r.created_at).toLocaleString()}
            </div>
            {r.note && <div className="mt-1 italic">“{r.note}”</div>}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await acceptRequest(r.id);
                  alert(res.message);
                })
              }
            >
              Terima
            </button>
            <button
              className="px-3 py-2 rounded-md border"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const note =
                    window.prompt("Alasan menolak? (opsional)") ?? undefined;
                  const res = await rejectRequest(r.id, note);
                  alert(res.message);
                })
              }
            >
              Tolak
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
