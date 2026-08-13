import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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
        // The RoleVerificationRequest database record
        // is created separately by the server action.
      },
    });

    return NextResponse.json(token);
  } catch (error) {
    console.error("Role proof upload error:", error);

    return NextResponse.json(
      { error: "Unable to prepare role proof upload." },
      { status: 500 },
    );
  }
}
