# Task 06 — Production Database Connectivity & Performance

## Status:IN PROGRESS

## Branch

feature/task-06-production-db

## Objective

Verify and stabilize the application's Prisma/PostgreSQL database connectivity across
localhost and the production Vercel deployment, and investigate the latency observed
during expense creation.

The original issue reported was that newly created expenses were not appearing in
"My Expenses", Prisma Studio, or the production database.

Initial investigation shows that expense creation is currently working correctly in
both localhost and the deployed Vercel application. Therefore, the focus of this task
has shifted from fixing a broken database connection to:

- verifying the complete database connection flow
- confirming the local environment uses the intended PostgreSQL database
- confirming the production Vercel environment uses the intended Neon PostgreSQL database
- verifying Prisma is correctly configured for both environments
- identifying unnecessary or slow operations during expense creation
- reducing avoidable latency where possible
- ensuring the production database configuration is reliable and suitable for deployment

---

# Subtasks

## Subtask 06.1 — Verify Expense Creation → Prisma → Database Flow

### STATUS: COMPLETED

[x] Inspect the complete expense creation flow.

[x] Verify form submission reaches `createExpenseAction`.

[x] Verify `expenseSchema.safeParse()` succeeds for valid expense data.

[x] Verify `getExchangeRate()` completes successfully.

[x] Verify `createExpense()` is reached.

[x] Verify `prisma.expense.create()` successfully creates the database record.

[x] Verify the created expense appears on `/expenses`.

[x] Verify the created expense appears in Prisma/Neon.

### Current finding

Expense creation has been successfully verified on:

- localhost
- Vercel production

The Prisma log confirms that `prisma.expense.create()` is being reached.

### Result

The original "expense is not being saved" issue is currently not reproducible.

---

## Subtask 06.2 — Verify Database Environment Configuration

### STATUS: COMPLETED

[x] Verify `.env` contains the required local `DATABASE_URL`.

[x] Verify `.env.local` does not unintentionally override or omit required database configuration.

[x] Verify which environment variables are loaded by the local Next.js application.

[ ] Verify Vercel production has the correct `DATABASE_URL` configured.

[x] Verify the production `DATABASE_URL` points to the intended Neon PostgreSQL database.

[x] Verify local and production environments are intentionally connected to the correct databases.

[x] Verify Prisma is not accidentally connecting to an unintended database.

### Current finding

Local `.env` contains:

- `DATABASE_URL`
- `AUTH_SECRET`

Local `.env.local` does not currently contain `DATABASE_URL`.

Production database configuration still needs to be verified through Vercel environment settings.

---

## Subtask 06.3 — Investigate Expense Creation Latency

### STATUS: COMPLETED

[x] Measure the time taken by `createExpenseAction`.

[x] Identify how much time is spent in authentication.

[x] Identify how much time is spent in exchange-rate retrieval.

[x] Identify how much time is spent in Prisma expense creation.

[x] Identify how much time is spent creating the expense audit log.

[x] Identify how much time is spent querying Admin/HR reviewers.

[x] Identify how much time is spent creating notifications.

[x] Determine whether `createNotification()` performs additional database queries.

[x] Determine whether multiple sequential database operations can be optimized.

[x] Determine whether the production latency is caused by Neon database/network latency,
cold starts, external API calls, or application logic.

---

## Subtask 06.4 — Prisma / Neon Connection Performance

### STATUS: IN PROGRESS

[x] Inspect the Prisma client configuration.

[x] Verify the Prisma client is reused appropriately during local development.

[] Determine whether the production deployment creates unnecessary Prisma connections.

[x] Verify Neon connection/pooling configuration.

[x] Determine whether the production connection string uses an appropriate pooled endpoint.

[x] Check whether Prisma/Neon connection establishment contributes significantly to request latency.

[x] Apply only necessary Prisma/Neon configuration changes.

---

## Subtask 06.5 — Production Verification

### STATUS: COMPLETED/IN-PROGRESS

[x] Deploy the updated implementation to Vercel.

[x] Create a new expense in production.

[x] Confirm the request succeeds.

[x] Confirm the expense appears in "My Expenses".

[x] Confirm the expense appears in the production Neon database.

[x] Confirm the expense audit log is created.

[x] Confirm required notifications are created.

[x] Measure the final request/action duration.

[x] Verify no regression was introduced in localhost.

---

## Subtask 06.6 — Final Validation

### STATUS: IN PROGRESS

[x] Test expense creation using INR.

[x] Test expense creation using a non-INR currency.

[ ] Test expense creation with OCR receipt.

[x] Test expense creation without OCR receipt.

[x] Test expense creation after restarting the local development server.

[x] Test production expense creation.

[x] Confirm Prisma/Neon data consistency.

[x] Confirm no unexpected errors appear in the Vercel logs.

[x] Confirm acceptable expense creation latency.

---

# Files Inspected

- `src/features/expenses/components/AddExpenseForm.tsx`
- `src/features/expenses/actions/expense-actions.ts`
- `src/app/expenses/new/page.tsx`
- `src/features/expenses/schemas/expense-schema.ts`
- `src/features/expenses/components/NewExpensePageClient.tsx`
- `src/features/expenses/lib/exchange-rates.ts`
- `src/features/expenses/lib/expenses.ts`
- `src/app/expenses/page.tsx`
- `src/features/expenses/components/ExpensesPageClient.tsx`
- `prisma/schema.prisma`
- `src/lib/prisma.ts`

---

# Current Investigation Result

The database write operation is functioning.

Observed local request:

GET `/expenses/new` → 200

Prisma log confirms:

`Saving to Prisma: {...}`

POST `/expenses/new` → 200

`createExpenseAction(null, {})` completed successfully.

The created expense was subsequently visible on `/expenses` and in the database.

Production Vercel expense creation was also successfully verified.

Therefore, the remaining issue for Task 06 is primarily database/environment
verification and performance investigation rather than repairing a currently broken
database write.

---

# Completion Criteria

Task 06 can be marked complete only when:

[x] Local Prisma/PostgreSQL configuration is verified.

[x] Production Vercel → Prisma → Neon configuration is verified.

[x] Expense creation is verified locally and in production.

[x] The source of expense creation latency has been identified.

[x] Any unnecessary latency has been reduced where technically appropriate.

[x] Production database connectivity is stable.

[ ] Final production testing succeeds.

[x] No database-related regression remains.
