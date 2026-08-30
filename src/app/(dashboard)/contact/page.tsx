"use client";

import { useActionState } from "react";
import { useEffect, useRef } from "react";

import {
  createContactRequestAction,
  type ContactRequestActionState,
} from "@/features/contact/actions/contact-actions";

import {
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  Send,
  SquareArrowOutUpRight,
} from "lucide-react";

export default function ContactSupportPage() {
  const initialState: ContactRequestActionState = {
    success: false,
    message: "",
    errors: {},
  };

  const [state, formAction, pending] = useActionState(
    createContactRequestAction,
    initialState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="w-full m-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Contact Support
        </h1>

        <p className="mt-1 max-w-[650px] text-sm leading-5 text-slate-700">
          We're here to help. Reach out regarding issues with ExpenseFlow,
          billing inquiries, or general support.
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_247px] m-5">
        {/* Contact Form */}
        <section className="rounded-md border border-[#d3d7e5] bg-white p-5">
          <form ref={formRef} action={formAction}>
            {/* Category */}
            <div className="mt-5">
              <label
                htmlFor="category"
                className="mb-2 block text-xs font-medium text-slate-900"
              >
                Category
              </label>

              <div className="relative">
                <select
                  id="category"
                  name="category"
                  defaultValue=""
                  required
                  className="h-8 w-full appearance-none rounded-[3px] border border-[#d0d4e2] bg-white px-3 pr-9 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select a category...
                  </option>
                  <option value="expense">Expense Issue</option>
                  <option value="reimbursement">Reimbursement Issue</option>
                  <option value="approval">Approval Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              </div>
              {state.errors.category && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.category[0]}
                </p>
              )}
            </div>

            {/* Subject */}
            <div className="mt-5">
              <label
                htmlFor="subject"
                className="mb-2 block text-xs font-medium text-slate-900"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Brief summary of your inquiry"
                required
                className="h-8 w-full rounded-[3px] border border-[#d0d4e2] bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {state.errors.subject && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.subject[0]}
              </p>
            )}

            {/* Message */}
            <div className="mt-5">
              <label
                htmlFor="message"
                className="mb-2 block text-xs font-medium text-slate-900"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Describe your issue or question in detail..."
                required
                className="w-full resize-none rounded-[3px] border border-[#d0d4e2] bg-white px-3 py-2 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {state.errors.message && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.message[0]}
                </p>
              )}
            </div>

            {/* Server response */}
            {state.message && (
              <div
                className={`mt-5 rounded-md p-3 text-xs ${
                  state.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {state.message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-7 inline-flex h-8 items-center justify-center rounded-[3px] bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={pending}
            >
              {pending ? "Sending..." : "Send Message"}
              {!pending && <Send className="ml-2 h-3.5 w-3.5" />}
            </button>
          </form>
        </section>

        {/* Other Ways To Connect */}
        <aside className="h-fit rounded-md border border-[#d3d7e5] bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Other ways to connect
          </h2>

          {/* Email Support */}
          <div className="mt-5 flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <Mail className="h-4 w-4 text-indigo-600" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-900">
                Email Support
              </h3>

              <p className="mt-1 text-xs leading-4 text-slate-600">
                Typically replies within 24
                <br />
                hours.
              </p>

              <a
                href="mailto:support@expenseflow.com"
                className="mt-2 block text-xs font-medium text-indigo-600 hover:underline"
              >
                abcxyz560078@gmail.com
              </a>
            </div>
          </div>

          <div className="my-5 border-t border-[#d5d8e5]" />

          {/* Help Center */}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <SquareArrowOutUpRight className="h-4 w-4 text-indigo-600" />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900">
                Help Center
              </h3>

              <p className="mt-1 text-xs leading-4 text-slate-600">
                Browse FAQs, tutorials, and
                <br />
                guides.
              </p>

              <a
                href="/help"
                className="mt-2 inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
              >
                Visit Help Center
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="my-5 border-t border-[#d5d8e5]" />

          {/* Phone Support */}
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <Phone className="h-4 w-4 text-indigo-600" />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900">
                Phone Support
              </h3>

              <p className="mt-1 text-xs leading-4 text-slate-600">
                Mon-Fri from 9am to 6pm
                <br />
                IST.
              </p>

              <a
                href="tel:+919740534547"
                className="mt-2 block text-xs font-medium text-indigo-600 hover:underline"
              >
                +91 97405 34547
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
