"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createContactRequestAction,
  type ContactRequestActionState,
} from "@/features/contact/actions/contact-actions";

import { ChevronDown, Send } from "lucide-react";

export default function SupportRequestForm() {
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
    <form ref={formRef} action={formAction}>
      {/* Category */}
      <div className="mt-5">
        <label
          htmlFor="category"
          className="mb-2 block text-xs font-medium text-slate-900 dark:text-slate-100"
        >
          Category
        </label>

        <div className="relative">
          <select
            id="category"
            name="category"
            defaultValue=""
            required
            className="h-8 w-full appearance-none rounded-[3px] border border-[#d0d4e2] bg-white px-3 pr-9 text-xs text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600 dark:text-slate-300" />
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
          className="h-8 w-full rounded-[3px] border border-[#d0d4e2] bg-white px-3 text-xs text-slate-700 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
      </div>

      {state.errors.subject && (
        <p className="mt-1 text-xs text-red-600">{state.errors.subject[0]}</p>
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
          className="w-full resize-none rounded-[3px] border border-[#d0d4e2] bg-white px-3 py-2 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        />
        {state.errors.message && (
          <p className="mt-1 text-xs text-red-600">{state.errors.message[0]}</p>
        )}
      </div>

      {/* Server response */}
      {state.message && (
        <div
          className={`mt-5 rounded-md p-3 text-xs ${
            state.success
              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="mt-7 inline-flex h-9 w-full items-center justify-center rounded-[3px] bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:h-8 sm:w-auto"
        disabled={pending}
      >
        {pending ? "Sending..." : "Send Message"}
        {!pending && <Send className="ml-2 h-3.5 w-3.5" />}
      </button>
    </form>
  );
}
