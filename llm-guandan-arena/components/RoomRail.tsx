"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tenantHeaders } from "@/lib/tenant-client";

interface RailRoom {
  code: string;
  status: string;
}

export function RoomRail({ tenant, currentCode }: { tenant: string; currentCode?: string }) {
  const router = useRouter();
  const [rooms, setRooms] = useState<RailRoom[]>([]);

  useEffect(() => {
    if (!tenant) {
      setRooms([]);
      return;
    }
    let gone = false;
    void fetch("/api/rooms", { headers: tenantHeaders() })
      .then((response) => response.json())
      .then((data: { tenantId?: string; rooms?: RailRoom[] }) => {
        if (gone) return;
        if (data.tenantId && data.tenantId !== tenant) return;
        setRooms((data.rooms ?? []).filter((room) => room.status !== "finished").slice(0, 8));
      })
      .catch(() => {
        if (!gone) setRooms([]);
      });
    return () => {
      gone = true;
    };
  }, [tenant, currentCode]);

  function openRoom(code: string) {
    if (code === currentCode) return;
    router.push(`/room/${code}`);
  }

  const listed = currentCode && !rooms.some((room) => room.code === currentCode)
    ? [{ code: currentCode, status: "playing" }, ...rooms]
    : rooms;

  return (
    <nav className="room-rail" data-testid="room-rail" aria-label="房间">
      <a className={`rail-item ${currentCode ? "" : "is-current"}`} href="/" data-testid="rail-lobby">
        大厅
      </a>
      {listed.map((room) => (
        <button
          key={room.code}
          type="button"
          className={`rail-item ${room.code === currentCode ? "is-current" : ""}`}
          data-testid={`rail-room-${room.code}`}
          onClick={() => openRoom(room.code)}
        >
          <i className={`rail-dot ${room.status === "playing" ? "is-active" : "is-waiting"}`} />
          {room.code}
        </button>
      ))}
    </nav>
  );
}
