"use client";

import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, getSignalActivity } from "@/lib/dashboard";
import type { SignalAlert } from "@/types/medication";

function shortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export default function SignalChart({ alerts }: { alerts: SignalAlert[] }) {
  const [days, setDays] = useState(30);
  const gradientId = useId().replaceAll(":", "");
  const data = getSignalActivity(alerts, days);
  const total = data.reduce((sum, point) => sum + point.count, 0);
  const peak = Math.max(0, ...data.map((point) => point.count));
  return (
    <figure className="signal-chart">
      <div className="chart-heading"><div><span className="eyebrow">THE BIGGER PICTURE</span><h2>Signal activity</h2><p>Persisted medication-label signals by detection date.</p></div></div>
      <div className="chart-toolbar"><span className="chart-legend"><span /> Verified signals</span><div className="chart-range" role="group" aria-label="Chart time range">{[7, 30].map((range) => <button key={range} type="button" aria-pressed={days === range} onClick={() => setDays(range)}>{range} days</button>)}</div></div>
      <p className="chart-summary" role="status"><strong>{total}</strong> {total === 1 ? "signal" : "signals"} in this period <span>Peak: {peak} / day</span></p>
      <p className="chart-axis-title">Number of verified signals</p>
      <div className="chart-canvas"><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart accessibilityLayer data={data} margin={{ top: 12, right: 15, bottom: 0, left: -22 }}><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.23} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8eeed" strokeDasharray="4 4" /><XAxis dataKey="date" tickFormatter={shortDate} minTickGap={28} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} dy={8} /><YAxis allowDecimals={false} domain={[0, Math.max(2, peak)]} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} /><Tooltip labelFormatter={(label) => formatDate(String(label))} formatter={(value) => [value, "Verified signals"]} cursor={{ stroke: "#91bcb4", strokeDasharray: "4 4" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} /><Area type="linear" dataKey="count" name="Verified signals" stroke="#0f766e" strokeWidth={2.5} fill={`url(#${gradientId})`} activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>
      <figcaption>{formatDate(data[0].date)} - {formatDate(data[data.length - 1].date)} · Tiger Data history</figcaption>
    </figure>
  );
}
