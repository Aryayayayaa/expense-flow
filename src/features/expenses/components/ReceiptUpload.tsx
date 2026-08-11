"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import {
  saveBillProofAction,
  replaceBillProofAction,
} from "../actions/expense-actions";

type ReceiptUploadProps = {
  expenseId: number;
  mode?: "upload" | "replace";
  onUploadComplete?: (url: string) => void;
};

export default function ReceiptUpload({
  expenseId,
  mode = "upload",
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

const safePath = `expenses/${expenseId}/receipt-${Date.now()}.${extension}`;

const blob = await upload(safePath, file, {
  access: "private",
  handleUploadUrl: "/api/upload",
  clientPayload: JSON.stringify({
    expenseId,
  }),
});

      console.log("Uploaded:", blob);

      let result;

      if (mode === "replace") {
        result = await replaceBillProofAction(
          expenseId,
          blob.url,
          blob.pathname,
        );
      } else {
        result = await saveBillProofAction(expenseId, blob.url, blob.pathname);
      }

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setMessage("Bill proof uploaded successfully.");

      onUploadComplete?.(blob.url);
    } catch (error) {
      console.error("Upload error:", error);
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
        <p className="font-medium text-gray-800">📁Bill Proof</p>

        <p className="text-sm text-gray-500">
          Upload a receipt or invoice for this expense.
        </p>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={uploading}
        onChange={handleFileChange}
        className="block w-full text-sm bg-gray-300 rounded-full file:text-white file:font-bold file:text-l h-5 justify-center"
      />

      {uploading && (
        <p className="mt-2 text-sm text-blue-600">Uploading bill proof...</p>
      )}

      {message && (
        <p className="mt-2 text-sm text-gray-600 border-gray-600">{message}</p>
      )}
    </div>
  );
}
