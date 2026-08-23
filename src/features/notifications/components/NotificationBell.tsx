"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";

import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/features/notifications/actions/notification-actions";

import type { Prisma, Role } from "@prisma/client";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  expenseId: number | null;
  metadata: Prisma.JsonValue;
};

type NotificationBellProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  userRole: Role;
};

type RequestType =
  | "name-change"
  | "role-verification"
  | "identity-verification";

function formatNotificationTime(date: Date) {
  const notificationDate = new Date(date);

  return notificationDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * --------------------------------------------------------------------------
 * Expense notification navigation
 * --------------------------------------------------------------------------
 */

const EXPENSE_NAVIGATION_TYPES = new Set([
  "EXPENSE_SUBMITTED",
  "EXPENSE_APPROVED",
  "EXPENSE_REJECTED",
  "EXPENSE_MODIFIED",
  "REIMBURSEMENT_PENDING",
  "EXPENSE_REIMBURSED",
  "REIMBURSEMENT_REJECTED",
]);

function getExpenseId(notification: NotificationItem) {
  /*
   * Prefer the direct relational expenseId.
   *
   * This is safer than trying to extract an ID from arbitrary
   * notification metadata.
   */
  if (
    typeof notification.expenseId === "number" &&
    Number.isInteger(notification.expenseId) &&
    notification.expenseId > 0
  ) {
    return notification.expenseId;
  }

  return null;
}

function canNavigateToExpense(notification: NotificationItem) {
  if (!EXPENSE_NAVIGATION_TYPES.has(notification.type)) {
    return false;
  }

  return getExpenseId(notification) !== null;
}

/*
 * --------------------------------------------------------------------------
 * Request notification navigation
 * --------------------------------------------------------------------------
 */

const REQUEST_ACTION_TO_TYPE: Record<string, RequestType> = {
  /*
   * Name change
   */
  NAME_CHANGE_REQUESTED: "name-change",
  NAME_CHANGE_APPROVED: "name-change",
  NAME_CHANGE_REJECTED: "name-change",
  NAME_CHANGE_REMINDER: "name-change",
  NAME_CHANGE_AUTO_REJECTED: "name-change",

  /*
   * Role verification
   */
  ROLE_VERIFICATION_PENDING: "role-verification",
  ROLE_VERIFICATION_APPROVED: "role-verification",
  ROLE_VERIFICATION_REJECTED: "role-verification",
  ROLE_VERIFICATION_REMINDER: "role-verification",
  ROLE_VERIFICATION_AUTO_REJECTED: "role-verification",

  /*
   * Identity verification
   */
  IDENTITY_VERIFICATION_PENDING: "identity-verification",
  IDENTITY_VERIFICATION_APPROVED: "identity-verification",
  IDENTITY_VERIFICATION_REJECTED: "identity-verification",
  IDENTITY_VERIFICATION_REMINDER: "identity-verification",
  IDENTITY_VERIFICATION_AUTO_REJECTED: "identity-verification",
};

function getNotificationMetadata(
  notification: NotificationItem,
): Record<string, Prisma.JsonValue> | null {
  if (
    typeof notification.metadata !== "object" ||
    notification.metadata === null ||
    Array.isArray(notification.metadata)
  ) {
    return null;
  }

  return notification.metadata as Record<string, Prisma.JsonValue>;
}

function getRequestTypeFromNotification(
  notification: NotificationItem,
): RequestType | null {
  const metadata = getNotificationMetadata(notification);

  /*
   * Request notifications created by the request workflows
   * contain an explicit action in metadata.
   */
  const action = metadata?.action;

  if (typeof action === "string") {
    const requestType = REQUEST_ACTION_TO_TYPE[action];

    if (requestType) {
      return requestType;
    }
  }

  /*
   * Fallback for notifications whose type itself identifies
   * the request workflow.
   */
  if (
    notification.type === "ROLE_VERIFICATION_PENDING" ||
    notification.type === "ROLE_VERIFICATION_APPROVED" ||
    notification.type === "ROLE_VERIFICATION_REJECTED"
  ) {
    return "role-verification";
  }

  if (
    notification.type === "EMPLOYEE_VERIFICATION_PENDING" ||
    notification.type === "EMPLOYEE_VERIFICATION_APPROVED" ||
    notification.type === "EMPLOYEE_VERIFICATION_REJECTED"
  ) {
    return "identity-verification";
  }

  /*
   * Name-change notifications currently use
   * EMPLOYEE_ACCOUNT_UPDATED, so metadata.action is the
   * reliable identifier for those notifications.
   */
  return null;
}

function getNotificationDestination(
  notification: NotificationItem,
  userRole: Role,
) {
  /*
   * ------------------------------------------------------------------------
   * Name Change
   * ------------------------------------------------------------------------
   */

  if (
    notification.type === "EMPLOYEE_ACCOUNT_UPDATED" &&
    notification.metadata &&
    typeof notification.metadata === "object" &&
    !Array.isArray(notification.metadata)
  ) {
    const metadata = notification.metadata as Record<string, unknown>;

    if (
      metadata.action === "NAME_CHANGE_REQUESTED" ||
      metadata.action === "NAME_CHANGE_APPROVED" ||
      metadata.action === "NAME_CHANGE_REJECTED" ||
      metadata.action === "NAME_CHANGE_AUTO_REJECTED"
    ) {
      if (userRole === "HR") {
        return "/hr?section=name-change";
      }

      if (userRole === "ADMIN") {
        return "/admin?view=name-change";
      }

      if (userRole === "EMPLOYEE") {
        return "/requests?type=name-change";
      }
    }
  }

  /*
   * ------------------------------------------------------------------------
   * Employee / Identity Verification
   * ------------------------------------------------------------------------
   */

  if (notification.type === "EMPLOYEE_VERIFICATION_PENDING") {
    if (userRole === "HR") {
      return "/hr?section=verification";
    }

    if (userRole === "ADMIN") {
      return "/admin?view=employee-verification";
    }
  }

  if (
    notification.type === "EMPLOYEE_VERIFICATION_APPROVED" ||
    notification.type === "EMPLOYEE_VERIFICATION_REJECTED"
  ) {
    if (userRole === "EMPLOYEE") {
      return "/requests?type=identity-verification";
    }
  }

  /*
   * ------------------------------------------------------------------------
   * Role Verification
   * ------------------------------------------------------------------------
   */

  if (
    notification.type === "ROLE_VERIFICATION_PENDING" ||
    notification.type === "ROLE_VERIFICATION_APPROVED" ||
    notification.type === "ROLE_VERIFICATION_REJECTED"
  ) {
    if (userRole === "EMPLOYEE") {
      return "/requests?type=role-verification";
    }

    if (userRole === "HR") {
      return "/hr?section=role-verification";
    }

    if (userRole === "ADMIN") {
      return "/admin?view=role-verification";
    }
  }

  /*
   * ------------------------------------------------------------------------
   * Existing expense navigation
   * ------------------------------------------------------------------------
   */

  if (notification.type === "EXPENSE_DELETED") {
    return "/approvals";
  }

  if (canNavigateToExpense(notification)) {
    const expenseId = getExpenseId(notification);

    if (expenseId !== null) {
      return `/expenses/${expenseId}`;
    }
  }

  return null;
}

function getNavigationLabel(notification: NotificationItem) {
  if (notification.type === "EXPENSE_DELETED") {
    return "View deleted expense history";
  }

  if (canNavigateToExpense(notification)) {
    return "View expense";
  }

  const requestType = getRequestTypeFromNotification(notification);

  if (requestType === "name-change") {
    return "View name change request";
  }

  if (requestType === "role-verification") {
    return "View role verification";
  }

  if (requestType === "identity-verification") {
    return "View identity verification";
  }

  return null;
}

export default function NotificationBell({
  notifications,
  unreadCount,
  userRole,
}: NotificationBellProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [items, setItems] = useState(notifications);

  const [count, setCount] = useState(unreadCount);

  /*
   * ------------------------------------------------------------------------
   * Mark one notification as read
   * ------------------------------------------------------------------------
   *
   * This function only handles the read state.
   * Navigation is handled separately by handleNotificationClick().
   */
  async function handleMarkAsRead(notificationId: number) {
    const notification = items.find((item) => item.id === notificationId);

    if (!notification) {
      return false;
    }

    /*
     * Already-read notifications do not need another
     * database operation.
     */
    if (notification.isRead) {
      return true;
    }

    const result = await markNotificationAsReadAction(notificationId);

    if (!result.success) {
      return false;
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

    return true;
  }

  /*
   * ------------------------------------------------------------------------
   * Mark all notifications as read
   * ------------------------------------------------------------------------
   */
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

  /*
   * ------------------------------------------------------------------------
   * Notification click
   * ------------------------------------------------------------------------
   */
  async function handleNotificationClick(notification: NotificationItem) {
    /*
     * Always mark the clicked notification as read first.
     */
    const markedAsRead = await handleMarkAsRead(notification.id);

    /*
     * Do not navigate if marking the notification as read failed.
     */
    if (!markedAsRead) {
      return;
    }

    const destination = getNotificationDestination(notification, userRole);

    /*
     * No destination means this is an informational notification.
     *
     * This safely handles:
     * - missing expenseId
     * - invalid expenseId
     * - notification types without navigation
     * - unrelated system notifications
     */
    if (!destination) {
      return;
    }

    /*
     * Close the notification dropdown before navigation.
     */
    setOpen(false);

    router.push(destination);
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
              items.map((notification) => {
                const destination = getNotificationDestination(
                  notification,
                  userRole,
                );

                const navigationLabel = getNavigationLabel(notification);

                const navigable = destination !== null;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
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

                        {navigable && navigationLabel && (
                          <p className="mt-2 text-[11px] font-medium text-blue-600">
                            {navigationLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
