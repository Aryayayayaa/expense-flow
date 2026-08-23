import { NextResponse } from "next/server";

import { processRequestDeadlines } from "@/features/auth/lib/process-request-deadlines";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not configured.");

    return NextResponse.json(
      {
        success: false,
        message: "Cron secret is not configured.",
      },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  try {
    console.log("[CRON] Request deadline processing started.");

    const result = await processRequestDeadlines();

    console.log("[CRON] Request deadline processing completed.", result);

    return NextResponse.json({
      success: true,
      message: "Request deadline processing completed.",
      result,
    });
  } catch (error) {
    console.error("[CRON] Request deadline processing failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Request deadline processing failed.",
      },
      { status: 500 },
    );
  }
}
