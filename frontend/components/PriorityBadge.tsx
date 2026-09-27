import type { Severity } from "@/types/medication";

export default function PriorityBadge({ severity }: { severity: Severity }) {
  return <span className={`severity-badge ${severity}`}><span aria-hidden="true" />{severity}</span>;
}
