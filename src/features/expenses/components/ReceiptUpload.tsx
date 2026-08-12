"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

import {
  saveBillProofAction,
  replaceBillProofAction,
} from "../actions/expense-actions";

type OcrResult = {
  vendor: string | null;
  amount: number | null;
  rawText: string;
};

type ReceiptUploadProps = {
  expenseId: number;
  mode?: "upload" | "replace";
  onUploadComplete?: (url: string) => void;
  onOcrComplete?: (result: OcrResult) => void;
};

export default function ReceiptUpload({
  expenseId,
  mode = "upload",
  onUploadComplete,
  onOcrComplete,
}: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Unable to read file."));
          return;
        }

        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error("Unable to read file."));
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage("");

    try {
      let ocrMessage = "";

      try {
        const fileData = await fileToBase64(file);

        const ocrResponse = await fetch("/api/ocr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData,
          }),
        });

        const ocrResult = await ocrResponse.json();

        if (ocrResponse.ok && ocrResult.success) {
          onOcrComplete?.(ocrResult.data);
        } else {
          ocrMessage =
            "Receipt uploaded, but its details could not be extracted.";
        }
      } catch (error) {
        console.error("OCR error:", error);
        ocrMessage =
          "Receipt uploaded, but its details could not be extracted.";
      }

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

      setMessage(ocrMessage || "Bill proof uploaded successfully.");

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
