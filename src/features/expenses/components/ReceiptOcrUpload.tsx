"use client";

import { useState } from "react";
import type { OcrResult } from "../types/ocr";

type ReceiptOcrUploadProps = {
  onOcrComplete: (result: OcrResult | null, file: File) => void;
};

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

export default function ReceiptOcrUpload({
  onOcrComplete,
}: ReceiptOcrUploadProps) {
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const fileData = await fileToBase64(file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData,
          mimeType: file.type,
        }),
      });

      const result = await response.json();

      /*
       * Always return the selected file to the parent.
       *
       * OCR failure must not prevent the original receipt from being
       * stored as proof.
       */
      if (!response.ok || !result.success) {
        onOcrComplete(null, file);

        setMessage(
          "Unable to extract receipt details. You can enter them manually.",
        );

        return;
      }

      onOcrComplete(result.data, file);

      const extractedFields = [
        result.data?.vendor ? "vendor" : null,
        result.data?.amount !== null && result.data?.amount !== undefined
          ? "amount"
          : null,
        result.data?.expenseDate ? "date/time" : null,
      ].filter(Boolean);

      if (extractedFields.length > 0) {
        setMessage(
          `Receipt details extracted successfully (${extractedFields.join(
            ", ",
          )}). The original receipt will be saved with this expense.`,
        );
      } else {
        setMessage(
          "Receipt uploaded successfully, but no expense details could be extracted. You can enter them manually.",
        );
      }
    } catch (error) {
      //console.error("OCR upload error:", error);

      onOcrComplete(null, file);

      setMessage(
        "Unable to extract receipt details. You can enter them manually.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-4">
      <div className="mb-2">
        <p className="font-medium text-gray-800 dark:text-white">
          📄 Original Receipt
        </p>

        <p className="text-sm text-gray-500">
          Upload the original receipt to automatically extract expense details.
          The receipt will be saved as proof for this expense.
        </p>
      </div>

      <label
        htmlFor="file-upload"
        className="inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Upload File
      </label>

      <input
        id="file-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf,.csv,.doc,.docx"
        disabled={processing}
        onChange={handleFileChange}
        className="hidden"
      />

      {processing && (
        <p className="mt-2 text-sm text-blue-600">Reading receipt...</p>
      )}

      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
