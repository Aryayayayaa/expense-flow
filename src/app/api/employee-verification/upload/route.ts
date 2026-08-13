import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYEE") {
      return NextResponse.json(
        {
          error: "Only employees can upload identity proof.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as HandleUploadBody;

    const token = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },

      onUploadCompleted: async () => {
        // Database record is created by the server action
        // after the client upload succeeds.
      },
    });

    return NextResponse.json(token);
  } catch (error) {
    console.error("Employee verification upload error:", error);

    return NextResponse.json(
      {
        error: "Unable to prepare identity proof upload.",
      },
      { status: 500 },
    );
  }
}
