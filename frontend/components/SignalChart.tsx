"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { alerts } from "@/data/mockData";
import { getSignalActivity } from "@/lib/dashboard";

const data = getSignalActivity(alerts);
export default function SignalChart() {
  return (
    <figure className="signal-chart">
      <div className="chart-heading"><div><span className="eyebrow">THE BIGGER PICTURE</span><h2>Signal activity</h2><p>Weekly alert counts from your demo feed</p></div><span className="chart-legend"><span /> Signals</span></div>
      <div className="chart-canvas" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 700, height: 220 }}>
          <AreaChart data={data} margin={{ top: 15, right: 10, bottom: 0, left: -25 }}>
            <defs><linearGradient id="signal-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.18} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0.01} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="#e8eeed" strokeDasharray="4 4" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={10} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip labelFormatter={(label) => `Week starting ${label}`} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
            <Area type="linear" dataKey="count" name="Signals" stroke="#0f766e" strokeWidth={2.5} fill="url(#signal-fill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption>4 weeks ending Sep 15, 2026 · Mock data</figcaption>
      <details className="chart-table"><summary>View chart data</summary><table><caption className="sr-only">Weekly signal counts</caption><thead><tr><th scope="col">Week starting</th><th scope="col">Signals</th></tr></thead><tbody>{data.map((point) => <tr key={point.date}><th scope="row">{point.date}</th><td>{point.count}</td></tr>)}</tbody></table></details>
    </figure>
  );
}
