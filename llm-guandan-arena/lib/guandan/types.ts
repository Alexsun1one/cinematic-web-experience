export const FACE = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
] as const;

export type FaceRank = (typeof FACE)[number];
export type Rank = FaceRank | "SJ" | "BJ";
export type Suit = "S" | "H" | "D" | "C" | "J";
export type TeamId = "ns" | "ew";
export type VendorId = "deepseek" | "gemini" | "mimo" | "zhipu";
export type ProviderId = "mock" | VendorId;

export interface Card {
  id: string;
  deck: 0 | 1;
  suit: Suit;
  rank: Rank;
}

export interface SeatConfig {
  name: string;
  short: string;
  provider: ProviderId;
  vendor: VendorId;
  model: string;
}

export const SEAT_WIND = ["北", "东", "南", "西"] as const;
export const SEAT_WIND_EN = ["North", "East", "South", "West"] as const;

export function teamOf(seat: number): TeamId {
  return seat % 2 === 0 ? "ns" : "ew";
}

export function partnerOf(seat: number): number {
  return (seat + 2) % 4;
}

export const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "mock", label: "Mock" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "gemini", label: "Gemini" },
  { id: "mimo", label: "MiMo" },
  { id: "zhipu", label: "GLM" },
];

export function isProvider(value: string): value is ProviderId {
  return PROVIDERS.some((item) => item.id === value);
}

export function isFaceRank(value: string): value is FaceRank {
  return (FACE as readonly string[]).includes(value);
}
