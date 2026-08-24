# Task 13 —

## Subtask 1: Redesign Expense Details UI

### Objective

Redesign the `/expenses/[id]` page to provide a clean, polished, and user-friendly view of a single expense.

This subtask is limited to the UI/UX redesign of the Expense Details page and should remain independent from the receipt-only workflow changes being implemented in the remaining Task 13 subtasks.

### Scope

#### 1. Expense Details Layout

##### STATUS: COMPLETED

Redesign the page with a clear visual hierarchy for:

- Expense title
- Amount
- Currency
- Category
- Expense date and time
- Expense status
- Reimbursement status, where applicable
- Created/updated information, where available

#### 2. Expense Status

##### STATUS: COMPLETED

Display the current expense status clearly.

Support the existing states where applicable:

- PENDING
- APPROVED
- REJECTED

Display relevant information such as:

- Reviewer
- Decision date
- Rejection reason

when the existing data is available.

#### 3. Reimbursement Information

If reimbursement information exists, display it in a dedicated and clearly identifiable section.

Show relevant existing information such as:

- Reimbursement status
- Reimbursed by
- Reimbursement date

Do not introduce new reimbursement functionality as part of this subtask.

#### 4. Receipt Section

##### STATUS: COMPLETED

Create a dedicated receipt area in the Expense Details page.

For the current UI redesign:

- Clearly indicate whether a receipt is attached.
- Provide access to view the existing receipt when available.
- Provide an appropriate empty state when no receipt is attached.
- Do not introduce a separate Bill Proof section.
- Follow the Task 13 requirement of having only one receipt per expense.

Receipt upload/edit behavior will be handled separately in the remaining Task 13 subtasks.

#### 5. Actions

##### STATUS: COMPLETED

Keep the existing supported expense actions available where appropriate.

The redesigned page should provide a clear location for actions such as:

- Edit Expense
- Back to Expenses

Do not introduce new expense actions unless required by the existing functionality.

#### 6. Responsive Design

##### STATUS: COMPLETED

The redesigned `/expenses/[id]` page should work properly across:

- Desktop
- Tablet
- Mobile

The layout should remain readable and usable without unnecessary horizontal scrolling.

#### 7. Visual Consistency

##### STATUS: COMPLETED

The redesigned page should follow the existing ExpenseFlow design language:

- Existing components where appropriate
- Existing typography
- Existing spacing conventions
- Existing buttons
- Existing status styling
- Existing cards/borders/shadows
- Existing Tailwind CSS approach

Avoid introducing an unrelated visual style.

### Out of Scope

The following are NOT part of this subtask:

- Changing OCR extraction logic
- Changing receipt upload processing
- Changing receipt immutability rules
- Removing Bill Proof from backend/database
- Changing expense creation logic
- Changing expense editing logic
- Changing expense approval/rejection logic
- Changing reimbursement logic
- Changing database schema

These will be handled in subsequent Task 13 subtasks.

### Acceptance Criteria

- [x] `/expenses/[id]` has a redesigned and polished UI.
- [x] Expense information has a clear visual hierarchy.
- [x] Expense status is clearly displayed.
- [x] Reimbursement information is displayed when available.
- [x] Receipt information has a dedicated section.
- [x] Existing receipt can be viewed/accessed where applicable.
- [x] No separate Bill Proof UI is introduced.
- [x] Appropriate empty states are displayed.
- [x] Existing supported actions remain functional.
- [x] Page is responsive on desktop, tablet, and mobile.
- [x] Existing ExpenseFlow styling/components are respected.
- [x] No unrelated backend or business-logic changes are introduced.
- [x] `npm run build` passes successfully.

### Verification

1. Open `/expenses/[id]` for an existing expense.
2. Verify the redesigned layout and information hierarchy.
3. Verify an expense with a receipt attached.
4. Verify an expense without a receipt.
5. Verify PENDING, APPROVED, and REJECTED states where test data is available.
6. Verify reimbursement information where applicable.
7. Verify the existing receipt-viewing functionality.
8. Verify the Edit Expense action.
9. Verify the Back to Expenses action.
10. Test the page at desktop, tablet, and mobile widths.
11. Run:

```bash
npm run build
```
