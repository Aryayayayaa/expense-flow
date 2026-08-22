"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
  page: number;
  totalPages: number;

  /*
   * Used by pages that manage pagination locally,
   * such as the Expenses page.
   */
  onPageChange?: (page: number) => void;

  /*
   * Used by pages that manage pagination through
   * URL search parameters.
   */
  paramName?: string;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  paramName = "page",
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inputPage, setInputPage] = useState(String(page));

  /*
   * Keep the input synchronized with the actual page.
   */
  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  if (totalPages <= 1) {
    return null;
  }

  /*
   * URL-based pagination.
   *
   * Used by Approvals, HR, Role Verification, etc.
   */
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

    const requestedPage = Number(inputPage);

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      requestedPage > totalPages
    ) {
      setInputPage(String(page));
      return;
    }

    if (onPageChange) {
      /*
       * Local pagination mode.
       */
      onPageChange(requestedPage);
      return;
    }

    /*
     * URL pagination mode.
     */
    window.location.href = createPageUrl(requestedPage);
  }

  function handlePrevious() {
    const previousPage = Math.max(1, page - 1);

    if (onPageChange) {
      onPageChange(previousPage);
      return;
    }

    /*
     * URL pagination mode.
     */
    window.location.href = createPageUrl(previousPage);
  }

  function handleNext() {
    const nextPage = Math.min(totalPages, page + 1);

    if (onPageChange) {
      onPageChange(nextPage);
      return;
    }

    /*
     * URL pagination mode.
     */
    window.location.href = createPageUrl(nextPage);
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800"
    >
      {/* Previous */}
      {onPageChange ? (
        <button
          type="button"
          onClick={handlePrevious}
          disabled={page === 1}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            page === 1
              ? "cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Previous
        </button>
      ) : (
        <Link
          href={createPageUrl(Math.max(1, page - 1))}
          aria-disabled={page === 1}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            page === 1
              ? "pointer-events-none border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Previous
        </Link>
      )}

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
          value={inputPage}
          onChange={(event) => setInputPage(event.target.value)}
          aria-label="Page number"
          className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <span>of {totalPages}</span>
      </form>

      {/* Next */}
      {onPageChange ? (
        <button
          type="button"
          onClick={handleNext}
          disabled={page === totalPages}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            page === totalPages
              ? "cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Next
        </button>
      ) : (
        <Link
          href={createPageUrl(Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
            page === totalPages
              ? "pointer-events-none border-slate-100 text-slate-300 dark:border-slate-800 dark:text-slate-600"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
