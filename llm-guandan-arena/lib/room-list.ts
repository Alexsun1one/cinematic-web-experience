export type RoomListFilter = "open" | "watching" | "mine" | "full";

export interface RoomListRow {
  code: string;
  status: string;
  emptySeats: number;
}

/** One filter at a time. A row from another tenant must never be passed in. */
export function roomMatchesFilter(room: RoomListRow, filter: RoomListFilter, hosted: ReadonlySet<string>): boolean {
  if (filter === "open") return room.status === "lobby" && room.emptySeats > 0;
  if (filter === "watching") return room.status === "playing";
  if (filter === "mine") return hosted.has(room.code.toUpperCase());
  return room.emptySeats === 0 && room.status !== "finished";
}
