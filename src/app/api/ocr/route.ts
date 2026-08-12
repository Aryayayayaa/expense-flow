import { NextResponse } from "next/server";
import { extractReceiptData } from "@/features/expenses/lib/ocr";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { fileName, fileData } = body;

    if (!fileName || !fileData) {
      return NextResponse.json(
        {
          success: false,
          message: "File name and file data are required.",
        },
        { status: 400 },
      );
    }

    const result = await extractReceiptData(fileData, fileName);

    return NextResponse.json({
      success: true,
      data: result,
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
