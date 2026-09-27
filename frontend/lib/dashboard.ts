import type { AlertsResponse, HistoryResponse, MonitoredField, SignalAlert, SourceMetadata, TimelineEvent } from "@/types/medication";

export const SYNTHETIC_SOURCE_NAME = "RxSignal synthetic demonstration";

export function isSyntheticSource(source: SourceMetadata | null | undefined) {
  return source?.name === SYNTHETIC_SOURCE_NAME;
}

export function isSyntheticAlert(alert: SignalAlert) {
  return isSyntheticSource(alert.current_snapshot?.source);
}

export function formatDate(date: string) {
  const value = date.length === 10 ? `${date}T00:00:00Z` : date;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function formatField(field: MonitoredField) {
  return field.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export function alertHeadline(alert: SignalAlert) {
  if (alert.changes.length === 1) {
    const change = alert.changes[0];
    return `${formatField(change.field)} ${change.change_type}`;
  }
  return `${alert.changes.length} label sections changed`;
}

export function genericDisplay(alert: SignalAlert) {
  const names = alert.current_snapshot?.generic_name ?? [];
  return names.find((name) => name !== alert.medication_name) ?? names[0];
}

export function getDashboardStats(feed: AlertsResponse) {
  const now = Date.now();
  const weekStart = now - 6 * 86400000;
  return {
    active: feed.alerts.length,
    high: feed.alerts.filter((alert) => alert.priority_level === "high").length,
    monitored: feed.monitored_medications.length,
    updatesThisWeek: feed.alerts.filter((alert) => {
      const date = Date.parse(alert.detected_at);
      return date >= weekStart && date <= now;
    }).length,
  };
}

export function getSignalActivity(alerts: SignalAlert[], days = 30) {
  const end = Date.now();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end - (days - 1 - index) * 86400000).toISOString().slice(0, 10);
    return { date, count: alerts.filter((alert) => alert.detected_at.slice(0, 10) === date).length };
  });
}

export function buildTimeline(history: HistoryResponse): TimelineEvent[] {
  const signalsBySnapshot = new Map(history.signals.filter((signal) => signal.current_snapshot_id !== null).map((signal) => [signal.current_snapshot_id, signal]));
  return [...history.snapshots].sort((a, b) => a.captured_at.localeCompare(b.captured_at)).map((snapshot, index) => {
    const signal = signalsBySnapshot.get(snapshot.id);
    if (!signal) return { date: snapshot.captured_at, status: "normal", label: index === 0 ? "Monitoring baseline" : "Label snapshot", description: isSyntheticSource(snapshot.label.source) ? "Synthetic demonstration snapshot persisted by RxSignal. Not an actual FDA update." : "Normalized FDA label snapshot captured by RxSignal." };
    return { date: signal.detected_at, status: signal.priority_level === "high" ? "warning" : "update", label: signal.changed_fields.map(formatField).join(", "), description: signal.priority_reasons.join(". ") };
  });
}
