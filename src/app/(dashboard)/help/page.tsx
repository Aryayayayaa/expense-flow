import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Help & Application Guide
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Learn how to use the expense management application and understand
            the expense approval and reimbursement workflow.
          </p>
        </div>

        <div className="space-y-6">
          {/* About */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              About the Application
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This application allows employees to submit and manage their
              expenses while providing Admin and HR users with tools to review,
              approve, reject, and process reimbursements.
            </p>
          </section>

          {/* Submit Expense */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              How to Submit an Expense
            </h2>

            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li>Open the Expenses section.</li>
              <li>Select the option to submit a new expense.</li>
              <li>Enter the expense title, amount, category, and date.</li>
              <li>Select the appropriate currency when required.</li>
              <li>Upload supporting documents such as receipts.</li>
              <li>Review the information and submit the expense.</li>
            </ol>

            <Link
              href="/expenses/new"
              className="mt-5 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Submit New Expense
            </Link>
          </section>

          {/* Approval Workflow */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Expense Approval Workflow
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <p>
                After an expense is submitted, it enters the approval workflow.
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Pending:
                  </strong>{" "}
                  The expense is waiting for Admin review.
                </li>

                <li>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Approved:
                  </strong>{" "}
                  The Admin has approved the expense.
                </li>

                <li>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Rejected:
                  </strong>{" "}
                  The Admin has rejected the expense and may provide a reason.
                </li>
              </ul>
            </div>
          </section>

          {/* Reimbursement */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Reimbursement Workflow
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Approved expenses can proceed to the reimbursement workflow. HR
              users can review approved expenses and process their
              reimbursement.
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li>Approved expenses become available for HR processing.</li>
              <li>HR can review the reimbursement information.</li>
              <li>The reimbursement can then be marked as processed.</li>
              <li>
                Completed reimbursement decisions are preserved in history.
              </li>
            </ul>
          </section>

          {/* Navigation */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Application Navigation
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Use the sidebar to access the areas available to your account. The
              header also provides quick access to notifications, help, and your
              profile.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>

              <Link
                href="/expenses"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                My Expenses
              </Link>

              <Link
                href="/profile"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Profile
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200">
              Contact Us
            </h2>

            <p className="mt-3 text-sm leading-6 text-blue-800 dark:text-blue-300">
              If you need assistance with an expense, approval, reimbursement,
              or account-related issue, contact your organization's designated
              administrator or HR representative.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
