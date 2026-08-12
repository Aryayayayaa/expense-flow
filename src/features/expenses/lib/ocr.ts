import type { OcrResult } from "../types/ocr";
import { parseReceiptText } from "./parseReceiptText";

const apiKey = process.env.MINDEE_API_KEY;
const modelId = process.env.MINDEE_OCR_MODEL_ID ?? "";

if (!apiKey) {
  throw new Error("MINDEE_API_KEY is not configured.");
}

if (!modelId) {
  throw new Error("MINDEE_OCR_MODEL_ID is not configured.");
}

export async function extractReceiptData(
  fileData: string,
  fileName: string,
): Promise<OcrResult> {
  // Load Mindee only when OCR is actually requested.
  const { BufferInput, Client, product } = await import("mindee");

  const mindeeClient = new Client({
    apiKey,
  });

  const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;

  const buffer = Buffer.from(base64Data, "base64");

  const inputSource = new BufferInput({
    buffer,
    filename: fileName,
  });

  const params = {
    modelId,
  };

  const response = await mindeeClient.enqueueAndGetResult(
    product.Ocr,
    inputSource,
    params,
  );

  const rawText = response.inference.result.pages
    .map((page) => page.toString())
    .join("\n");

  return parseReceiptText(rawText);
}
