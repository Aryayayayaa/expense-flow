"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";

import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/features/notifications/actions/notification-actions";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

type NotificationBellProps = {
  notifications: NotificationItem[];
  unreadCount: number;
};

function formatNotificationTime(date: Date) {
  const notificationDate = new Date(date);

  return notificationDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell({
  notifications,
  unreadCount,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState(notifications);

  const [count, setCount] = useState(unreadCount);

  async function handleMarkAsRead(notificationId: number) {
    const notification = items.find((item) => item.id === notificationId);

    if (!notification || notification.isRead) {
      return;
    }

    const result = await markNotificationAsReadAction(notificationId);

    if (!result.success) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              isRead: true,
            }
          : item,
      ),
    );

    setCount((current) => Math.max(0, current - 1));
  }

  async function handleMarkAllAsRead() {
    if (count === 0) {
      return;
    }

    const result = await markAllNotificationsAsReadAction();

    if (!result.success) {
      return;
    }

    setItems((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
      })),
    );

    setCount(0);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell size={22} />

        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {count === 0
                  ? "You're all caught up."
                  : `${count} unread notification${count === 1 ? "" : "s"}`}
              </p>
            </div>

            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell size={28} className="mx-auto text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  New activity will appear here.
                </p>
              </div>
            ) : (
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`w-full border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-slate-50 ${
                    notification.isRead ? "bg-white" : "bg-blue-50/50"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 shrink-0">
                      {notification.isRead ? (
                        <Check size={16} className="text-slate-300" />
                      ) : (
                        <span className="block h-2.5 w-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm ${
                            notification.isRead
                              ? "font-medium text-slate-700"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </p>

                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
