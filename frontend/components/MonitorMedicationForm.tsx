"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { ApiError, monitorMedication } from "@/lib/api";

type MonitorStatus = {
  kind: "success" | "error";
  text: string;
};

export default function MonitorMedicationForm() {
  const router = useRouter();
  const [drugName, setDrugName] = useState("");
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="monitor-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        const medicationName = drugName.trim();
        if (!medicationName) return;

        setPending(true);
        setStatus(null);

        try {
          const result = await monitorMedication(medicationName);

          if (result.baseline_created) {
            setStatus({
              kind: "success",
              text: `${medicationName} is now monitored. The current FDA label was saved as the baseline. RxSignal will compare future observations against it.`,
            });
          } else if (result.has_changes) {
            setStatus({
              kind: "success",
              text: `A verified label change was detected for ${medicationName}. The alert feed has been refreshed.`,
            });
          } else {
            setStatus({
              kind: "success",
              text: `${medicationName} is already monitored and current. No new verified label change was detected.`,
            });
          }

          setDrugName("");
          router.refresh();
        } catch (error) {
          setStatus({
            kind: "error",
            text:
              error instanceof ApiError
                ? error.message
                : "Monitoring request failed. The existing watchlist was not changed.",
          });
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="monitor-panel-heading">
        <span className="monitor-panel-icon" aria-hidden="true">
          <Plus size={18} />
        </span>
        <div>
          <p className="eyebrow">FDA label monitoring</p>
          <h2>Monitor a medication</h2>
          <p>Save the current FDA label as a baseline or check an existing baseline for a verified change.</p>
        </div>
      </div>

      <label htmlFor="monitor-drug">Medication name</label>
      <div className="monitor-action">
        <input
          id="monitor-drug"
          value={drugName}
          onChange={(event) => setDrugName(event.target.value)}
          placeholder="Enter a generic or brand name"
          autoComplete="off"
          disabled={pending}
        />
        <button type="submit" disabled={pending || !drugName.trim()}>
          {pending ? <RefreshCw className="spin" size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {pending ? "Checking FDA label..." : "Monitor medication"}
        </button>
      </div>

      {status && (
        <div className={`monitor-result ${status.kind}`} role="status" aria-live="polite">
          {status.kind === "success" ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <AlertCircle size={18} aria-hidden="true" />
          )}
          <p>{status.text}</p>
        </div>
      )}
    </form>
  );
}
