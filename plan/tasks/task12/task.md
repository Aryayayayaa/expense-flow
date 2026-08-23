# Task 12 — OCR Date, Time & Amount Handling

## Objective

Improve receipt OCR and expense creation/editing so that:

1. Receipt date is correctly extracted through OCR.
2. Receipt time is correctly extracted through OCR where available.
3. OCR-extracted date/time can be used when creating an expense.
4. Expenses can be created with the current date and time without being incorrectly rejected.
5. Failed expense creation displays a clear validation/error message.
6. After successful expense creation, all relevant form fields reset correctly.
7. OCR selects the final/total amount from a receipt when multiple amounts are present instead of incorrectly selecting the pre-tax amount.

---

## Problems to Fix

### 1. OCR Date and Time

Currently, uploading a receipt while creating or editing an expense does not correctly read the receipt's:

- Date
- Time

Investigate the existing OCR extraction flow and update it so date/time information is extracted when present.

---

### 2. Expense Date/Time Validation

Current issue:

Example:

- Current date: August 23
- Current time: 11:57 PM
- User attempts to create an expense for August 23 at 11:57 PM
- Expense creation is rejected without a visible explanation.

The validation logic must correctly handle:

- Current date
- Current time
- Expenses created at the current time
- Valid past expense dates/times

If an expense is rejected, the user must receive a clear error message explaining why.

---

### 3. Form Reset After Submission

Currently, when expense creation fails or behaves unexpectedly:

- Category resets
- Other fields remain populated.

Investigate the submit/action/form-state flow.

After a successful submission, all appropriate fields should reset consistently.

After a failed submission, entered values should normally remain available so the user can correct the problem.

---

### 4. OCR Amount Selection

Example receipt:

```text
Amount before tax: 76
Tax: 8
Total / Amount payable: 84
```
