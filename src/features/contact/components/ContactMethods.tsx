import { ExternalLink, Mail, Phone, SquareArrowOutUpRight } from "lucide-react";

export default function ContactMethods() {
  return (
    <aside className="h-fit rounded-md border border-[#d3d7e5] bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Other ways to connect
      </h2>

      {/* Email Support */}
      <div className="mt-5 flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
          <Mail className="h-4 w-4 text-indigo-600" />
        </div>

        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Email Support
          </h3>

          <p className="mt-1 text-xs leading-4 text-slate-600 dark:text-slate-300">
            Typically replies within 24
            <br />
            hours.
          </p>

          <a
            href="mailto:support@expenseflow.com"
            className="mt-2 block text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            abcxyz560078@gmail.com
          </a>
        </div>
      </div>

      <div className="my-5 border-t border-[#d5d8e5] dark:border-slate-700" />

      {/* Help Center */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
          <SquareArrowOutUpRight className="h-4 w-4 text-indigo-600" />
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Help Center</h3>

          <p className="mt-1 text-xs leading-4 text-slate-600 dark:text-slate-300">
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

      <div className="my-5 border-t border-[#d5d8e5] dark:border-slate-700" />

      {/* Phone Support */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
          <Phone className="h-4 w-4 text-indigo-600" />
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Phone Support
          </h3>

          <p className="mt-1 text-xs leading-4 text-slate-600 dark:text-slate-300">
            Mon-Fri from 9am to 6pm
            <br />
            IST.
          </p>

          <a
            href="tel:+919740534547"
            className="mt-2 block text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            +91 97405 34547
          </a>
        </div>
      </div>
    </aside>
  );
}
