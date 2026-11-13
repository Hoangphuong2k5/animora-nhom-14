"use client";

import React, { useMemo } from "react";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import { ExpertNotification, ExpertNotificationType } from "@/types/expert.type";
import {
  PortalNotificationItem,
  PortalNotificationPopover,
} from "@/components/shared/portal";

interface HeaderNotificationDropdownProps {
  notifications: ExpertNotification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (id: string, href?: string) => void;
  title: string;
  markAllReadLabel: string;
  noNotificationsLabel: string;
  lang: "vi" | "en";
}

function getNotifIcon(type: ExpertNotificationType) {
  switch (type) {
    case "new_booking":
      return <Calendar className="size-4 text-emerald-500" />;
    case "booking_changed":
    case "booking_cancelled":
      return <Clock className="size-4 text-amber-500" />;
    case "new_review":
      return <Star className="size-4 text-yellow-500 fill-yellow-500" />;
    case "shift_result":
      return <CheckCircle2 className="size-4 text-blue-500" />;
    case "salary_paid":
      return <DollarSign className="size-4 text-(--coral)" />;
    default:
      return <Bell className="size-4 text-muted-foreground" />;
  }
}

export function HeaderNotificationDropdown({
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  onMarkAllRead,
  onSelectNotification,
  title,
  markAllReadLabel,
  noNotificationsLabel,
  lang,
}: HeaderNotificationDropdownProps) {
  const items: PortalNotificationItem[] = useMemo(
    () =>
      notifications.map((n) => ({
        id: n.id,
        title: n.title[lang],
        description: n.body[lang],
        time: n.at,
        unread: n.unread,
        icon: getNotifIcon(n.type),
        href: n.href,
      })),
    [notifications, lang]
  );

  return (
    <PortalNotificationPopover
      items={items}
      unreadCount={unreadCount}
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          if (!isOpen) onToggle();
        } else {
          onClose();
        }
      }}
      title={title}
      unreadBadgeText={lang === "vi" ? `${unreadCount} mới` : `${unreadCount} new`}
      markAllReadLabel={markAllReadLabel}
      emptyLabel={noNotificationsLabel}
      tooltipLabel={title}
      onMarkAllRead={onMarkAllRead}
      onSelectItem={(item) => onSelectNotification(item.id, item.href)}
    />
  );
}
