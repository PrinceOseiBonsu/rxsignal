import type { MedicationAlert } from "@/types/medication";

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

// The demo uses its newest alert as a fixed reporting date, so it remains reproducible.
export function getDashboardStats(alerts: MedicationAlert[]) {
  const latestDate = alerts.map((alert) => alert.date).sort().at(-1);
  const end = latestDate ? Date.parse(`${latestDate}T00:00:00Z`) : 0;
  const weekStart = end - 6 * 86400000;
  return {
    active: alerts.length,
    critical: alerts.filter((alert) => alert.severity === "critical").length,
    monitored: new Set(alerts.map((alert) => alert.drugName)).size,
    updatesThisWeek: alerts.filter((alert) => {
      const date = Date.parse(`${alert.date}T00:00:00Z`);
      return date >= weekStart && date <= end;
    }).length,
    latestDate,
  };
}

export function getSignalActivity(alerts: MedicationAlert[]) {
  const latestDate = getDashboardStats(alerts).latestDate;
  if (!latestDate) return [];
  const end = Date.parse(`${latestDate}T00:00:00Z`);
  return Array.from({ length: 4 }, (_, index) => {
    const start = end - (27 - index * 7) * 86400000;
    const finish = start + 6 * 86400000;
    const date = new Date(start).toISOString().slice(0, 10);
    return {
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(start)),
      date,
      count: alerts.filter((alert) => {
        const time = Date.parse(`${alert.date}T00:00:00Z`);
        return time >= start && time <= finish;
      }).length,
    };
  });
}
