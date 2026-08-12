import type { OcrResult } from "../types/ocr";

function parseAmount(text: string): number | null {
  const amountPatterns = [
    /(?:total|grand total|amount due|net total|balance due)\s*[:\-]?\s*(?:₹|rs\.?|inr|\$|€|£)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:₹|rs\.?|inr|\$|€|£)\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const amount = Number(match[1].replace(/,/g, ""));

      if (!Number.isNaN(amount)) {
        return amount;
      }
    }
  }

  return null;
}

function parseVendor(text: string): string | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const vendorLine = lines.find((line) =>
    /(?:store|shop|restaurant|mart|market|limited|ltd|pvt|private|inc|corp)/i.test(
      line,
    ),
  );

  if (vendorLine) {
    return vendorLine;
  }

  return lines[0];
}

export function parseReceiptText(text: string): OcrResult {
  return {
    vendor: parseVendor(text),
    amount: parseAmount(text),
    rawText: text,
  };
}
