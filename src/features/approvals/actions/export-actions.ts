"use server";

import { auth } from "@/auth";
import { sendBrevoEmail } from "@/lib/brevo";

type EmailExportInput = {
  filename: string;
  title: string;
  format: "csv" | "pdf";
  contentBase64: string;
};

type EmailExportResult = {
  success: boolean;
  message: string;
};

const MAX_ATTACHMENT_CHARS = 7_000_000;

export async function emailExportAction(
  input: EmailExportInput,
): Promise<EmailExportResult> {
  const session = await auth();
  const email = session?.user?.email?.trim();

  if (!session?.user?.id || !email) {
    return {
      success: false,
      message: "You must be signed in with an email to mail this export.",
    };
  }

  if (input.format !== "csv" && input.format !== "pdf") {
    return {
      success: false,
      message: "Unsupported export format.",
    };
  }

  const filename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = input.format;
  const attachmentName = filename.endsWith(`.${extension}`)
    ? filename
    : `${filename}.${extension}`;

  if (!input.contentBase64 || input.contentBase64.length > MAX_ATTACHMENT_CHARS) {
    return {
      success: false,
      message: "This export is too large to email.",
    };
  }

  try {
    console.log(session.user.name ?? "No name");
    await sendBrevoEmail({
      to: {
        email,
        name: session.user.name ?? undefined,
      },
      subject: `ExpenseFlow export: ${input.title}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="margin: 0 0 12px;">Your export is ready</h2>
          <p style="margin: 0 0 12px; color: #334155;">
            ${input.title} is attached as a ${extension.toUpperCase()} file.
          </p>
        </div>
      `,
      textContent: `${input.title} is attached as a ${extension.toUpperCase()} file.`,
      attachment: [
        {
          name: attachmentName,
          content: input.contentBase64,
        },
      ],
    });

    return {
      success: true,
      message: `Export emailed to ${email}.`,
    };
  } catch (error) {
    console.error("Export email error:", error);

    return {
      success: false,
      message: "Unable to email this export. Please try downloading it instead.",
    };
  }
}
