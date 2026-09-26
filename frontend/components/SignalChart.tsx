"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { demoSignalData } from "@/data/mockData";

export default function SignalChart() {
  return (
    <figure className="rounded-lg border border-slate-200 bg-white p-5">
      <figcaption className="mb-4 font-medium">Recharts setup check · fictional counts</figcaption>
      <div className="h-56 min-w-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 600, height: 224 }}>
          <LineChart data={demoSignalData}>
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} width={30} />
            <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-slate-600">Demo counts: Week 1: 2; Week 2: 4; Week 3: 3.</p>
    </figure>
  );
}
