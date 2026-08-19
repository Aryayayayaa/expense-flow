"use client";

import Link from "next/link";
import { type FormEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
  page: number;
  totalPages: number;
  paramName?: string;
};

export default function Pagination({
  page,
  totalPages,
  paramName = "page",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function createPageUrl(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete(paramName);
    } else {
      params.set(paramName, String(nextPage));
    }

    const queryString = params.toString();

    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function handlePageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const requestedPage = Number(formData.get("page"));

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      requestedPage > totalPages
    ) {
      return;
    }

    window.location.href = createPageUrl(requestedPage);
  }

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800"
    >
      {/* Previous */}
      <Link
        href={createPageUrl(previousPage)}
        aria-disabled={page === 1}
        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
          page === 1
            ? "pointer-events-none border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600"
            : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
      >
        Previous
      </Link>

      {/* Current Page */}
      <form
        onSubmit={handlePageSubmit}
        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
      >
        <span>Page</span>

        <input
          type="number"
          name="page"
          min={1}
          max={totalPages}
          defaultValue={page}
          aria-label="Page number"
          className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <span>of {totalPages}</span>
      </form>

      {/* Next */}
      <Link
        href={createPageUrl(nextPage)}
        aria-disabled={page === totalPages}
        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
          page === totalPages
            ? "pointer-events-none border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600"
            : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}
