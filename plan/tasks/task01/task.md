# Task 01 — Multi-currency Support

Status: IN PROGRESS

## Completed Tasks

- Task 01.1 — Define currency and exchange-rate data model
- Task 01.2 — Add currency selection to expense creation/editing
- Task 01.3.1 — Server-side Exchange Rate Utility
- Task 01.3.2 — Persist Exchange-Rate Conversion Data
- Task 01.4 — Implement server-side currency conversion

## Objective

Add multi-currency expense support with live exchange-rate conversion to the application's base currency.

## Scope

- Allow users to select an expense currency.
- Store the original expense currency and amount.
- Integrate a live exchange-rate API.
- Convert the expense amount to the application's base currency.
- Preserve the original amount and currency for historical accuracy.
- Display currency information consistently across expense views.
- Ensure existing INR expenses continue working correctly.
- Validate currency and conversion data server-side.
- Use normalized base-currency values for cross-currency aggregation where appropriate.
- Allow Analytics/Reports to operate on the original transaction currency without incorrectly converting unrelated currencies into the selected currency.

## Implementation Tasks

- [x] Task 01.1 — Define currency and exchange-rate data model
- [x] Task 01.2 — Add currency selection to expense creation/editing
- [x] Task 01.3.1 — Implement server-side exchange-rate utility
- [x] Task 01.3.2 — Persist exchange-rate conversion data
- [x] Task 01.4 — Implement server-side currency conversion
- [ ] Task 01.5 — Update expense retrieval/types
- [ ] Task 01.6 — Update expense and reimbursement UI
- [ ] Task 01.7 — Test existing INR workflow and new multi-currency workflow
- [ ] Task 01.8 — Review implementation and run TypeScript/build checks
- [ ] Task 01.9 — Commit feature branch and merge into main

> Note:
>
> Tasks 01.3.1 and 01.3.2 were completed as part of the implementation work originally grouped under Task 01.3. The remaining tasks are retained as separate review/integration stages because they cover broader application-wide behavior.

---

## Review Checklist

### Data Preservation

- [x] Original amount is preserved.
- [x] Original currency is preserved.
- [x] Converted base-currency amount is stored.
- [x] Exchange-rate source/result is recorded where required.
- [x] Exchange-rate timestamp is recorded.
- [x] Existing expenses remain compatible.
- [x] Existing INR expenses continue to work.

### Server-side Validation and Conversion

- [x] Currency is normalized server-side.
- [x] Currency validation is performed through the expense schema.
- [x] Invalid/unsupported currencies are rejected.
- [x] Exchange-rate API failures are handled safely.
- [x] Invalid exchange-rate responses are rejected.
- [x] Same-currency conversion is handled with a rate of `1`.
- [x] Financial conversion does not rely on client-supplied exchange-rate data.
- [x] Base-currency conversion is performed server-side.

### Serialization / Data Transfer

- [x] Prisma Decimal values are converted to numbers where data crosses into Client Components.
- [x] Resolved Server Component → Client Component Decimal serialization errors.
- [x] Expense retrieval returns currency-related values in a Client Component-safe form where implemented.
- [ ] Complete Analytics/Reports retrieval/type audit for all required currency fields.

### Expense Creation and Editing

- [x] Currency selection is available during expense creation.
- [x] Currency selection is available during expense editing.
- [x] Existing expense currency is loaded when editing.
- [x] Currency defaults to INR.
- [x] Currency is passed through the create expense server action.
- [x] Currency is passed through the update expense server action.
- [x] Currency is persisted through the expense data layer.
- [x] Exchange-rate data is recalculated when an expense is edited.
- [x] Base-currency amount is recalculated when an expense is edited.

### Expense Display

- [x] Expense cards can display the original selected currency.
- [x] Dashboard recent expenses retain their original transaction currency.
- [ ] Remove remaining hard-coded INR display from applicable expense/reimbursement views.
- [ ] Update reimbursement UI to display the original expense currency consistently.
- [ ] Complete currency-aware display across Analytics and Reports.

### Dashboard

- [x] Dashboard does not use a currency filter.
- [x] Dashboard total expenses use normalized `baseCurrencyAmount`.
- [x] Dashboard monthly expenses use normalized `baseCurrencyAmount`.
- [x] Dashboard recent expenses retain their original transaction amount.
- [x] Dashboard recent expenses retain their original transaction currency.
- [x] Fixed cross-currency aggregation that incorrectly summed original transaction amounts.
- [ ] Final dashboard regression test after all currency-related changes are complete.

### Analytics and Reports

- [ ] Add currency filter to Analytics/Reports.
- [ ] Support `DEFAULT` mode showing expenses across all currencies.
- [ ] Support selecting INR.
- [ ] Support selecting USD.
- [ ] Support selecting EUR.
- [ ] Support selecting GBP.
- [ ] When a specific currency is selected, include only expenses originally recorded in that currency.
- [ ] Do not convert INR expenses into USD/EUR/GBP merely because the user selected that display currency.
- [ ] Ensure Analytics charts use only the expenses matching the selected currency scope.
- [ ] Ensure category totals respect the selected currency scope.
- [ ] Ensure monthly trends respect the selected currency scope.
- [ ] Ensure yearly trends respect the selected currency scope.
- [ ] Ensure report totals respect the selected currency scope.
- [ ] Ensure averages respect the selected currency scope.
- [ ] Ensure highest/lowest expense calculations respect the selected currency scope.
- [ ] Ensure largest-expense reports display the original transaction currency.
- [ ] Ensure top-category calculations respect the selected currency scope.
- [ ] Ensure report summaries display the correct currency symbol.
- [ ] Ensure charts and tooltips display the appropriate currency symbol.

### Supported Currencies

Current supported currencies are centralized in:

`src/constants/currencies.ts`

Currently supported:

- [x] INR — Indian Rupee — `₹`
- [x] USD — US Dollar — `$`
- [x] EUR — Euro — `€`
- [x] GBP — British Pound — `£`

Default currency:

- [x] INR

> The application currently supports four currencies. Additional currencies should only be added deliberately to the centralized currency configuration rather than being introduced independently in individual components.

---

# Task 01.1 — Define Currency and Exchange-Rate Data Model

**Status: COMPLETED**

- [x] Added `currency` field to `Expense` with `INR` as the default.
- [x] Added `baseCurrencyAmount` field for the converted base-currency value.
- [x] Added `exchangeRate` field to preserve the rate used for conversion.
- [x] Added `exchangeRateAt` field to record when the exchange rate was obtained.
- [x] Existing `amount` field remains unchanged and represents the original entered amount.
- [x] Existing expense records remain compatible because new conversion fields are nullable and currency defaults to `INR`.
- [x] Prisma schema formatting passes.
- [x] Prisma schema validation passes.
- [x] Prisma migration generated successfully.
- [x] Generated migration only adds the intended multi-currency fields.
- [x] No existing expense data is deleted or modified by the migration.

---

# Task 01.2 — Add Currency Selection to Expense Creation/Editing

**Status: COMPLETED**

- [x] Added currency validation to the expense schema.
- [x] Centralized supported currencies in `src/constants/currencies.ts`.
- [x] Added currency selection to the expense creation UI.
- [x] Added currency selection to the expense editing UI.
- [x] Existing expense currency is loaded when editing.
- [x] Currency resets to the default currency when the form is reset.
- [x] Currency is passed through the create expense server action.
- [x] Currency is passed through the update expense server action.
- [x] Currency is persisted through the expense data layer.
- [x] Exchange-rate information is obtained server-side rather than trusted from the client.
- [x] `npx tsc --noEmit` passed during implementation.
- [ ] `npm run lint` passes.

### Lint Review

`npm run lint` currently reports project-wide errors and warnings, including existing React Compiler/purity and `react-hooks/set-state-in-effect` issues in `AddExpenseForm.tsx`, `ProfileImageEditor.tsx`, and `ExpensesPageClient.tsx`, as well as unrelated issues in other files.

No reported lint error is specific to the newly added currency functionality.

---

# Task 01.3.1 — Server-side Exchange Rate Utility

**Status: COMPLETED**

Implemented:

- Created `src/features/expenses/lib/exchange-rates.ts`.
- Added server-side Frankfurter exchange-rate lookup.
- Added same-currency handling with a rate of `1`.
- Added currency normalization.
- Added API-response validation.
- Added exchange-rate date handling.
- Added safe handling for invalid or failed API responses.

Review:

- [x] Server-side exchange-rate lookup implemented.
- [x] Same-currency conversion handled.
- [x] Invalid API responses rejected.
- [x] Exchange-rate date captured.
- [x] No client-side financial conversion.
- [x] `npx tsc --noEmit` passes.
- [x] Production build passed during implementation.

---

# Task 01.3.2 — Persist Exchange-Rate Conversion Data

**Status: COMPLETED**

## Completed

- [x] Added server-side exchange-rate lookup to expense creation.
- [x] Added base-currency conversion during expense creation.
- [x] Added server-side exchange-rate recalculation during expense editing.
- [x] Persisted:
  - `currency`
  - `baseCurrencyAmount`
  - `exchangeRate`
  - `exchangeRateAt`
- [x] Preserved the original expense amount.
- [x] Preserved the original selected currency.
- [x] Added server-side validation before accessing validated form data.
- [x] Resolved the `result.data` possibly being undefined TypeScript issue.
- [x] Resolved invalid currency input handling.
- [x] Reviewed unsupported currency handling.
- [x] Reviewed exchange-rate API failure handling.
- [x] Confirmed financial conversion does not rely on client-supplied exchange-rate data.
- [x] Resolved Prisma Decimal serialization issues when expense data is passed from Server Components to Client Components.
- [x] Verified `npx tsc --noEmit`.
- [x] Verified production build.
- [x] Relevant tests passed.

## Review Checklist

- [x] Original amount is preserved.
- [x] Original currency is preserved.
- [x] Converted base-currency amount is calculated correctly.
- [x] Exchange-rate timestamp is recorded.
- [x] Existing expenses remain compatible.
- [x] Invalid/unsupported currencies are rejected.
- [x] API failures are handled safely.
- [x] No client-side trust is used for financial conversion.
- [x] `npx tsc --noEmit` passes.
- [x] Production build passes.
- [x] Tests pass.

---

# Task 01.4 — Implement Server-side Currency Conversion

\*\*Status: COMPLETED

The core server-side conversion implementation was completed during Task 01.3.2.

Completed:

- [x] Retrieve exchange rate server-side.
- [x] Calculate normalized base-currency amount server-side.
- [x] Persist normalized amount.
- [x] Persist exchange rate.
- [x] Persist exchange-rate timestamp.
- [x] Recalculate conversion when editing an expense.

Remaining:

- [ ] Perform final review of all server-side conversion call sites.
- [ ] Confirm every applicable expense mutation path uses the same conversion rules.
- [ ] Confirm all aggregation/reporting paths use the correct original or normalized value according to their requirements.

---

# Task 01.5 — Update Expense Retrieval/Types

**Status: IN PROGRESS**

Completed:

- [x] Expense retrieval includes currency information.
- [x] Expense amount is serialized from Prisma Decimal to `number` where required.
- [x] Base-currency amount is serialized where required.
- [x] Exchange-rate values are serialized where required.
- [x] Dashboard retrieval exposes original currency and normalized base-currency values.
- [x] Analytics expense type now exposes currency-related conversion fields.

Remaining:

- [ ] Complete Analytics data retrieval/type audit.
- [ ] Complete Reports data consumer audit.
- [ ] Ensure reimbursement/history retrieval exposes required currency information.

---

# Task 01.6 — Update Expense and Reimbursement UI

**Status: PARTIALLY COMPLETED / IN PROGRESS**

Completed:

- [x] Currency selector added to expense creation.
- [x] Currency selector added to expense editing.
- [x] Expense card can display selected currency.
- [x] Dashboard recent expense display can show original transaction currency.

Remaining:

- [ ] Remove hard-coded INR symbols from remaining expense UI.
- [ ] Update reimbursement tables/history to display the original transaction currency.
- [ ] Update approval UI to display the original transaction currency.
- [ ] Update Analytics summary displays.
- [ ] Update Analytics charts and tooltips.
- [ ] Update Reports summary displays.
- [ ] Update Reports expense lists.
- [ ] Ensure currency symbols are sourced from the centralized currency configuration.

---

# Task 01.7 — Test Existing INR Workflow and New Multi-Currency Workflow

**Status: PARTIALLY COMPLETED / IN PROGRESS**

Completed:

- [x] Tested existing INR expense creation.
- [x] Tested multi-currency expense creation.
- [x] Tested multi-currency expense editing.
- [x] TypeScript checks passed during implementation.
- [x] Production build passed during implementation.
- [x] Tests passed during implementation.
- [x] Identified and fixed incorrect dashboard aggregation caused by summing original amounts across currencies.
- [x] Dashboard aggregation now uses `baseCurrencyAmount`.

Remaining:

- [ ] Test Analytics currency filtering.
- [ ] Test Reports currency filtering.
- [ ] Test Default/all-currency Analytics mode.
- [ ] Test INR-only Analytics mode.
- [ ] Test USD-only Analytics mode.
- [ ] Test EUR-only Analytics mode.
- [ ] Test GBP-only Analytics mode.
- [ ] Verify unrelated currencies are not converted into the selected Analytics currency.
- [ ] Verify charts and reports calculate only from the selected currency set.
- [ ] Verify original currency symbols are displayed correctly.
- [ ] Perform final regression testing for existing INR expenses.

---

# Task 01.8 — Review Implementation and Run TypeScript/Build Checks

**Status: IN PROGRESS**

Completed during implementation:

- [x] `npx tsc --noEmit` passed.
- [x] Production build passed.
- [x] Tests passed.
- [x] Resolved Prisma Decimal serialization errors.
- [x] Resolved invalid `result.data` access before validation.
- [x] Reviewed exchange-rate validation.
- [x] Reviewed existing INR compatibility.

Remaining:

- [ ] Complete Analytics/Reports implementation.
- [ ] Run final `npx tsc --noEmit`.
- [ ] Run final production build.
- [ ] Run final test suite.
- [ ] Review final diff for unintended changes.
- [ ] Review all remaining hard-coded INR display values.
- [ ] Confirm no Prisma Decimal values cross into Client Components.
- [ ] Confirm no client-side exchange-rate manipulation is trusted.

---

# Task 01.9 — Commit Feature Branch and Merge into Main

**Status: NOT STARTED**

- [ ] Complete Analytics/Reports currency implementation.
- [ ] Complete reimbursement/approval currency display updates.
- [ ] Complete final tests.
- [ ] Complete final TypeScript check.
- [ ] Complete final production build.
- [ ] Update this `task01/task.md` with final completion status.
- [ ] Review `git diff`.
- [ ] Commit the completed Task 01 implementation.
- [ ] Merge feature branch into `main`.
