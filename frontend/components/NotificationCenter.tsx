"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellRing, CheckCheck, FlaskConical } from "lucide-react";
import PriorityBadge from "@/components/PriorityBadge";
import { getAlerts } from "@/lib/api";
import { ALERTS_CHANGED_EVENT, alertHeadline, formatDate, isSyntheticAlert } from "@/lib/dashboard";
import type { SignalAlert } from "@/types/medication";

const READ_SIGNAL_IDS_KEY = "rxsignal.readSignalIds.v1";

function storedReadIds(): Set<number> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(READ_SIGNAL_IDS_KEY) ?? "[]");
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((id): id is number => Number.isInteger(id) && id >= 0));
  } catch {
    return new Set();
  }
}

export default function NotificationCenter() {
  const [alerts, setAlerts] = useState<SignalAlert[]>([]);
  const [readSignalIds, setReadSignalIds] = useState<Set<number>>(new Set());
  const [storageReady, setStorageReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshAlerts = useCallback(async () => {
    try {
      const feed = await getAlerts();
      setAlerts(feed.alerts);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeStorage = () => {
      setReadSignalIds(storedReadIds());
      setStorageReady(true);
    };
    const storageTimer = window.setTimeout(initializeStorage, 0);
    const syncStorage = (event: StorageEvent) => {
      if (event.key === READ_SIGNAL_IDS_KEY) initializeStorage();
    };
    const refresh = () => void refreshAlerts();
    const refreshTimer = window.setTimeout(refresh, 0);
    window.addEventListener("focus", refresh);
    window.addEventListener(ALERTS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.clearTimeout(storageTimer);
      window.clearTimeout(refreshTimer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener(ALERTS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", syncStorage);
    };
  }, [refreshAlerts]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const unreadIds = useMemo(
    () => alerts.filter((alert) => !readSignalIds.has(alert.id)).map((alert) => alert.id),
    [alerts, readSignalIds],
  );
  const unreadCount = storageReady ? unreadIds.length : 0;

  const storeReadIds = (ids: Set<number>) => {
    setReadSignalIds(ids);
    localStorage.setItem(READ_SIGNAL_IDS_KEY, JSON.stringify([...ids]));
  };
  const markRead = (signalId: number) => {
    const next = new Set(readSignalIds);
    next.add(signalId);
    storeReadIds(next);
    setOpen(false);
  };
  const markAllRead = () => {
    const next = new Set(readSignalIds);
    alerts.forEach((alert) => next.add(alert.id));
    storeReadIds(next);
  };

  return (
    <div className="notifications" ref={containerRef}>
      <button
        type="button"
        className="notification-trigger"
        aria-label={unreadCount ? `Notifications: ${unreadCount} unread` : "Notifications: no unread changes"}
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={() => setOpen((value) => !value)}
      >
        {unreadCount ? <BellRing size={20} aria-hidden="true" /> : <Bell size={20} aria-hidden="true" />}
        {unreadCount > 0 && <span className="notification-count" aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {open && (
        <section id="notification-panel" className="notification-panel notification-center" aria-label="Medication change notifications">
          <div className="notification-heading">
            <div><p className="eyebrow">DETECTED CHANGES</p><h2>Notifications</h2></div>
            {unreadCount > 0 && <button type="button" className="mark-read-button" onClick={markAllRead}><CheckCheck size={14} aria-hidden="true" />Mark all read</button>}
          </div>
          <p className="notification-intro">RxSignal surfaces detected changes for medications you monitor.</p>

          {loading ? (
            <p className="notification-state" role="status">Loading detected changes...</p>
          ) : unavailable ? (
            <p className="notification-state error" role="status">The persisted signal feed is temporarily unavailable.</p>
          ) : alerts.length ? (
            <div className="notification-list">
              {alerts.map((alert) => {
                const unread = !readSignalIds.has(alert.id);
                const synthetic = isSyntheticAlert(alert);
                return (
                  <Link
                    key={alert.id}
                    href={`/medication/${alert.id}`}
                    className={`notification-item${unread ? " unread" : ""}`}
                    onClick={() => markRead(alert.id)}
                  >
                    <div className="notification-item-top">
                      <PriorityBadge priority={alert.priority_level} />
                      <time dateTime={alert.detected_at}>{formatDate(alert.detected_at)}</time>
                    </div>
                    {synthetic && <span className="notification-demo"><FlaskConical size={12} aria-hidden="true" />DEMO SCENARIO</span>}
                    <strong>{alert.medication_name}</strong>
                    <p>{alertHeadline(alert)}</p>
                    {synthetic && <small>Synthetic demonstration - not an actual FDA update.</small>}
                    <span className="notification-action">Review change</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="notification-empty">
              <Bell size={22} aria-hidden="true" />
              <strong>No new medication changes.</strong>
              <p>RxSignal is monitoring your medications and will surface detected labeling changes here.</p>
            </div>
          )}

          <p className="notification-safety">Review the updated labeling and supporting evidence to determine whether clinical action is appropriate.</p>
        </section>
      )}
    </div>
  );
}
