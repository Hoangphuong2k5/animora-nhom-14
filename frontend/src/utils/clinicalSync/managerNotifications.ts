import { createSyncEntityId } from "./expertStorage";

export const MANAGER_NOTIF_STORAGE_KEY = "animora_manager_notifications_v1";
export const MANAGER_NOTIF_SYNC_EVENT = "animora_manager_notif_sync";

export type ManagerNotificationType =
  | "booking"
  | "staff"
  | "certificate"
  | "stock";

export interface ManagerNotificationRecord {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: ManagerNotificationType;
  href?: string;
}

const DEFAULT_MANAGER_NOTIFICATIONS: ManagerNotificationRecord[] = [
  {
    id: "m-notif-1",
    title: "Đơn xin nghỉ phép cần duyệt",
    desc: "BS. Lê Huy Hoàng nộp đơn xin nghỉ ngày 15-11-2026.",
    time: "5 phút trước",
    unread: true,
    type: "staff",
    href: "/manager/staff?tab=requests",
  },
  {
    id: "m-notif-2",
    title: "Lịch hẹn dịch vụ mới",
    desc: "Khách Nguyễn Văn An vừa đặt Spa Combo 5 bước lúc 14:00.",
    time: "20 phút trước",
    unread: true,
    type: "booking",
    href: "/manager/bookings",
  },
  {
    id: "m-notif-3",
    title: "Cảnh báo tồn kho dưới ngưỡng",
    desc: "Hạt Royal Canin mini adult chỉ còn 2 gói trong kho.",
    time: "1 giờ trước",
    unread: true,
    type: "stock",
    href: "/manager/shop",
  },
];

export function readManagerNotifications(): ManagerNotificationRecord[] {
  if (typeof window === "undefined") {
    return DEFAULT_MANAGER_NOTIFICATIONS;
  }
  try {
    const raw = window.localStorage.getItem(MANAGER_NOTIF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ManagerNotificationRecord[];
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_MANAGER_NOTIFICATIONS;
}

function writeManagerNotifications(items: ManagerNotificationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      MANAGER_NOTIF_STORAGE_KEY,
      JSON.stringify(items.slice(0, 50))
    );
    window.dispatchEvent(new Event(MANAGER_NOTIF_SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function pushManagerNotification(
  input: Omit<ManagerNotificationRecord, "id" | "time" | "unread"> & {
    time?: string;
  }
): ManagerNotificationRecord {
  const current = readManagerNotifications();
  const nextItem: ManagerNotificationRecord = {
    id: createSyncEntityId("m-notif"),
    title: input.title,
    desc: input.desc,
    time: input.time || "Vừa xong",
    unread: true,
    type: input.type,
    href: input.href,
  };
  writeManagerNotifications([nextItem, ...current]);
  return nextItem;
}

export function markManagerNotificationRead(id: string): ManagerNotificationRecord[] {
  const next = readManagerNotifications().map((n) =>
    n.id === id ? { ...n, unread: false } : n
  );
  writeManagerNotifications(next);
  return next;
}

export function markAllManagerNotificationsRead(): ManagerNotificationRecord[] {
  const next = readManagerNotifications().map((n) => ({ ...n, unread: false }));
  writeManagerNotifications(next);
  return next;
}

