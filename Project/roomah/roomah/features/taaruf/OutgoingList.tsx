"use client";

import { cancelRequest } from "@/app/(app)/taaruf/actions";
import { useTransition } from "react";

type TReq = {
  id: number;
  target_user_id: string;
  created_at: string;
  note: string | null;
};

export default function OutgoingList({ requests }: { requests: TReq[] }) {
  const [pending, start] = useTransition();

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada permintaan terkirim.
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
              <span className="font-medium">Kepada:</span>{" "}
              {r.target_user_id.slice(0, 8)}…
            </div>
            <div className="text-muted-foreground">
              Dikirim: {new Date(r.created_at).toLocaleString()}
            </div>
            {r.note && <div className="mt-1 italic">“{r.note}”</div>}
          </div>
          <button
            className="px-3 py-2 rounded-md border"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await cancelRequest(r.id);
                alert(res.message);
              })
            }
          >
            Batalkan
          </button>
        </li>
      ))}
    </ul>
  );
}
