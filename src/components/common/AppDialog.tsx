"use client";

import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

export type AppDialogVariant =
  | "default"
  | "warning"
  | "danger"
  | "success"
  | "error";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  variant?: AppDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  showCancel?: boolean;
  requiresReason?: boolean;
  reason?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onReasonChange?: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantConfig: Record<
  AppDialogVariant,
  {
    icon: typeof Info;
    iconClass: string;
    confirmClass: string;
  }
> = {
  default: {
    icon: Info,
    iconClass: "bg-blue-100 text-blue-600",
    confirmClass: "bg-blue-600 hover:bg-blue-700",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-yellow-100 text-yellow-600",
    confirmClass: "bg-yellow-600 hover:bg-yellow-700",
  },
  danger: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-600",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-600",
    confirmClass: "bg-green-600 hover:bg-green-700",
  },
  error: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-600",
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
};

export default function AppDialog({
  open,
  title,
  description,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  loadingLabel = "Processing...",
  showCancel = true,
  requiresReason = false,
  reason = "",
  reasonLabel = "Reason",
  reasonPlaceholder = "Enter a reason...",
  onReasonChange,
  onConfirm,
  onCancel,
}: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const config = variantConfig[variant];
  const Icon = config.icon;

  const confirmDisabled = loading || (requiresReason && !reason.trim());

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!loading) {
      cancelButtonRef.current?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
        aria-describedby={description ? "app-dialog-description" : undefined}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:text-white"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4 p-6">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}
          >
            {loading ? (
              <Loader2 size={22} className="animate-spin" aria-hidden="true" />
            ) : (
              <Icon size={22} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="app-dialog-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {loading ? loadingLabel : title}
            </h2>

            {loading ? (
              <div
                className="mt-2 flex items-center gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
                role="status"
                aria-live="polite"
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                  aria-hidden="true"
                />
                <span>Action is in progress. Please wait...</span>
              </div>
            ) : (
              description && (
                <p
                  id="app-dialog-description"
                  className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
                >
                  {description}
                </p>
              )
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {requiresReason && !loading && (
          <div className="px-6 pb-2">
            <label
              htmlFor="app-dialog-reason"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {reasonLabel}
            </label>

            <textarea
              id="app-dialog-reason"
              value={reason}
              onChange={(event) => onReasonChange?.(event.target.value)}
              placeholder={reasonPlaceholder}
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-slate-300 bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed isabled:bg-slate-50 dark:disabled:bg-slate-700"
            />

            {!reason.trim() && (
              <p className="mt-1 text-xs text-red-600">A reason is required.</p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 dark:border-slate-700 p-6 sm:flex-row sm:justify-end">
          {showCancel && (
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${config.confirmClass}`}
          >
            {loading && (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            )}

            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
