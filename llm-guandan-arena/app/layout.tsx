import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "模型掼蛋擂台 · LLM Guandan Arena",
  description: "四模型座位的掼蛋观赛台。无密钥时以 Mock 下完合法着法。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="app-header">
          <div className="brand">
            <b>模型掼蛋擂台</b>
            <span>LLM Guandan Arena · 0+2 对 1+3</span>
          </div>
          <p className="quiet">观赛台看得见每一手。模型只在有密钥且打开实盘时发言。</p>
        </header>
        {children}
      </body>
    </html>
  );
}
