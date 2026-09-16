"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { COSMOS_NODES, colorHex, getNode, lessons } from "@/lib/cosmos";

export function CosmosHUD({
  focused,
  reduced,
  onFocus,
  onReset,
  onZoom,
  onToggleMotion,
}: {
  focused: string | null;
  reduced: boolean;
  onFocus: (id: string | null) => void;
  onReset: () => void;
  onZoom: (dir: 1 | -1) => void;
  onToggleMotion: () => void;
}) {
  const node = focused ? getNode(focused) : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-5 pt-20 md:px-8 md:pt-24 md:pb-8">
      <div className="pointer-events-none max-w-xl">
        <p className="text-xs tracking-[0.32em] text-teal uppercase">Learning Cosmos</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ivory md:text-6xl">
          把 AI 学成一座可以走进去的宇宙
        </h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-mist md:text-base">
          拖曳旋转星体，滚轮或按钮缩放，点击课程节点进入 0→1 的六站旅程。这不是装饰性地球仪，星图本身就是课程结构。
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          <button type="button" className="panel rounded-full px-3 py-1.5 text-sm" onClick={() => onZoom(-1)}>
            拉近
          </button>
          <button type="button" className="panel rounded-full px-3 py-1.5 text-sm" onClick={() => onZoom(1)}>
            拉远
          </button>
          <button type="button" className="panel rounded-full px-3 py-1.5 text-sm" onClick={onReset}>
            复位
          </button>
          <button type="button" className="panel rounded-full px-3 py-1.5 text-sm" onClick={onToggleMotion}>
            {reduced ? "开启动态" : "静止星图"}
          </button>
        </div>

        <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto pb-1">
          {lessons.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFocus(item.id)}
              className="panel shrink-0 rounded-full px-3 py-1.5 text-xs"
              style={{
                boxShadow: focused === item.id ? `0 0 0 1px ${colorHex[item.color]}` : undefined,
              }}
            >
              {item.stage} {item.title}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {node ? (
          <motion.aside
            key={node.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto panel absolute top-28 right-5 max-w-sm rounded-3xl p-5 md:top-32 md:right-8"
          >
            <p className="text-xs tracking-[0.24em] text-mute uppercase">
              {node.kind === "lesson" ? `Stage ${node.stage}` : node.english}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-ivory">{node.title}</h2>
            <p className="mt-3 text-sm leading-7 text-mist">{node.summary}</p>
            <div className="mt-5 flex gap-2">
              <Link href={node.href} className="rounded-full bg-ivory px-4 py-2 text-sm text-void no-underline">
                进入
              </Link>
              <button type="button" className="rounded-full border border-ivory/20 px-4 py-2 text-sm" onClick={() => onFocus(null)}>
                继续巡航
              </button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <span className="sr-only">
        共 {COSMOS_NODES.length} 个可检视节点。按复位可回到理解核。
      </span>
    </div>
  );
}
