export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { extractReceiptData } from "@/features/expenses/lib/ocr";
import type { OcrResult } from "@/features/expenses/types/ocr";

function parseOcrResult(mindeeResult: any): OcrResult {
  const pages = mindeeResult?.result?.pages ?? [];

  const rawText = pages
    .map((page: any) => page?.content ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!rawText) {
    return {
      vendor: null,
      amount: null,
      expenseDate: null,
      rawText: "",
    };
  }

  /*
   * -------------------------------------------------------
   * Extract vendor / title
   * -------------------------------------------------------
   *
   * For the current receipt format, the first meaningful
   * line is used as the vendor/title.
   *
   * Example:
   *
   * Receipt
   * Adress: 1234 Lorem Ipsum, Dolor
   * ...
   *
   * → vendor = "Receipt"
   */

  const lines = rawText
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);

  let vendor: string | null = null;

  if (lines.length > 0) {
    const firstLine = lines[0];

    if (firstLine && !/^receipt$/i.test(firstLine) === false) {
      vendor = firstLine;
    } else {
      vendor = firstLine;
    }
  }

  /*
   * -------------------------------------------------------
   * Extract amount
   * -------------------------------------------------------
   *
   * Prefer the value immediately following "AMOUNT".
   *
   * Example:
   *
   * AMOUNT
   * 84.80
   *
   * → amount = 84.80
   */

  let amount: number | null = null;

  const amountMatch = rawText.match(/AMOUNT\s*\n?\s*(\d+(?:[.,]\d{1,2}))/i);

  if (amountMatch?.[1]) {
    amount = Number(amountMatch[1].replace(",", "."));
  }

  /*
   * -------------------------------------------------------
   * Fallback amount detection
   * -------------------------------------------------------
   *
   * If "AMOUNT" is not present, try common total labels.
   */

  if (amount === null) {
    const totalMatch = rawText.match(
      /(?:TOTAL|GRAND\s+TOTAL|BALANCE)\s*:?\s*\n?\s*(\d+(?:[.,]\d{1,2}))/i,
    );

    if (totalMatch?.[1]) {
      amount = Number(totalMatch[1].replace(",", "."));
    }
  }

  /*
   * -------------------------------------------------------
   * Extract date and time
   * -------------------------------------------------------
   *
   * Supports:
   *
   * 01-01-2018 10:35
   * 01/01/2018 10:35
   * 01-01-2018
   * 01/01/2018
   */

  let expenseDate: string | null = null;

  const dateMatch = rawText.match(
    /(?:Date\s*:?\s*)?(\d{2})[-/](\d{2})[-/](\d{4})(?:\s+(\d{2}):(\d{2}))?/i,
  );

  if (dateMatch) {
    const [, day, month, year, hour = "00", minute = "00"] = dateMatch;

    expenseDate = `${year}-${month}-${day}T${hour}:${minute}`;
  }

  return {
    vendor,
    amount,
    expenseDate,
    rawText,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { fileName, fileData, mimeType } = body;

    if (!fileName || !fileData) {
      return NextResponse.json(
        {
          success: false,
          message: "File name and file data are required.",
        },
        { status: 400 },
      );
    }

    const result = await extractReceiptData(fileData, fileName, mimeType);

    const ocrResult = parseOcrResult(result);

    return NextResponse.json({
      success: true,
      data: ocrResult,
    });
  } catch (error) {
    console.error("OCR Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process receipt.",
      },
      { status: 500 },
    );
  }
}
