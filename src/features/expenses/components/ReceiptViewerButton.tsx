"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

type ReceiptViewerButtonProps = {
  expenseId: number;
};

export default function ReceiptViewerButton({
  expenseId,
}: ReceiptViewerButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleViewReceipt() {
    setLoading(true);

    try {
      const response = await fetch(`/api/expenses/${expenseId}/ocr-receipt`);

      const data = await response.json();

      if (!response.ok) {
        alert(data.error ?? "Unable to open receipt.");
        return;
      }

      if (!data.url) {
        alert("Receipt URL was not returned.");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Receipt view error:", error);
      alert("Unable to open receipt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleViewReceipt}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Eye size={17} />

      {loading ? "Opening..." : "View Receipt"}
    </button>
  );
}
