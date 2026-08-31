"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

import { createNotification } from "@/features/notifications/lib/notifications";

import { contactRequestSchema } from "../schemas/contact-schema";

export type ContactRequestActionState = {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
};

export async function createContactRequestAction(
  prevState: ContactRequestActionState,
  formData: FormData,
): Promise<ContactRequestActionState> {
  try {
    /*
     * ------------------------------------------------------------------------
     * Authentication
     * ------------------------------------------------------------------------
     *
     * The employee's identity is taken from the authenticated session.
     * We do NOT accept name, email, or userId from the form.
     */
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "Please login to contact support.",
        errors: {},
      };
    }

    const userId = Number(session.user.id);

    /*
     * ------------------------------------------------------------------------
     * Authorization
     * ------------------------------------------------------------------------
     *
     * Contact Support is intended for employees.
     * Admin and HR handle support requests rather than submitting them here.
     */
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return {
        success: false,
        message: "Your account is inactive.",
        errors: {},
      };
    }

    if (user.role !== "EMPLOYEE") {
      return {
        success: false,
        message: "Only employees can submit support requests.",
        errors: {},
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    /*
     * ------------------------------------------------------------------------
     * Form data
     * ------------------------------------------------------------------------
     */
    const values = {
      category: String(formData.get("category") ?? "").trim(),
      subject: String(formData.get("subject") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    /*
     * ------------------------------------------------------------------------
     * Validation
     * ------------------------------------------------------------------------
     */
    const result = contactRequestSchema.safeParse(values);

    if (!result.success) {
      return {
        success: false,
        message: "",
        errors: result.error.flatten().fieldErrors,
      };
    }

    /*
     * ------------------------------------------------------------------------
     * Create Contact Request
     * ------------------------------------------------------------------------
     */
    const contactRequest = await prisma.contactRequest.create({
      data: {
        userId: user.id,
        category: result.data.category,
        subject: result.data.subject,
        message: result.data.message,
      },
    });

    /*
     * ------------------------------------------------------------------------
     * Find Admin + HR reviewers
     * ------------------------------------------------------------------------
     */
    const reviewers = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "HR"],
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    /*
     * ------------------------------------------------------------------------
     * In-app notifications
     * ------------------------------------------------------------------------
     */
    await Promise.all(
      reviewers.map((reviewer) =>
        createNotification({
          userId: reviewer.id,
          type: "CONTACT_REQUEST_SUBMITTED",
          title: "New Support Request",
          message: `${user.name} submitted a new support request: "${contactRequest.subject}".`,
          metadata: {
            contactRequestId: contactRequest.id,
            submittedById: user.id,
            submittedByName: user.name,
            submittedByEmail: user.email,
            category: contactRequest.category,
            subject: contactRequest.subject,
          },
        }),
      ),
    );

    /*
     * ------------------------------------------------------------------------
     * Email notifications
     * ------------------------------------------------------------------------
     *
     * Send the request details to every active Admin/HR reviewer.
     */
    await Promise.all(
      reviewers.map(async (reviewer) => {
        try {
          await sendBrevoEmail({
            to: {
              email: reviewer.email,
              name: reviewer.name,
            },
            subject: `New ExpenseFlow Support Request: ${contactRequest.subject}`,
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

                <h3>New Support Request</h3>

                <p>
                  A new support request has been submitted by
                  <strong>${user.name}</strong>.
                </p>

                <p>
                  <strong>Email:</strong> ${user.email}
                </p>

                <p>
                  <strong>Category:</strong> ${contactRequest.category}
                </p>

                <p>
                  <strong>Subject:</strong> ${contactRequest.subject}
                </p>

                <p>
                  <strong>Message:</strong>
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
                  ${contactRequest.message}
                </div>

                <p style="margin-top: 20px;">
                  Request ID: #${contactRequest.id}
                </p>

                <p style="margin-top: 24px;">
  <a
    href="${appUrl}/contact-requests"
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
    View Support Request
  </a>
</p>
              </div>
            `,
          });
        } catch (emailError) {
          /*
           * Email failure should not undo the successfully
           * created database request and in-app notifications.
           */
          console.error(
            `Failed to email reviewer ${reviewer.email}:`,
            emailError,
          );
        }
      }),
    );

    /*
     * ------------------------------------------------------------------------
     * Refresh relevant pages
     * ------------------------------------------------------------------------
     */
    revalidatePath("/contact");

    return {
      success: true,
      message:
        "Your support request has been submitted successfully. Our team will get back to you soon.",
      errors: {},
    };
  } catch (error) {
    console.error("Create Contact Request Error:");
    console.error(error);

    return {
      success: false,
      message:
        "Something went wrong while submitting your request. Please try again.",
      errors: {},
    };
  }
}
