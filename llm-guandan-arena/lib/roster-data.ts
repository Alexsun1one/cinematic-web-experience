import type { VendorId } from "./guandan/types";

export interface RosterSeat {
  name: string;
  short: string;
  vendor: VendorId;
  model: string;
  envKeys: string[];
  baseEnv?: string;
}

export const ROSTER: [RosterSeat, RosterSeat, RosterSeat, RosterSeat] = [
  {
    name: "DeepSeek V4.1 Flash",
    short: "DeepSeek",
    vendor: "deepseek",
    model: "deepseek-v4.1-flash",
    envKeys: ["DEEPSEEK_API_KEY"],
    baseEnv: "DEEPSEEK_BASE_URL",
  },
  {
    name: "Gemini 3.8 Flash",
    short: "Gemini",
    vendor: "gemini",
    model: "gemini-3.8-flash",
    envKeys: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
  },
  {
    name: "MiMo 2.6 Flash",
    short: "MiMo",
    vendor: "mimo",
    model: "mimo-v2.6-flash",
    envKeys: ["MIMO_API_KEY"],
    baseEnv: "MIMO_BASE_URL",
  },
  {
    name: "GLM 5.3 Flash",
    short: "GLM",
    vendor: "zhipu",
    model: "glm-5.3-flash",
    envKeys: ["ZHIPU_API_KEY"],
    baseEnv: "ZHIPU_BASE_URL",
  },
];
