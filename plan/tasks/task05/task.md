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

Status: NEXT

### Objective

Add approval-status and reimbursement-status filtering to the Analytics
page.

### Requirements

- [ ] Add Approval Status filter.
- [ ] Add Reimbursement Status filter.
- [ ] Default both filters to All.
- [ ] Apply status filters before analytics calculations.
- [ ] Preserve existing currency filtering.
- [ ] Preserve existing category filtering.
- [ ] Preserve existing year/month filtering.
- [ ] Preserve existing date filtering.
- [ ] Preserve existing expense scope behavior.
- [ ] Ensure category charts use the filtered dataset.
- [ ] Ensure monthly charts use the filtered dataset.
- [ ] Ensure yearly charts use the filtered dataset.
- [ ] Ensure category comparison charts use the filtered dataset.
- [ ] Ensure displayed totals match the filtered dataset.
- [ ] Ensure empty filtered datasets do not break charts.

### Validation

- [ ] Test each Approval Status.
- [ ] Test each Reimbursement Status.
- [ ] Test both status filters together.
- [ ] Test status + currency.
- [ ] Test status + category.
- [ ] Test status + year/month.
- [ ] Test status + date range.
- [ ] Test status filters across all analytics tabs.

---

## Task 05.4 — Reports Status Filtering

Status: NOT STARTED

### Objective

Add approval-status and reimbursement-status filtering to the Reports
page.

### Requirements

- [ ] Add Approval Status filter.
- [ ] Add Reimbursement Status filter.
- [ ] Default both filters to All.
- [ ] Preserve existing currency filtering.
- [ ] Preserve existing category filtering.
- [ ] Preserve existing date filtering.
- [ ] Preserve existing report sorting.
- [ ] Ensure report records reflect the selected statuses.
- [ ] Ensure report totals reflect the filtered dataset.
- [ ] Ensure generated/exported report data reflects the selected filters,
      where applicable.

### Validation

- [ ] Test each Approval Status.
- [ ] Test each Reimbursement Status.
- [ ] Test both status filters together.
- [ ] Test status + existing report filters.
- [ ] Test report totals.
- [ ] Test report output/export behavior, where applicable.

---

## Task 05.5 — Combined Filtering Behavior

Status: NOT STARTED

### Objective

Ensure status filtering works correctly together with the application's
existing filtering system.

### Required Filter Combinations

- [ ] Approval Status + Reimbursement Status.
- [ ] Approval Status + Currency.
- [ ] Approval Status + Category.
- [ ] Approval Status + Date.
- [ ] Reimbursement Status + Currency.
- [ ] Reimbursement Status + Category.
- [ ] Reimbursement Status + Date.
- [ ] Approval Status + Reimbursement Status + Currency.
- [ ] Approval Status + Reimbursement Status + Category.
- [ ] Approval Status + Reimbursement Status + Date.
- [ ] All existing filters + both status filters.

### Requirements

- [ ] Filters must use AND-style filtering where multiple filters are
      selected.
- [ ] Clearing one status filter must not clear the other filters.
- [ ] Clearing all status filters must restore the default dataset.
- [ ] Existing filter behavior must remain unchanged.
- [ ] No duplicate filtering logic should produce conflicting results.

---

## Task 05.6 — Pagination and Status Filtering

Status: NOT STARTED

### Objective

Verify that status filtering and pagination work together correctly on
pages where pagination is implemented.

### Checklist

- [ ] Verify filtered total count.
- [ ] Verify total page count.
- [ ] Verify page navigation after applying a status filter.
- [ ] Verify manual page-number navigation.
- [ ] Verify changing filters resets or handles the current page correctly.
- [ ] Verify clearing filters restores the appropriate pagination state.
- [ ] Verify no empty pages are produced because of stale page parameters.
- [ ] Preserve existing sorting while paginating filtered results.

---

## Task 05.7 — UI and Responsive Behavior

Status: NOT STARTED

### Objective

Ensure the new status filters integrate cleanly with the existing UI and
responsive layouts.

### Checklist

- [ ] Match existing filter component styling.
- [ ] Use clear Approval Status labeling.
- [ ] Use clear Reimbursement Status labeling.
- [ ] Ensure filter controls do not cause horizontal overflow.
- [ ] Verify desktop layout.
- [ ] Verify tablet layout.
- [ ] Verify mobile layout.
- [ ] Verify light theme.
- [ ] Verify dark theme.
- [ ] Verify empty filtered-state UI.
- [ ] Verify filter combinations remain understandable to users.

---

## Task 05.8 — Testing and Regression Validation

Status: NOT STARTED

### TypeScript

- [ ] Run `npx tsc --noEmit`.
- [ ] Resolve all TypeScript errors.

### Existing Workflow Regression

- [ ] Verify expense creation still works.
- [ ] Verify expense editing still works.
- [ ] Verify expense approval still works.
- [ ] Verify expense rejection still works.
- [ ] Verify reimbursement processing still works.
- [ ] Verify existing currency filtering still works.
- [ ] Verify existing date filtering still works.
- [ ] Verify existing category filtering still works.
- [ ] Verify pagination still works.

### Status Filtering

- [ ] Test default All + All state.
- [ ] Test Pending approval status.
- [ ] Test Approved approval status.
- [ ] Test Rejected approval status.
- [ ] Test Pending reimbursement status.
- [ ] Test Reimbursed reimbursement status.
- [ ] Test Rejected reimbursement status.
- [ ] Test every supported Approval + Reimbursement combination.
- [ ] Test filtered results with zero matching records.
- [ ] Test filtered results with one matching record.
- [ ] Test filtered results spanning multiple pages.

### Analytics

- [ ] Verify filtered category totals.
- [ ] Verify filtered monthly totals.
- [ ] Verify filtered yearly totals.
- [ ] Verify filtered charts.
- [ ] Verify currency conversion remains correct.

### Reports

- [ ] Verify filtered report records.
- [ ] Verify filtered report totals.
- [ ] Verify report generation/export behavior.

### Responsive Testing

- [ ] Test mobile.
- [ ] Test tablet.
- [ ] Test desktop.
- [ ] Verify no horizontal overflow.

---

## Task 05.9 — Final Review and Production Merge

Status: NOT STARTED

### Checklist

- [ ] Review all Task 05 code changes.
- [ ] Remove unused imports and variables.
- [ ] Confirm no unnecessary changes were introduced.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run the relevant application tests.
- [ ] Complete manual UI testing.
- [ ] Verify all Task 05 requirements.
- [ ] Update this task file with final completion status.
- [ ] Commit Task 05 changes to the feature branch.
- [ ] Push the feature branch to GitLab/GitHub.
- [ ] Merge the feature branch into `main`.
- [ ] Verify the production branch after merge.

---

# Final Completion Criteria

Task 05 can be marked COMPLETED only when:

- [ ] My Expenses supports Approval Status filtering.
- [ ] My Expenses supports Reimbursement Status filtering.
- [ ] Analytics supports Approval Status filtering.
- [ ] Analytics supports Reimbursement Status filtering.
- [ ] Reports supports Approval Status filtering.
- [ ] Reports supports Reimbursement Status filtering.
- [ ] Both status filters can be combined.
- [ ] Default state shows all applicable expenses.
- [ ] Existing filters continue to work.
- [ ] Pagination continues to work.
- [ ] Totals remain correct.
- [ ] Analytics charts remain correct.
- [ ] Reports remain correct.
- [ ] Responsive behavior has been verified.
- [ ] TypeScript checks pass.
- [ ] Relevant tests pass.
- [ ] Regression testing passes.
- [ ] Changes are committed.
- [ ] Feature branch is pushed.
- [ ] Changes are merged into `main`.
- [ ] Production verification is complete.

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
