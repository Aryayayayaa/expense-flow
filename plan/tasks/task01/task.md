# Task 01 — Multi-currency Support

Status: IN PROGRESS

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

- [ ] Task 01.1 — Define currency and exchange-rate data model
- [ ] Task 01.2 — Add currency selection to expense creation/editing
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

## Completion

Status: IN PROGRESS
