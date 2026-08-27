"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export type AppToastVariant = "success" | "error";

type Props = {
  open: boolean;
  message: string;
  variant?: AppToastVariant;
  durationMs?: number;
  onClose: () => void;
};

const variantConfig: Record<
  AppToastVariant,
  {
    icon: typeof CheckCircle2;
    iconClass: string;
    panelClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-600",
    panelClass: "border-green-200",
  },
  error: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-600",
    panelClass: "border-red-200",
  },
};

export default function AppToast({
  open,
  message,
  variant = "success",
  durationMs = 4000,
  onClose,
}: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onCloseRef.current();
    }, durationMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, message, durationMs]);

  if (!open) {
    return null;
  }

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 bottom-4 z-[110] flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${config.panelClass}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}
      >
        <Icon size={18} />
      </div>

      <p className="min-w-0 flex-1 pt-1 text-sm leading-5 text-slate-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}
