export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { extractReceiptData } from "@/features/expenses/lib/ocr";

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

    const ocrResult = await extractReceiptData(fileData, fileName, mimeType);

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
