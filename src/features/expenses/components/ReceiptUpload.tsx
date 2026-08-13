"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import { saveBillProofAction } from "../actions/expense-actions";

type ReceiptUploadProps = {
  expenseId: number;
  onUploadComplete?: (url: string) => void;
};

export default function ReceiptUpload({
  expenseId,
  onUploadComplete,
}: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage("");

    try {
      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
      };

      const extension = extensionMap[file.type] ?? "bin";

      const safePath = `expenses/${expenseId}/bill-proof-${Date.now()}.${extension}`;

      const blob = await upload(safePath, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({
          expenseId,
        }),
      });

      console.log("Bill proof uploaded:", blob);

      const result = await saveBillProofAction(
        expenseId,
        blob.url,
        blob.pathname,
      );

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setMessage("Bill proof uploaded successfully.");

      onUploadComplete?.(blob.url);
    } catch (error) {
      console.error("Bill proof upload error:", error);

      setMessage("Unable to upload bill proof.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    handleUpload(file);
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-4">
      <div className="mb-2">
        <p className="font-medium text-gray-800">📁 Bill Proof</p>

        <p className="text-sm text-gray-500">
          Upload an invoice, receipt, or other proof for this expense.
        </p>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={uploading}
        onChange={handleFileChange}
        className="block h-5 w-full rounded-full bg-gray-300 text-sm file:font-bold file:text-white"
      />

      {uploading && (
        <p className="mt-2 text-sm text-blue-600">Uploading bill proof...</p>
      )}

      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
