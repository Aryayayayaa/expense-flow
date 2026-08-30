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
    <div className="m-5 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Contact Support
        </h1>

        <p className="mt-1 max-w-[650px] text-sm leading-5 text-slate-700">
          We're here to help. Reach out regarding issues with ExpenseFlow,
          billing inquiries, or general support.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_247px]">
        <section className="rounded-md border border-[#d3d7e5] bg-white p-5">
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
