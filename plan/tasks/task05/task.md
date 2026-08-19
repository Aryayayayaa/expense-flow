# Task 05 — Expense Status Filtering

Status: IN PROGRESS

## Objective

Implement expense status filtering across the application so users can
filter expenses by approval status and reimbursement status.

The filtering must integrate with the existing expense, date, category,
currency, analytics, reports, and pagination behavior without breaking
existing functionality.

---

## Scope

- Add Expense Approval Status filtering to the My Expenses page.
- Add Reimbursement Status filtering to the My Expenses page.
- Add Expense Approval Status filtering to the Analytics page.
- Add Reimbursement Status filtering to the Analytics page.
- Add Expense Approval Status filtering to the Reports page.
- Add Reimbursement Status filtering to the Reports page.
- Support combining Approval Status and Reimbursement Status filters.
- Keep all status filters unselected by default.
- Ensure the default state displays all applicable expenses.
- Preserve existing expense/date/category/currency filtering behavior.
- Preserve pagination behavior where applicable.
- Ensure totals reflect the filtered dataset.
- Ensure analytics charts reflect the filtered dataset.
- Ensure reports reflect the filtered dataset.
- Test all supported status combinations.
- Run TypeScript/build checks.
- Complete final regression testing.
- Commit the completed Task 05 implementation.
- Merge the feature branch into `main` for production.

---

# Subtasks

## Task 05.1 — Inspect Existing Status Architecture

Status: COMPLETED

### Objective

Review the existing Prisma status fields, expense types, retrieval
functions, and filtering implementations before making changes.

### Checklist

- [x] Inspect the Expense approval status field.
- [x] Inspect the Expense reimbursement status field.
- [x] Inspect existing serialized expense types.
- [x] Inspect My Expenses filtering implementation.
- [x] Inspect Analytics filtering implementation.
- [x] Inspect Reports filtering implementation.
- [x] Identify existing pagination behavior.
- [x] Identify reusable filter components.
- [x] Identify whether status filtering should be performed client-side,
      server-side, or through a combination of both.
- [x] Confirm that existing filtering behavior can be preserved.

### Validation

- [x] No code changes made unnecessarily.
- [x] Existing status values confirmed.
- [x] Existing filtering architecture documented.

---

## Task 05.2 — My Expenses Status Filtering

Status: COMPLETED

### Objective

Add approval-status and reimbursement-status filters to the My Expenses
page.

### Approval Status

The filter must support:

- [x] All
- [x] Pending
- [x] Approved
- [x] Rejected

### Reimbursement Status

The filter must support:

- [x] All
- [x] Pending
- [x] Reimbursed
- [x] Rejected

### Requirements

- [x] Default Approval Status is All.
- [x] Default Reimbursement Status is All.
- [x] Existing expense records remain unchanged.
- [x] Filtering updates the displayed expense records.
- [x] Approval and reimbursement filters can be used together.
- [x] Existing currency filtering continues to work.
- [x] Existing category filtering continues to work.
- [x] Existing year/month/date filtering continues to work.
- [x ] Pagination continues to work with status filtering.
- [x] Filtered totals remain correct.
- [x] Empty filtered results display an appropriate empty state.

### Validation

- [x] Test Approval Status = Pending.
- [x] Test Approval Status = Approved.
- [x] Test Approval Status = Rejected.
- [x] Test Reimbursement Status = Pending.
- [x] Test Reimbursement Status = Reimbursed.
- [x] Test Reimbursement Status = Rejected.
- [x] Test both filters together.
- [x] Test All + All.
- [x] Test status filters combined with existing filters.

---

## Task 05.3 — Analytics Status Filtering

Status: COMPLETED

### Objective

Add approval-status and reimbursement-status filtering to the Analytics
page.

### Requirements

- [x] Add Approval Status filter.
- [x] Add Reimbursement Status filter.
- [x] Default both filters to All.
- [x] Apply status filters before analytics calculations.
- [x] Preserve existing currency filtering.
- [x] Preserve existing category filtering.
- [x] Preserve existing year/month filtering.
- [x] Preserve existing date filtering.
- [x] Preserve existing expense scope behavior.
- [x] Ensure category charts use the filtered dataset.
- [x] Ensure monthly charts use the filtered dataset.
- [x] Ensure yearly charts use the filtered dataset.
- [x] Ensure category comparison charts use the filtered dataset.
- [x] Ensure displayed totals match the filtered dataset.
- [x] Ensure empty filtered datasets do not break charts.

### Validation

- [x] Test each Approval Status.
- [x] Test each Reimbursement Status.
- [x] Test both status filters together.
- [x] Test status + currency.
- [x] Test status + category.
- [x] Test status + year/month.
- [x] Test status + date range.
- [x] Test status filters across all analytics tabs.

---

## Task 05.4 — Reports Status Filtering

Status: COMPLETED

### Objective

Add approval-status and reimbursement-status filtering to the Reports
page.

### Requirements

- [x] Add Approval Status filter.
- [x] Add Reimbursement Status filter.
- [x] Default both filters to All.
- [x] Preserve existing currency filtering.
- [x] Preserve existing category filtering.
- [x] Preserve existing date filtering.
- [x] Preserve existing report sorting.
- [x] Ensure report records reflect the selected statuses.
- [x] Ensure report totals reflect the filtered dataset.
- [x] Ensure generated/exported report data reflects the selected filters,
      where applicable.

### Validation

- [x] Test each Approval Status.
- [x] Test each Reimbursement Status.
- [x] Test both status filters together.
- [x] Test status + existing report filters.
- [x] Test report totals.
- [x] Test report output/export behavior, where applicable.

---

## Task 05.5 — Approvals Page Status Filtering

Status: COMPLETED

Add Expense Approval Status and Reimbursement Status filtering to the Approvals page.

### Scope

- [x] Add the reusable approval status filter to the Approvals page.
- [x] Add the reusable reimbursement status filter to the Approvals pag.
- [x] Support Expense Approval Status filtering:
  - [x] All
  - [x] Pending
  - [x] Approved
  - [x] Rejected
- [x] Support Reimbursement Status filtering:
  - [x] All
  - [x] Pending
  - [x] Reimbursed
  - [x] Rejected
- [x] Support filtering using both status filters together.
- [x] Default state must show all applicable expenses with no status filters applied.
- [x] Ensure status filtering works correctly with the existing Approvals page behavior.
- [x] Ensure filtering does not break existing approval/reimbursement actions.
- [x] Preserve correct expense records and displayed status information after filtering.
- [x] Test all supported approval status combinations.
- [x] Test all supported reimbursement status combinations.
- [x] Test combinations of approval and reimbursement statuses.
- [x] Test the default unfiltered state.
- [x] Test that existing Approvals page functionality continues to work without errors.

---

## Task 05.6 — Combined Filtering Behavior

Status: COMPLETED

### Objective

Ensure status filtering works correctly together with the application's
existing filtering system.

### Required Filter Combinations

- [x] Approval Status + Reimbursement Status.
- [x] Approval Status + Currency.
- [x] Approval Status + Category.
- [x] Approval Status + Date.
- [x] Reimbursement Status + Currency.
- [x] Reimbursement Status + Category.
- [x] Reimbursement Status + Date.
- [x] Approval Status + Reimbursement Status + Currency.
- [x] Approval Status + Reimbursement Status + Category.
- [x] Approval Status + Reimbursement Status + Date.
- [x] All existing filters + both status filters.

### Requirements

- [x] Filters must use AND-style filtering where multiple filters are selected.
- [x] Clearing one status filter must not clear the other filters.
- [x] Clearing all status filters must restore the default datset.
- [x] Existing filter behavior must remain unchanged
- [x] No duplicate filtering logic should produce conflicting results.

---

## Task 05.7 — Pagination and Status Filtering

Status: COMPLETED

### Objective

Verify that status filtering and pagination work together correctly on
pages where pagination is implemented.

### Checklist

- [x] Verify filtered total count.
- [x] Verify total page count.
- [x] Verify page navigation after applying a status filter.
- [x] Verify manual page-number navigation.
- [x] Verify changing filters resets or handles the current page correctly.
- [x] Verify clearing filters restores the appropriate pagination state.
- [x] Verify no empty pages are produced because of stale page parameters.
- [x] Preserve existing sorting while paginating filtered results.

---

## Task 05.8 — UI and Responsive Behavior

Status: COMPLETED

### Objective

Ensure the new status filters integrate cleanly with the existing UI and
responsive layouts.

### Checklist

- [x] Match existing filter component styling.
- [x] Use clear Approval Status labeling.
- [x] Use clear Reimbursement Status labeling.
- [x] Ensure filter controls do not cause horizontal overflow.
- [x] Verify desktop layout.
- [x] Verify tablet layout.
- [x] Verify mobile layout.
- [x] Verify light theme.
- [x] Verify dark theme.
- [x] Verify empty filtered-state UI.
- [x] Verify filter combinations remain understandable to users.

---

## Task 05.9 — Testing and Regression Validation

Status: COMPLETED

### TypeScript

- [x] Run `npx tsc --noEmit`.
- [x] Resolve all TypeScript errors.

### Existing Workflow Regression

- [x] Verify expense creation still works.
- [x] Verify expense editing still works.
- [x] Verify expense approval still works.
- [x] Verify expense rejection still works.
- [x] Verify reimbursement processing still works.
- [x] Verify existing currency filtering still works.
- [x] Verify existing date filtering still works.
- [x] Verify existing category filtering still works.
- [x] Verify pagination still works.

### Status Filtering

- [x] Test default All + All state.
- [x] Test Pending approval status.
- [x] Test Approved approval status.
- [x] Test Rejected approval status.
- [x] Test Pending reimbursement status.
- [x] Test Reimbursed reimbursement status.
- [x] Test Rejected reimbursement status.
- [x] Test every supported Approval + Reimbursement combination.
- [x] Test filtered results with zero matching records.
- [x] Test filtered results with one matching record.
- [x] Test filtered results spanning multiple pages.

### Analytics

- [x] Verify filtered category totals.
- [x] Verify filtered monthly totals.
- [x] Verify filtered yearly totals.
- [x] Verify filtered charts.
- [x] Verify currency conversion remains correct.

### Reports

- [x] Verify filtered report records.
- [x] Verify filtered report totals.
- [x] Verify report generation/export behavior.

### Responsive Testing

- [x] Test mobile.
- [x] Test tablet.
- [x] Test desktop.
- [x] Verify no horizontal overflow.

---

## Task 05.10 — Final Review and Production Merge

Status: IN PROGRESS

### Checklist

- [x] Review all Task 05 code changes.
- [x] Remove unused imports and variables.
- [x] Confirm no unnecessary changes were introduced.
- [x] Run `npx tsc --noEmit`.
- [x] Run the relevant application tests.
- [x] Complete manual UI testing.
- [x] Verify all Task 05 requirements.
- [x] Update this task file with final completion status.
- [x] Commit Task 05 changes to the feature branch.
- [x] Push the feature branch to GitLab/GitHub.
- [x] Merge the feature branch into `main`.
- [x] Verify the production branch after merge.

---

# Final Completion Criteria

Task 05 can be marked COMPLETED only when:

- My Expenses supports Approval Status filtering.
- My Expenses supports Reimbursement Status filtering.
- Analytics supports Approval Status filtering.
- Analytics supports Reimbursement Status filtering.
- Reports supports Approval Status filtering.
- Reports supports Reimbursement Status filtering.
- Both status filters can be combined.
- Existing filters continue to work.
- Default state shows all applicable expenses.
- Pagination continues to work.
- Totals remain correct.
- Analytics charts remain correct.
- Reports remain correct.
- Responsive behavior has been verified.
- TypeScript checks pass.
- Relevant tests pass.
- Regression testing passes.
- Changes are committed.
- Feature branch is pushed.
- Changes are merged into `main`.
- Production verification is complete.

---

# Implementation Notes

- Do not modify underlying expense records when applying filters.
- Preserve existing approval and reimbursement status values.
- Reuse existing filter patterns/components where practical.
- Avoid duplicating filtering logic unnecessarily.
- Status filters should default to All.
- Multiple selected filters should narrow the dataset rather than replace
  one another.
- Existing currency, category, date, analytics, reports, and pagination
  behavior must remain functional.
