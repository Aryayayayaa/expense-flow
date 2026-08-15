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
       * Always give the selected file back to the parent.
       *
       * Even if OCR fails, the original receipt can still be
       * uploaded and stored as proof for the expense.
       */
      if (!response.ok || !result.success) {
        onOcrComplete(null, file);

        setMessage(
          "Unable to extract receipt details. You can enter them manually.",
        );

        return;
      }

      onOcrComplete(result.data, file);

      setMessage(
        "Receipt details extracted successfully. The original receipt will be saved with this expense.",
      );
    } catch (error) {
      console.error("OCR upload error:", error);

      /*
       * OCR may fail, but the original receipt should still
       * be available to AddExpenseForm for storage.
       */
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
        <p className="font-medium text-gray-800">📄 Original Receipt</p>

        <p className="text-sm text-gray-500">
          Upload the original receipt to automatically extract expense details.
          The receipt will be saved as proof for this expense.
        </p>
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={processing}
        onChange={handleFileChange}
        className="block w-full text-sm"
      />

      {processing && (
        <p className="mt-2 text-sm text-blue-600">Reading receipt...</p>
      )}

      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
