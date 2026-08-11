"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { Eye, Upload } from "lucide-react";

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
      const blob = await upload(`expenses/${expenseId}/${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({
          expenseId,
        }),
      });

      console.log("Uploaded:", blob);

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
      console.error("Upload error:", error);
      setMessage("Unable to upload bill proof.");
    } finally {
      setUploading(false);
    }
  }

  async function handleView() {
    try {
      setMessage("");

      const response = await fetch(`/api/expenses/${expenseId}/bill-proof`);

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Unable to open bill proof.");
        return;
      }

      window.open(data.url, "_blank");
    } catch (error) {
      console.error("View bill proof error:", error);

      setMessage("Unable to open bill proof.");
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
