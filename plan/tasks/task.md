# Project Task Tracker

## Project Roadmap (Modified)

The project roadmap has been intentionally reduced to the following features.

### Task 01 — Multi-currency Support

Status: COMPLETED

Implement the complete multi-currency bonus feature, including:

- Currency selection for expense creation/editing.
- Original expense currency and amount preservation.
- Server-side exchange-rate lookup.
- Server-side currency conversion to the application's base currency.
- Persistent exchange-rate and conversion data.
- Currency-aware expense retrieval and types.
- Currency-aware expense, dashboard, approval, reimbursement, analytics, and reports UI.
- Currency filtering in Analytics/Reports.
- INR as the default Analytics/Reports currency.
- Correct currency symbols and values in charts and UI.
- Existing INR workflow compatibility.
- Multi-currency testing and final validation.

Task-specific implementation and progress are tracked in:

`plan/tasks/task01/task.md`

Current subtask status:

- Task 01.1 — Define currency and exchange-rate data model — COMPLETED
- Task 01.2 — Add currency selection to expense creation/editing — COMPLETED
- Task 01.3 — Integrate live exchange-rate API and persist conversion data — COMPLETED
- Task 01.4 — Implement server-side currency conversion — COMPLETED
- Task 01.5 — Update expense retrieval/types — COMPLETED
- Task 01.6 — Update expense and reimbursement UI — IN PROGRESS
- Task 01.7 — Test existing INR workflow and new multi-currency workflow — IN PROGRESS
- Task 01.8 — Review implementation and run TypeScript/build checks — IN PROGRESS
- Task 01.9 — Commit feature branch and merge into main — NOT STARTED

### Task 02 — Light/Dark Theme Toggle

Status: COMPLETED

Implement a light/dark theme toggle for the application.

Scope:

- Add light/dark theme switching.
- Provide an accessible theme control.
- Ensure the selected theme is applied consistently across the application.
- Review affected components for theme compatibility.
- Test both themes across the main application pages.

Task-specific implementation and progress will be tracked in:

`plan/tasks/task02/task.md`

### Task 03 — Pagination

Status: COMPLETED

Add pagination where expense/history datasets can become large.

Scope:

- Identify pages and datasets requiring pagination.
- Implement appropriate pagination behavior.
- Preserve existing filtering and sorting behavior where applicable.
- Provide clear navigation controls.
- Ensure pagination works correctly with the application's existing data retrieval approach.
- Test pagination with small, medium, and larger datasets.

Task-specific implementation and progress will be tracked in:

`plan/tasks/task03/task.md`

### Task 04 — Icons Client Interactive

Status: COMPLETED

dentify the shared dashboard/header component responsible for rendering:

- Notification bell
- Help/question-mark icon
- User profile/avatar icon

Confirm which icons are already client interactive and which require navigation.

### Task 05 — Expense Status Filtering

Status: IN PROGRESS

Allow users to filter their expenses by approval and reimbursement status.

Scope:

- Add filtering to the My Expenses page.
- Add filtering to the Analytics page.
- Add filtering to the Reports page.
- Support Expense Approval Status filtering.
- Support Reimbursement Status filtering.
- Support filtering by a combination of both statuses.
- Default state must show all expenses with no status filters applied.
- Ensure filtering works together with the existing expense/date/category/currency filters where applicable.
- Preserve correct totals, charts, and displayed expense records after filtering.
- Test all supported status combinations.

Task-specific implementation and progress will be tracked in:

`plan/tasks/task05/task.md`

## Documentation Structure

Each major task has its own task directory:

- `plan/tasks/task01/task.md`
- `plan/tasks/task02/task.md`
- `plan/tasks/task03/task.md`
- `plan/tasks/task04/task.md`
- `plan/tasks/task05/task.md`

The master tracker records the overall roadmap and high-level status.

Detailed implementation progress, review checklists, testing status, and subtask history belong in the corresponding task-specific `task.md`.
