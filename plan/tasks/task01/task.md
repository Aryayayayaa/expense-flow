# Task 01 — Multi-currency Support

Status: IN PROGRESS

Completed:

- Task 01.1 — Define currency and exchange-rate data model
- Task 01.2 — Add currency selection to expense creation/editing

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

## Implementation Tasks

- [x] Task 01.1 — Define currency and exchange-rate data model
- [x] Task 01.2 — Add currency selection to expense creation/editing
- [ ] Task 01.3 — Integrate live exchange-rate API
- [ ] Task 01.4 — Implement server-side currency conversion
- [ ] Task 01.5 — Update expense retrieval/types
- [ ] Task 01.6 — Update expense and reimbursement UI
- [ ] Task 01.7 — Test existing INR workflow and new multi-currency workflow
- [ ] Task 01.8 — Review implementation and run TypeScript/build checks
- [ ] Task 01.9 — Commit feature branch and merge into main

## Review Checklist

- [ ] Original amount is preserved.
- [ ] Original currency is preserved.
- [ ] Converted base-currency amount is calculated correctly.
- [ ] Exchange-rate source is recorded where required.
- [ ] Existing expenses remain compatible.
- [ ] Invalid/unsupported currencies are rejected.
- [ ] API failures are handled safely.
- [ ] No client-side trust is used for financial conversion.
- [ ] `npx tsc --noEmit` passes.
- [ ] Production build passes.

### Task 01.1 Review

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

- [x] Added currency validation to the expense schema.
- [x] Centralized supported currencies in `src/constants/currencies.ts`.
- [x] Added currency selection to the expense creation/editing UI.
- [x] Existing expense currency is loaded when editing.
- [x] Currency resets to the default currency when the form is reset.
- [x] Currency is passed through the create expense server action.
- [x] Currency is passed through the update expense server action.
- [x] Currency is persisted through the expense data layer.
- [x] `npx tsc --noEmit` passes.
- [ ] `npm run lint` passes.

Lint review:

`npm run lint` currently reports project-wide errors and warnings, including existing React Compiler/purity and `react-hooks/set-state-in-effect` issues in `AddExpenseForm.tsx`, `ProfileImageEditor.tsx`, and `ExpensesPageClient.tsx`, as well as unrelated issues in other files. No reported lint error is specific to the newly added currency functionality.

## Completion

Status: IN PROGRESS
