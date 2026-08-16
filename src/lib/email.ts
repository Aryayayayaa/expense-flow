import { Resend } from "resend";

console.log(
  "RESEND KEY CHECK:",
  process.env.RESEND_API_KEY
    ? `present (${process.env.RESEND_API_KEY.slice(0, 7)}...)`
    : "MISSING",
);

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "ExpenseFlow <onboarding@resend.dev>";

type ExpenseEmailData = {
  employeeName: string;
  employeeEmail: string;
  expenseTitle: string;
  amount: number;
  category: string;
  expenseDate: Date | null;
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not specified";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function sendExpenseApprovedEmail(data: ExpenseEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. Approval email was not sent.",
    );

    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.employeeEmail,
      subject: `Expense Approved - ${data.expenseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #16a34a;">
            Expense Approved
          </h2>

          <p>
            Hi ${data.employeeName},
          </p>

          <p>
            Your expense has been approved by the Admin.
          </p>

          <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p><strong>Expense:</strong> ${data.expenseTitle}</p>
            <p><strong>Amount:</strong> ${formatAmount(data.amount)}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Expense Date:</strong> ${formatDate(data.expenseDate)}</p>
            <p><strong>Status:</strong> Approved</p>
          </div>

          <p>
            Your expense has moved to the reimbursement process.
          </p>

          <p>
            Regards,<br />
            ExpenseFlow
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send expense approval email:", error);
  }
}

export async function sendExpenseRejectedEmail(
  data: ExpenseEmailData & {
    rejectionReason: string;
  },
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. Rejection email was not sent.",
    );

    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.employeeEmail,
      subject: `Expense Rejected - ${data.expenseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #dc2626;">
            Expense Rejected
          </h2>

          <p>
            Hi ${data.employeeName},
          </p>

          <p>
            Your expense has been rejected by the Admin.
          </p>

          <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p><strong>Expense:</strong> ${data.expenseTitle}</p>
            <p><strong>Amount:</strong> ${formatAmount(data.amount)}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Expense Date:</strong> ${formatDate(data.expenseDate)}</p>
            <p><strong>Status:</strong> Rejected</p>
          </div>

          <div style="margin: 24px 0; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
            <p>
              <strong>Rejection Reason:</strong>
            </p>

            <p>
              ${data.rejectionReason}
            </p>
          </div>

          <p>
            Please review the reason and make any necessary corrections before submitting another expense.
          </p>

          <p>
            Regards,<br />
            ExpenseFlow
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send expense rejection email:", error);
  }
}

export async function sendExpenseReimbursedEmail(data: ExpenseEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. Reimbursement email was not sent.",
    );

    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.employeeEmail,
      subject: `Expense Reimbursed - ${data.expenseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #2563eb;">
            Expense Reimbursed
          </h2>

          <p>
            Hi ${data.employeeName},
          </p>

          <p>
            Your expense has been successfully processed and marked as reimbursed by HR.
          </p>

          <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p><strong>Expense:</strong> ${data.expenseTitle}</p>
            <p><strong>Amount:</strong> ${formatAmount(data.amount)}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Expense Date:</strong> ${formatDate(data.expenseDate)}</p>
            <p><strong>Reimbursement Status:</strong> Reimbursed</p>
          </div>

          <p>
            The reimbursement process for this expense has been completed.
          </p>

          <p>
            Regards,<br />
            ExpenseFlow
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send expense reimbursement email:", error);
  }
}

export async function sendReimbursementRejectedEmail(
  data: ExpenseEmailData & {
    rejectionReason: string;
  },
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY is not configured. Reimbursement rejection email was not sent.",
    );

    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: data.employeeEmail,
      subject: `Reimbursement Rejected - ${data.expenseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #dc2626;">
            Reimbursement Rejected
          </h2>

          <p>
            Hi ${data.employeeName},
          </p>

          <p>
            The reimbursement request for your approved expense has been rejected by HR.
          </p>

          <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p><strong>Expense:</strong> ${data.expenseTitle}</p>
            <p><strong>Amount:</strong> ${formatAmount(data.amount)}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Expense Date:</strong> ${formatDate(data.expenseDate)}</p>
            <p><strong>Reimbursement Status:</strong> Rejected</p>
          </div>

          <div style="margin: 24px 0; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
            <p>
              <strong>Rejection Reason:</strong>
            </p>

            <p>
              ${data.rejectionReason}
            </p>
          </div>

          <p>
            Please review the reason and contact the appropriate HR representative if further clarification is required.
          </p>

          <p>
            Regards,<br />

            ExpenseFlow
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reimbursement rejection email:", error);
  }
}
