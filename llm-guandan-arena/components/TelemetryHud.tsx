"use client";

import { metricsToCsv, sparkValues, type PlayMetric } from "@/lib/telemetry";

export function TelemetryHud({ metrics }: { metrics: PlayMetric[] }) {
  const last = metrics.at(-1);
  const thinks = sparkValues(metrics, "thinkMs").slice(-24);
  return (
    <aside className="telemetry-hud" data-testid="telemetry-hud">
      <b>遥测</b>
      {last ? (
        <span data-testid="telemetry-last">
          座{last.seat ?? "—"} · {last.kind} · {last.outcome} · {last.thinkMs ?? "—"}ms
          {last.jevMs !== null ? ` · Jev ${last.jevMs}ms` : ""}
          {last.tokens !== null ? ` · ${last.tokens} tok` : ""}
        </span>
      ) : (
        <span data-testid="telemetry-last">等待出牌</span>
      )}
      <Spark values={thinks} />
    </aside>
  );
}

export function TelemetryTable({ metrics }: { metrics: PlayMetric[] }) {
  const rows = metrics.slice(-12).reverse();
  return (
    <div data-testid="telemetry-table">
      <div className="stats-actions">
        <button className="chip-btn tiny" type="button" data-testid="telemetry-csv" onClick={() => download("telemetry.csv", metricsToCsv(metrics), "text/csv")}>
          遥测 CSV
        </button>
        <button
          className="chip-btn tiny"
          type="button"
          data-testid="telemetry-json"
          onClick={() => download("telemetry.json", JSON.stringify(metrics, null, 2), "application/json")}
        >
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

function download(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
