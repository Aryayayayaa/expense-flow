import { sendBrevoEmail } from "./brevo";

export async function testBrevoEmail(email: string) {
  return sendBrevoEmail({
    to: {
      email,
    },
    subject: "ExpenseFlow Brevo Test",
    htmlContent: `
      <div style="font-family: Arial, sans-serif;">
        <h2>ExpenseFlow</h2>
        <p>This is a test email from the ExpenseFlow application.</p>
        <p>Brevo email integration is working successfully.</p>
      </div>
    `,
    textContent: "ExpenseFlow Brevo email integration is working successfully.",
  });
}
