"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import AppDialog from "@/components/common/AppDialog";

type ReceiptViewerButtonProps = {
  expenseId: number;
};

export default function ReceiptViewerButton({
  expenseId,
}: ReceiptViewerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  async function handleViewReceipt() {
    setLoading(true);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/ocr-receipt`);

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage(data.error ?? "Unable to open receipt.");
        setDialogOpen(true);
        return;
      }

      if (!data.url) {
        setDialogMessage("Receipt URL was not returned.");
        setDialogOpen(true);
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Receipt view error:", error);

      setDialogMessage("Unable to open receipt.");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleViewReceipt}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eye size={17} />

        {loading ? "Opening..." : "View Receipt"}
      </button>

      <AppDialog
        open={dialogOpen}
        title="Unable to Open Receipt"
        description={dialogMessage}
        variant="danger"
        confirmLabel="OK"
        cancelLabel={undefined}
        onConfirm={() => {
          setDialogOpen(false);
          setDialogMessage("");
        }}
        onCancel={() => {
          setDialogOpen(false);
          setDialogMessage("");
        }}
      />
    </>
  );
}
