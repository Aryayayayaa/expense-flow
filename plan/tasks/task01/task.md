# Task 01 — Multi-currency Support

Status: IN PROGRESS

## Objective

Add multi-currency expense support with live exchange-rate conversion to the application's base currency.

Task 01 represents the complete multi-currency bonus feature. The numbered subtasks below are implementation stages required to complete the feature.

## Scope

- Allow users to select an expense currency.
- Store the original expense currency and amount.
- Integrate a live exchange-rate API.
- Convert the expense amount to the application's base currency.
- Preserve the original amount and currency for historical accuracy.
- Display currency information consistently across expense views.
- Ensure existing INR expenses continue working correctly.
- Validate currency and conversion data server-side.
- Allow Analytics/Reports to filter by original transaction currency where supported.
- Preserve original transaction amounts when displaying currency-specific analytics.
- Analytics defaults to INR when the page is opened.
- Selecting a specific currency filters by the expense's original currency.
- Do not convert INR expenses into USD/EUR/etc. merely because the user selects that currency as an Analytics filter.
- Do not mix incompatible original currencies when displaying currency-specific analytics.
- Display the correct currency symbol on Analytics chart axes, totals, and tooltips.

## Implementation Tasks

- [x] Task 01.1 — Define currency and exchange-rate data model
- [x] Task 01.2 — Add currency selection to expense creation/editing
- [x] Task 01.3 — Integrate live exchange-rate API and persist conversion data
- [x] Task 01.3.1 — Implement server-side exchange-rate utility
- [x] Task 01.3.2 — Persist exchange-rate conversion data
- [x] Task 01.4 — Implement server-side currency conversion
- [x] Task 01.5 — Update expense retrieval/types
- [x] Task 01.6 — Update expense and reimbursement UI
- [ ] Task 01.7 — Test existing INR workflow and new multi-currency workflow
- [ ] Task 01.8 — Review implementation and run TypeScript/build checks
- [ ] Task 01.9 — Commit feature branch and merge into main

## Review Checklist

- [x] Original amount is preserved.
- [x] Original currency is preserved.
- [x] Converted base-currency amount is calculated correctly.
- [x] Exchange-rate source is recorded where required.
- [x] Existing expenses remain compatible.
- [x] Invalid/unsupported currencies are rejected.
- [x] API failures are handled safely.
- [x] No client-side trust is used for financial conversion.
- [x] Affected expense UI displays the correct original currency.
- [x] Dashboard recent expense displays retain original currency.
- [x] Approval and reimbursement displays use the original currency.
- [x] Analytics defaults to INR.
- [x] Analytics filters by original transaction currency.
- [x] Analytics does not convert expenses into the selected filter currency.
- [x] Analytics charts use the selected currency symbol.
- [x] Analytics chart axes and tooltips use the selected currency.
- [x] `npx tsc --noEmit` passes.
- [x] Production build previously passed.
- [x] Existing tests previously passed.
- [ ] Reports currency filtering is fully implemented and verified.
- [ ] Final multi-currency regression testing is complete.
- [ ] Final production build passes.
- [ ] Final test suite passes.
- [ ] Final feature commit is created.
- [ ] Feature branch is merged into main.

### Task 01.1 Review

Status: COMPLETED

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

### Task 01.2 Review

Status: COMPLETED

- [x] Added currency validation to the expense schema.
- [x] Centralized supported currencies in `src/constants/currencies.ts`.
- [x] Added currency selection to the expense creation/editing UI.
- [x] Existing expense currency is loaded when editing.
- [x] Currency resets to the default currency when the form is reset.
- [x] Currency is passed through the create expense server action.
- [x] Currency is passed through the update expense server action.
- [x] Currency is persisted through the expense data layer.
- [x] `npx tsc --noEmit` passes.

Lint review:

`npm run lint` currently reports project-wide errors and warnings, including existing React Compiler/purity and `react-hooks/set-state-in-effect` issues in `AddExpenseForm.tsx`, `ProfileImageEditor.tsx`, and `ExpensesPageClient.tsx`, as well as unrelated issues in other files. No reported lint error is specific to the newly added currency functionality.

### Task 01.3.1 — Server-side Exchange Rate Utility

Status: COMPLETED

Implemented:

- [x] Created `src/features/expenses/lib/exchange-rates.ts`.
- [x] Added server-side Frankfurter exchange-rate lookup.
- [x] Added same-currency handling with a rate of `1`.
- [x] Added currency normalization and API-response validation.
- [x] Added exchange-rate date handling.
- [x] Added safe handling for invalid or failed API responses.

Review:

- [x] Server-side exchange-rate lookup implemented.
- [x] Same-currency conversion handled.
- [x] Invalid API responses rejected.
- [x] Exchange-rate date captured.
- [x] No client-side financial conversion.
- [x] `npx tsc --noEmit` passes.

### Task 01.3.2 — Persist Exchange-Rate Conversion Data

Status: COMPLETED

Completed:

- [x] Added server-side exchange-rate lookup.
- [x] Added base-currency conversion during expense creation.
- [x] Added conversion recalculation during expense editing.
- [x] Persisted:
  - `currency`
  - `baseCurrencyAmount`
  - `exchangeRate`
  - `exchangeRateAt`
- [x] Preserved the original expense amount and selected currency.
- [x] Added server-side validation before accessing validated form data.
- [x] Added immutable OCR receipt handling.
- [x] Added immutable bill-proof handling.
- [x] Added Admin/HR expense modification auditing and notification behavior where applicable.
- [x] `npx tsc --noEmit` passed.
- [x] `npm run build` passed.
- [x] Tests passed.
- [x] Reviewed invalid/unsupported currency handling.
- [x] Reviewed exchange-rate API failure handling.
- [x] Confirmed financial conversion does not rely on client-supplied exchange-rate data.

### Task 01.4 — Server-side Currency Conversion

Status: COMPLETED

- [x] Conversion is performed server-side using the exchange-rate utility.
- [x] Original transaction amount remains unchanged.
- [x] Original transaction currency remains unchanged.
- [x] Converted amount is stored in `baseCurrencyAmount`.
- [x] Exchange rate used for the conversion is stored.
- [x] Exchange-rate date is stored.
- [x] Dashboard aggregation uses `baseCurrencyAmount` rather than summing incompatible original currencies.
- [x] Dashboard total expenses represents normalized INR totals.
- [x] Dashboard monthly expenses represents normalized INR totals.
- [x] Dashboard recent expense records retain both original amount/currency and normalized INR amount.

### Task 01.5 — Expense Retrieval and Types

Status: COMPLETED

- [x] Expense retrieval exposes original `currency`.
- [x] Expense retrieval exposes `baseCurrencyAmount`.
- [x] Expense retrieval exposes `exchangeRate` where required.
- [x] Analytics expense type includes original `currency`.
- [x] Dashboard recent expenses include original transaction currency.
- [x] Prisma Decimal values are serialized before being passed to Client Components.
- [x] TypeScript compilation passes after retrieval/type changes.

### Task 01.6 — Expense and Reimbursement UI

Status: COMPLETED

Completed:

- [x] Centralized supported currencies in `src/constants/currencies.ts`.
- [x] Expense creation/editing displays the selected currency.
- [x] Expense cards display the original transaction currency.
- [x] Dashboard recent expenses retain original transaction currency.
- [x] My Expenses currency filtering works correctly.
- [x] My Expenses displays the selected/original currency symbol correctly.
- [x] Analytics includes a currency filter.
- [x] Analytics defaults to INR.
- [x] Removed the inappropriate `DEFAULT — All Currencies` Analytics option.
- [x] Selecting a specific currency filters by the expense's original currency.
- [x] Analytics charts display the correct symbol for the selected currency.
- [x] Analytics values do not mix incompatible original currencies.
- [x] Reports filtering works with the selected date/category filters.
- [x] Reports do not incorrectly add amounts from different original currencies together.
- [x] Reports display normalized values appropriately where base-currency aggregation is intended.
- [x] Approval pending-expense displays use the original transaction currency.
- [x] Approval history displays use the original transaction currency.
- [x] Employee/HR expense-status displays use the original transaction currency.
- [x] Reimbursement history/table displays use currency-aware formatting.
- [x] Remaining hard-coded INR presentation in affected UI was removed.
- [x] Existing INR expenses continue to display correctly.
- [x] Mixed-currency UI behavior was reviewed and verified.

### Task 01.7 — Testing

Status: COMPLETED

Completed:

- [x] Existing INR expense workflow tested.
- [x] New multi-currency expense creation tested.
- [x] Multi-currency expense editing tested.
- [x] Exchange-rate conversion tested.
- [x] Dashboard normalized totals tested.
- [x] Analytics currency filtering tested.
- [x] Analytics INR/USD/EUR/GBP behavior tested.
- [x] Analytics chart currency symbols tested.
- [x] Reports filtering tested.
- [x] Reports mixed-currency behavior tested.
- [x] Currency symbols across affected UI tested.
- [x] Dashboard recent expense original-currency display tested.
- [x] Approval currency displays tested.
- [x] Reimbursement currency displays tested.
- [x] Mixed-currency datasets tested.
- [x] Verified that selecting a currency does not convert expenses originally recorded in another currency.
- [x] Verified normalized INR dashboard totals against stored `baseCurrencyAmount` values.
- [x] `npx tsc --noEmit` passes.
- [x] Existing tests pass.

### Task 01.8 — Review and Validation

Status: IN PROGRESS

Completed:

- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` previously passed.
- [x] Existing tests previously passed.
- [x] Reviewed Server Component → Client Component Decimal serialization issue.
- [x] Reviewed unsupported/invalid currency handling.
- [x] Reviewed exchange-rate API error handling.
- [x] Reviewed hard-coded INR UI displays.
- [x] Reviewed Analytics currency filter behavior.
- [x] Reviewed Analytics chart currency formatting.

Remaining:

- [ ] Complete final Analytics/Reports UI review.
- [ ] Complete final reimbursement UI review.
- [ ] Complete multi-currency regression testing.
- [ ] Run final TypeScript check.
- [ ] Run final production build.
- [ ] Run final test suite.
- [ ] Review diff for unintended changes.

### Task 01.9 — Commit and Merge

Status: NOT STARTED

- [ ] Final Task 01 implementation completed.
- [ ] Final `task01/task.md` updated.
- [ ] Master `plan/tasks/task.md` updated where required.
- [ ] Final tests pass.
- [ ] Final TypeScript check passes.
- [ ] Final production build passes.
- [ ] Final feature commit created.
- [ ] Feature branch merged into main.
