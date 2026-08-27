"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import {
  downloadCsv,
  downloadPdf,
  type ExportColumn,
} from "@/features/approvals/lib/download-export";

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
  const [busy, setBusy] = useState<"csv" | "pdf" | null>(null);
  const disabled = rows.length === 0 || busy !== null;

  async function handleCsv() {
    if (rows.length === 0 || busy) {
      return;
    }

    setBusy("csv");

    try {
      downloadCsv(filename, columns, rows);
    } finally {
      setBusy(null);
    }
  }

  async function handlePdf() {
    if (rows.length === 0 || busy) {
      return;
    }

    setBusy("pdf");

    try {
      await downloadPdf(filename, title, columns, rows);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-row gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          void handleCsv();
        }}
        className="flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-blue-600 px-4 py-1 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="size-4" />
        {busy === "csv" ? "Exporting..." : "Export as CSV"}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          void handlePdf();
        }}
        className="flex cursor-pointer flex-row items-center gap-2 rounded-lg bg-green-600 px-4 py-1 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="size-4" />
        {busy === "pdf" ? "Exporting..." : "Export as PDF"}
      </button>
    </div>
  );
}
