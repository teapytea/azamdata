"use client";

import { createRequest } from "@/app/(app)/taaruf/actions";
import { useRouter } from "next/navigation";

export default function AjukanTaarufButton({
  targetUserId,
  isLoggedIn,
}: {
  targetUserId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  return (
    <button
      className="mt-2 px-3 py-2 rounded-md bg-primary text-primary-foreground"
      onClick={async () => {
        if (!isLoggedIn) {
          router.push("/login?next=/");
          return;
        }
        const res = await createRequest(targetUserId);
        alert(res.message);
        if (res.success) router.push("/taaruf");
      }}
    >
      Ajukan Taaruf
    </button>
  );
}
