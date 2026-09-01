import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

import { createNotification } from "@/features/notifications/lib/notifications";

const allowedStatuses = [
  "NEW",
  "IN_PROGRESS",
  "AWAITING_INFO",
  "RESOLVED",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    /*
     * Only Admin and HR can change support-request status.
     */
    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json(
        { message: "You are not authorized to update support requests." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const requestId = Number(id);

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        { message: "Invalid support request ID." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const status = body.status as string;

    const actionTaken =
      typeof body.actionTaken === "string" ? body.actionTaken.trim() : "";

    if (!allowedStatuses.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { message: "Invalid support request status." },
        { status: 400 },
      );
    }

    if (status === "RESOLVED" && !actionTaken) {
      return NextResponse.json(
        {
          message:
            "Please describe the action taken before resolving this request.",
        },
        { status: 400 },
      );
    }

    const existingRequest = await prisma.contactRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Support request not found." },
        { status: 404 },
      );
    }

    if (existingRequest.status === "RESOLVED") {
      return NextResponse.json(
        {
          message:
            "This support request has already been resolved and cannot be changed.",
        },
        { status: 400 },
      );
    }

    const updatedRequest = await prisma.contactRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: status as AllowedStatus,

        ...(status === "RESOLVED"
          ? {
              resolvedAt: new Date(),
              resolvedById: Number(session.user.id),
              actionTaken,
            }
          : {}),
      },
    });

    await createNotification({
      userId: existingRequest.userId,
      type: "CONTACT_REQUEST_UPDATED",
      title: "Support Request Updated",
      message:
        status === "RESOLVED"
          ? `Your support request "${existingRequest.subject}" has been resolved. Action taken: ${actionTaken}`
          : `Your support request "${existingRequest.subject}" is now ${status.replaceAll("_", " ")}.`,
      metadata: {
        contactRequestId: existingRequest.id,
        status,
      },
    });

    if (status === "RESOLVED") {
      const employee = await prisma.user.findUnique({
        where: {
          id: existingRequest.userId,
        },
        select: {
          name: true,
          email: true,
        },
      });

      if (employee?.email) {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL;

          await sendBrevoEmail({
            to: {
              email: employee.email,
              name: employee.name,
            },
            subject: `Your ExpenseFlow support request has been resolved`,
            htmlContent: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              color: #1e293b;
            "
          >
            <h2>
              Expense<span style="color: #4f46e5;">Flow</span>
            </h2>

            <h3>Support Request Resolved</h3>

            <p>
              Your support request
              <strong>"${existingRequest.subject}"</strong>
              has been resolved.
            </p>

            <p>
              <strong>Category:</strong>
              ${existingRequest.category}
            </p>

            <p>
              <strong>Your Message:</strong>
            </p>

            <div
              style="
                padding: 16px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                white-space: pre-wrap;
              "
            >
              ${existingRequest.message}
            </div>

            <p style="margin-top: 20px;">
              <strong>Action Taken:</strong>
            </p>

            <div
              style="
                padding: 16px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 6px;
                white-space: pre-wrap;
              "
            >
              ${actionTaken}
            </div>

            <p style="margin-top: 20px;">
              Request ID: #${existingRequest.id}
            </p>

            <p style="margin-top: 24px;">
              <a
                href="${appUrl}/contact"
                style="
                  display: inline-block;
                  padding: 10px 16px;
                  background: #4f46e5;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                "
              >
                View Support Tickets
              </a>
            </p>
          </div>
        `,
          });
        } catch (emailError) {
          console.error(
            `Failed to email employee ${employee.email}:`,
            emailError,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update Contact Request Status Error:", error);

    return NextResponse.json(
      { message: "Unable to update support request status." },
      { status: 500 },
    );
  }
}
