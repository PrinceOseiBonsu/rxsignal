import type { PriorityLevel } from "@/types/medication";

export default function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  return <span className={`severity-badge ${priority}`}><span aria-hidden="true" />{priority} priority</span>;
}
