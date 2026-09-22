import type { ProviderId, SeatConfig, VendorId } from "./guandan/types";
import { ROSTER, type RosterSeat } from "./roster-data";

export function vendorReady(vendor: VendorId): boolean {
  const seat = ROSTER.find((item) => item.vendor === vendor);
  if (!seat) return false;
  const keyed = seat.envKeys.some((key) => Boolean(process.env[key]));
  if (!keyed) return false;
  if (seat.vendor === "mimo" && !process.env.MIMO_BASE_URL) return false;
  return true;
}

export function seatConfigs(live: boolean): [SeatConfig, SeatConfig, SeatConfig, SeatConfig] {
  return ROSTER.map((seat) => {
    const provider: ProviderId = live && vendorReady(seat.vendor) ? seat.vendor : "mock";
    return {
      name: seat.name,
      short: seat.short,
      provider,
      vendor: seat.vendor,
      model: modelFor(seat),
    };
  }) as [SeatConfig, SeatConfig, SeatConfig, SeatConfig];
}

function modelFor(seat: RosterSeat): string {
  if (seat.vendor === "deepseek") return process.env.DEEPSEEK_MODEL || seat.model;
  if (seat.vendor === "gemini") return process.env.GEMINI_MODEL || seat.model;
  if (seat.vendor === "mimo") return process.env.MIMO_MODEL || seat.model;
  return process.env.ZHIPU_MODEL || seat.model;
}

export function keyStatus() {
  return {
    deepseek: vendorReady("deepseek"),
    gemini: vendorReady("gemini"),
    mimo: vendorReady("mimo"),
    zhipu: vendorReady("zhipu"),
    typesafe: Boolean(process.env.TYPESAFE_API_KEY),
  };
}
