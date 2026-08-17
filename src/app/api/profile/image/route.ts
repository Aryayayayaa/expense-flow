import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { issueSignedToken, presignUrl } from "@vercel/blob";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
      select: {
        image: true,
      },
    });

    if (!user?.image) {
      return NextResponse.json(
        { error: "No profile image found." },
        { status: 404 },
      );
    }

    const pathname = new URL(user.image).pathname.slice(1);

    const signedToken = await issueSignedToken({
      pathname,
      operations: ["get"],
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      pathname,
      operation: "get",
      access: "private",
      validUntil: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json({
      url: presignedUrl,
    });
  } catch (error) {
    console.error("Profile image retrieval error:", error);

    return NextResponse.json(
      { error: "Unable to retrieve profile image." },
      { status: 500 },
    );
  }
}

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
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },

      onUploadCompleted: async () => {
        // The user image is saved separately by the server action.
      },
    });

    return NextResponse.json(token);
  } catch (error) {
    console.error("Profile image upload error:", error);

    return NextResponse.json(
      { error: "Unable to prepare profile image upload." },
      { status: 500 },
    );
  }
}
