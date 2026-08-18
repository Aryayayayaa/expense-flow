# Project Task Tracker

## Project Roadmap

The project roadmap has been intentionally reduced to the following features.

### Task 01 — Multi-currency Support

Status: IN PROGRESS

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

Status: NOT STARTED

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

Status: NOT STARTED

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

### Task 04 — Expense Status Filtering

Status: NOT STARTED

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

`plan/tasks/task04/task.md`

## Completed

- Task 00 — Planning & Specification Setup — COMPLETED
  - Created the project planning/specification structure.
  - Established the AI-assisted implementation workflow.
  - Defined specification, task tracking, implementation, testing, and review requirements.

## Not Started / Removed from Current Roadmap

The following previously proposed features are intentionally not part of the current roadmap:

- CSV Export
- PDF Reports
- Budget / Policy Limitations
- Real-time Notifications
- Responsive UI as a standalone feature
- Application Architecture / File Walkthrough
- External API / Service Audit
- Interactive Top Bar Controls

These features may be reconsidered in a future roadmap revision, but should not be implemented as part of the current feature plan.

## Workflow

Each task must follow:

1. Specification
2. Architecture inspection
3. Implementation
4. Testing
5. Review
6. Update task-specific documentation
7. Update this master tracker
8. Update the overall specification when required
9. Proceed to the next task only after completion

## Documentation Structure

Each major task has its own task directory:

- `plan/tasks/task01/task.md`
- `plan/tasks/task02/task.md`
- `plan/tasks/task03/task.md`
- `plan/tasks/task04/task.md`

The master tracker records the overall roadmap and high-level status.

Detailed implementation progress, review checklists, testing status, and subtask history belong in the corresponding task-specific `task.md`.
