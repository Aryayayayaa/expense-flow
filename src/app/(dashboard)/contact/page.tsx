import { auth } from "@/auth";

import ContactPageClient from "@/features/contact/components/ContactPageClient";
import ContactMethods from "@/features/contact/components/ContactMethods";
import {
  getAllContactRequestHistory,
  getAllContactRequests,
  getEmployeeContactRequestHistory,
  getEmployeeContactRequests,
} from "@/features/contact/lib/contact-requests";

export default async function ContactSupportPage() {
  const session = await auth();

  const role = session?.user?.role;

  if (!session?.user?.id || !role) {
    return null;
  }

  const userId = Number(session.user.id);

  const isEmployee = role === "EMPLOYEE";
  const isAdminOrHr = role === "ADMIN" || role === "HR";

  const requests = isEmployee
    ? await getEmployeeContactRequests(userId)
    : isAdminOrHr
      ? await getAllContactRequests()
      : [];

  const historyRequests = isEmployee
    ? await getEmployeeContactRequestHistory(userId)
    : isAdminOrHr
      ? await getAllContactRequestHistory()
      : [];

  return (
    <div className="m-3 w-full sm:m-5 sm:p-5 p-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          Contact Support
        </h1>

        <p className="mt-1 max-w-[650px] text-sm leading-5 text-slate-700 dark:text-slate-300">
          We're here to help. Reach out regarding issues with ExpenseFlow,
          billing inquiries, or general support.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_247px]">
        <section className="rounded-md border border-[#d3d7e5] bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <ContactPageClient
            role={role}
            requests={requests}
            historyRequests={historyRequests}
          />
        </section>

        <ContactMethods />
      </div>
    </div>
  );
}
