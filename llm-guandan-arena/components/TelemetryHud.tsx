"use client";

import { tenantHeaders } from "@/lib/tenant-client";
import { metricsToCsv, sparkValues, type PlayMetric } from "@/lib/telemetry";

export function TelemetryHud({ metrics }: { metrics: PlayMetric[] }) {
  const play = [...metrics].reverse().find((row) => row.kind === "play" || row.kind === "timeout");
  const jev = [...metrics].reverse().find((row) => row.jevMs !== null);
  const decision = [...metrics].reverse().find((row) => row.kind === "decision");
  const thinks = sparkValues(metrics, "thinkMs").slice(-24);
  const cost = jev?.costUsd ?? decision?.costUsd ?? null;
  return (
    <aside className="telemetry-hud" data-testid="telemetry-hud">
      <b>遥测</b>
      {play || jev || decision ? (
        <span data-testid="telemetry-last">
          出牌 {play?.thinkMs ?? "—"}ms · Jev {jev?.jevMs ?? "—"}ms · 反应 {decision?.reactionMs ?? play?.reactionMs ?? "—"}ms
          {cost !== null ? ` · $${cost}` : ""}
        </span>
      ) : (
        <span data-testid="telemetry-last">等待出牌</span>
      )}
      <Spark values={thinks} />
    </aside>
  );
}

export function TelemetryTable({ metrics, roomCode }: { metrics: PlayMetric[]; roomCode?: string }) {
  const rows = metrics.slice(-12).reverse();
  return (
    <div data-testid="telemetry-table">
      <div className="stats-actions">
        <button className="chip-btn tiny" type="button" data-testid="telemetry-csv" onClick={() => void exportMetrics(roomCode, metrics, "csv")}>
          遥测 CSV
        </button>
        <button className="chip-btn tiny" type="button" data-testid="telemetry-json" onClick={() => void exportMetrics(roomCode, metrics, "json")}>
          遥测 JSON
        </button>
      </div>
      <Spark values={sparkValues(metrics, "reactionMs").slice(-24)} />
      <table>
        <thead>
          <tr>
            <th>手</th>
            <th>座</th>
            <th>种类</th>
            <th>结果</th>
            <th>思考</th>
            <th>Jev</th>
            <th>反应</th>
            <th>tokens</th>
            <th>费用</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.hand}</td>
              <td>{row.seat ?? "—"}</td>
              <td>{row.kind}</td>
              <td>{row.outcome}</td>
              <td>{row.thinkMs ?? "—"}</td>
              <td>{row.jevMs ?? "—"}</td>
              <td>{row.reactionMs ?? "—"}</td>
              <td>{row.tokens ?? "—"}</td>
              <td>{row.costUsd ?? "—"}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9}>还没有遥测</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return <svg className="telemetry-spark" data-testid="telemetry-spark" viewBox="0 0 120 28" />;
  const max = Math.max(...values, 1);
  const step = 120 / (values.length - 1);
  const points = values.map((value, index) => `${index * step},${26 - (value / max) * 22}`).join(" ");
  return (
    <svg className="telemetry-spark" data-testid="telemetry-spark" viewBox="0 0 120 28" aria-hidden>
      <polyline points={points} />
    </svg>
  );
}

async function exportMetrics(roomCode: string | undefined, fallback: PlayMetric[], format: "json" | "csv") {
  let rows = fallback;
  if (roomCode) {
    const response = await fetch(`/api/room/${roomCode}/telemetry${format === "csv" ? "?format=csv" : ""}`, { headers: tenantHeaders() });
    if (response.ok) {
      if (format === "csv") {
        download("telemetry.csv", await response.text(), "text/csv");
        return;
      }
      const body = (await response.json()) as { metrics?: PlayMetric[] };
      rows = body.metrics ?? fallback;
    }
  }
  if (format === "csv") download("telemetry.csv", metricsToCsv(rows), "text/csv");
  else download("telemetry.json", JSON.stringify(rows, null, 2), "application/json");
}

function download(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
