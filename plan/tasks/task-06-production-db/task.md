# Task 06 — Database Persistence & Production Database Integration

## Status: STARTING

## Objective

Investigate and resolve the issue where a newly created expense appears to complete successfully from the application's perspective, but the expense is not persisted or displayed afterward.

The issue is currently reproducible in both:

- Localhost development environment
- Production/Vercel environment

The primary goal is to identify why `createExpenseAction` returns a successful HTTP response while the newly created expense is not appearing in:

- My Expenses page
- Prisma Studio / local database
- The expected database records

After resolving the local persistence issue, verify that the production application is correctly connected to the intended production database and that new expenses are persisted there as well.

---

## Current Evidence

When creating a new expense locally, the Next.js terminal reports:

    GET /expenses/new 200 in 77ms
    POST /expenses/new 200 in 52ms
      └─ ƒ createExpenseAction(null, {}) in 9ms

However:

- The newly created expense does not appear on the My Expenses page.
- The newly created expense does not appear in the local Prisma database.
- The same general persistence problem is also observed in the deployed application.

Therefore, HTTP 200 alone must not be considered proof that the database operation succeeded.

---

## Subtasks

### 1. Inspect Expense Creation Flow

[ ] Inspect the complete expense creation flow from the UI form to the server action.

[ ] Identify where the form submits the expense data.

[ ] Inspect `createExpenseAction`.

[ ] Verify the values received by `createExpenseAction`.

[ ] Verify validation/parsing of the submitted expense data.

[ ] Verify authentication/session handling during expense creation.

[ ] Verify that the Prisma `create` operation is actually executed.

[ ] Verify that the Prisma `create` operation is awaited.

[ ] Verify that any errors from the database operation are properly surfaced.

[ ] Verify the return value/state produced by `createExpenseAction`.

---

### 2. Inspect Prisma Expense Model

[ ] Inspect the Prisma schema for the `Expense` model.

[ ] Verify all required fields.

[ ] Verify relationships between `Expense` and `User`.

[ ] Verify currency-related fields.

[ ] Verify approval-related fields.

[ ] Verify reimbursement-related fields.

[ ] Verify expense date/time fields.

[ ] Verify `baseCurrencyAmount` and related conversion fields if applicable.

[ ] Verify that the fields submitted by the form match the Prisma model.

---

### 3. Inspect Database Configuration

[ ] Inspect Prisma client configuration.

[ ] Inspect `DATABASE_URL` usage.

[ ] Inspect `DIRECT_URL` usage if present.

[ ] Determine which database is used by localhost.

[ ] Determine which database is used by the deployed application.

[ ] Verify that Prisma is connecting to the expected database.

[ ] Verify that Prisma migrations/schema are synchronized with the database.

[ ] Verify that the local database contains the expected tables.

[ ] Verify that the production database contains the expected tables.

---

### 4. Investigate Local Database Persistence

[ ] Reproduce the issue on localhost.

[ ] Create a test expense with known values.

[ ] Verify the server action receives the submitted values.

[ ] Verify whether Prisma executes the `Expense.create` operation.

[ ] Verify whether the database transaction succeeds.

[ ] Verify whether the record exists directly in the database.

[ ] Verify whether the record exists through Prisma.

[ ] Verify whether the My Expenses query can retrieve the newly created record.

[ ] Determine whether the problem is:

- [ ] Form submission
- [ ] Server action
- [ ] Validation
- [ ] Prisma operation
- [ ] Database connection
- [ ] Transaction/rollback
- [ ] Authentication/user relationship
- [ ] Query/filtering
- [ ] Cache/revalidation
- [ ] Serialization
- [ ] Other

---

### 5. Investigate My Expenses Retrieval

[ ] Inspect the server-side function used to retrieve expenses.

[ ] Verify that newly created expenses are queried correctly.

[ ] Verify user filtering.

[ ] Verify pagination.

[ ] Verify currency filtering.

[ ] Verify approval/reimbursement filtering.

[ ] Verify date filtering.

[ ] Verify Next.js cache/revalidation behavior.

[ ] Verify that a successfully inserted expense is immediately visible after creation.

---

### 6. Fix Local Persistence

[ ] Implement the minimal required fix.

[ ] Ensure successful expense creation results in a persisted database record.

[ ] Ensure failed database operations return an appropriate error state.

[ ] Ensure the user receives meaningful feedback when creation fails.

[ ] Ensure the newly created expense appears on My Expenses.

[ ] Ensure the record appears in Prisma/database inspection.

---

### 7. Verify Local Environment

[ ] Restart the development server after configuration changes.

[ ] Run Prisma generation if required.

[ ] Run required Prisma migrations if required.

[ ] Verify local database connectivity.

[ ] Create multiple test expenses.

[ ] Verify persistence after page refresh.

[ ] Verify persistence after restarting the development server.

---

### 8. Verify Production Database Configuration

[ ] Inspect Vercel environment variables.

[ ] Verify production `DATABASE_URL`.

[ ] Verify production `DIRECT_URL` if applicable.

[ ] Verify the production database provider.

[ ] Verify that production Prisma schema/migrations are synchronized.

[ ] Verify that the deployed application is connected to the intended production database.

[ ] Verify that creating an expense on production persists the record.

[ ] Verify that the persisted production expense appears on the production My Expenses page.

---

### 9. Verify Prisma / Database Consistency

[ ] Verify Prisma Client is generated from the current schema.

[ ] Verify database migrations are applied correctly.

[ ] Verify no schema drift exists.

[ ] Verify local Prisma Studio shows the expected data.

[ ] Verify production database inspection shows the expected data.

[ ] Verify no accidental connection to an old/incorrect database exists.

---

### 10. Regression Testing

[ ] Create an INR expense.

[ ] Create a non-INR expense.

[ ] Verify expense title persistence.

[ ] Verify amount persistence.

[ ] Verify currency persistence.

[ ] Verify category persistence.

[ ] Verify expense date persistence.

[ ] Verify receipt-related fields if applicable.

[ ] Verify approval status initialization.

[ ] Verify reimbursement status initialization.

[ ] Verify expense appears on My Expenses.

[ ] Verify expense appears in Analytics.

[ ] Verify expense appears in Reports.

[ ] Verify existing expenses remain unaffected.

[ ] Verify editing an expense still works.

[ ] Verify deleting an expense still works.

---

## Acceptance Criteria

[ ] A newly created expense is actually persisted in the database.

[ ] The newly created expense appears on the My Expenses page.

[ ] The database record contains the expected submitted values.

[ ] Localhost and database inspection show consistent data.

[ ] Production/Vercel and the production database show consistent data.

[ ] Prisma is connected to the intended database in each environment.

[ ] Database schema and Prisma schema are synchronized.

[ ] Failed database operations are no longer silently presented as successful.

[ ] Existing expense functionality continues to work.

[ ] No unrelated functionality is changed.

---

## Files / Areas Expected To Be Inspected

The following areas should be inspected before implementing the fix:

- Expense creation form/component
- Expense server actions
- Expense Prisma/database functions
- Prisma schema
- Prisma client configuration
- Expense retrieval functions
- My Expenses page/components
- Authentication/session handling
- Database environment configuration
- Prisma migrations
- Next.js cache/revalidation logic
- Vercel production environment configuration

---

## Completion Notes

Document the root cause here after investigation.

### Root Cause

[ ] To be determined

### Fix Implemented

[ ] To be documented

### Verification

[ ] Localhost verified

[ ] Local database verified

[ ] Production application verified

[ ] Production database verified

### Regression Testing

[ ] Completed
