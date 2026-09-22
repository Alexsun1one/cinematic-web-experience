"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readLockedTenant, rememberHosted, tenantHeaders } from "@/lib/tenant-client";

export default function WatchNowPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let gone = false;
    async function run() {
      try {
        const tenant = readLockedTenant() || "default";
        const created = await fetch("/api/rooms", {
          method: "POST",
          headers: tenantHeaders({ "content-type": "application/json" }),
          body: JSON.stringify({ series: "three", startLevel: "T", seatsOpen: true, autoFillMock: true, tenantId: tenant }),
        });
        const room = (await created.json()) as { code?: string; hostSecret?: string; error?: string };
        if (!created.ok || !room.code || !room.hostSecret) throw new Error(room.error || "开房失败");
        localStorage.setItem(`guandan-room-host:${room.code}`, room.hostSecret);
        rememberHosted(tenant, room.code);
        const started = await fetch(`/api/rooms/${room.code}/start`, {
          method: "POST",
          headers: tenantHeaders({ "content-type": "application/json", "x-room-host": room.hostSecret }),
          body: JSON.stringify({ hostSecret: room.hostSecret, tenantId: tenant }),
        });
        const live = (await started.json()) as { error?: string; status?: string };
        if (!started.ok || live.status !== "playing") throw new Error(live.error || "开打失败");
        if (!gone) router.replace(`/room/${room.code}?role=spectator`);
      } catch (cause) {
        if (!gone) setError(cause instanceof Error ? cause.message : "围观失败");
      }
    }
    void run();
    return () => {
      gone = true;
    };
  }, [router]);

  return (
    <main className="room quiet" data-testid="watch-now">
      <p>{error || "正在开房并进入围观…"}</p>
      {error ? <a className="chip-btn" href="/">回大厅</a> : null}
    </main>
  );
}
