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

async function prepareFileForOcr(file: File): Promise<{
  fileData: string;
  fileName: string;
}> {
  if (file.type === "application/pdf") {
    return {
      fileData: await fileToBase64(file),
      fileName: file.name,
    };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();

    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to decode image."));
    });

    const canvas = document.createElement("canvas");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create image canvas.");
    }

    context.drawImage(image, 0, 0);

    const jpegData = canvas.toDataURL("image/jpeg", 0.9);

    return {
      fileData: jpegData,
      fileName: `${file.name.replace(/\.[^/.]+$/, "")}.jpg`,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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
      const { fileData, fileName } = await prepareFileForOcr(file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        onOcrComplete(null, file);
        setMessage(
          "Unable to extract receipt details. You can enter them manually.",
        );
        return;
      }

      onOcrComplete(result.data, file);

      setMessage("Receipt details extracted successfully.");
    } catch (error) {
      onOcrComplete(null, file);
      console.error("OCR upload error:", error);
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
        <p className="font-medium text-gray-800">📄 Receipt / Bill</p>

        <p className="text-sm text-gray-500">
          Upload a receipt to automatically extract expense details.
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
