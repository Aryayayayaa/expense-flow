"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon, MailIcon, X } from "lucide-react";

import AppToast from "@/components/common/AppToast";
import { emailExportAction } from "@/features/approvals/actions/export-actions";
import {
  buildCsvContent,
  buildPdfBase64,
  downloadCsv,
  downloadPdf,
  utf8ToBase64,
  type ExportColumn,
} from "@/features/approvals/lib/download-export";

type ExportFormat = "csv" | "pdf";
type ExportBusy = "download" | "mail" | null;

type ExportButtonsProps = {
  filename: string;
  title: string;
  columns: ExportColumn[];
  rows: Record<string, string>[];
};

export default function ExportButtons({
  filename,
  title,
  columns,
  rows,
}: ExportButtonsProps) {
  const [format, setFormat] = useState<ExportFormat | null>(null);
  const [busy, setBusy] = useState<ExportBusy>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const disabled = rows.length === 0 || busy !== null;

  useEffect(() => {
    if (!format) {
      return;
    }

    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        setFormat(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [format, busy]);

  function openModal(nextFormat: ExportFormat) {
    if (rows.length === 0 || busy) {
      return;
    }

    setFormat(nextFormat);
  }

  function closeModal() {
    if (busy) {
      return;
    }

    setFormat(null);
  }

  function closeToast() {
    setToast(null);
  }

  async function handleDownload() {
    if (!format || rows.length === 0 || busy) {
      return;
    }

    setBusy("download");

    try {
      if (format === "csv") {
        downloadCsv(filename, columns, rows);
      } else {
        await downloadPdf(filename, title, columns, rows);
      }

      setFormat(null);
    } finally {
      setBusy(null);
    }
  }

  async function handleMail() {
    if (!format || rows.length === 0 || busy) {
      return;
    }

    setBusy("mail");

    try {
      const contentBase64 =
        format === "csv"
          ? utf8ToBase64(buildCsvContent(columns, rows))
          : await buildPdfBase64(title, columns, rows);

      const result = await emailExportAction({
        filename,
        title,
        format,
        contentBase64,
      });

      setToast({
        message: result.message,
        variant: result.success ? "success" : "error",
      });

      if (result.success) {
        setFormat(null);
      }
    } catch {
      setToast({
        message:
          "Unable to email this export. Please try downloading it instead.",
        variant: "error",
      });
    } finally {
      setBusy(null);
    }
  }

  const formatLabel = format === "pdf" ? "PDF" : "CSV";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-row gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => openModal("csv")}
          className="flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DownloadIcon className="size-4" />
          Export as CSV
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => openModal("pdf")}
          className="flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-green-600 px-4 py-1 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DownloadIcon className="size-4" />
          Export as PDF
        </button>
      </div>

      {format && (
        <div
          className="fixed inset-0 z-25 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6">
              <div>
                <h2
                  id="export-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Export as {formatLabel}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Choose whether to download this file or email it to your
                  account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={busy !== null}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 px-6 pb-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  void handleDownload();
                }}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <DownloadIcon className="mt-0.5 size-5 text-blue-600" />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {busy === "download" ? "Downloading..." : "Download"}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Save the {formatLabel} file to this device.
                  </span>
                </span>
              </button>

              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  void handleMail();
                }}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MailIcon className="mt-0.5 size-5 text-green-600" />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    {busy === "mail" ? "Sending email..." : "Email"}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Mail the {formatLabel} file to your account email.
                  </span>
                </span>
              </button>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-6">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={closeModal}
                disabled={busy !== null}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <AppToast
        open={toast !== null}
        message={toast?.message ?? ""}
        variant={toast?.variant}
        onClose={closeToast}
      />
    </div>
  );
}
