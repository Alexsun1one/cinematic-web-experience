import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "模型掼蛋擂台 · LLM Guandan Arena",
  description: "四方牌桌的掼蛋观赛台。无密钥时四位模型名由 Mock 打合法着法。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
