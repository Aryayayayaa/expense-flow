# Task 10 — Expense Scope & Reimbursement Management

## Objective

Enhance expense management for HR and Admin users by introducing clear expense-scope handling for reimbursement-related data and ensuring that reimbursement information is segregated according to the selected scope.

The reimbursement functionality currently does **not** have a separate reimbursement page. Instead, reimbursement options are available through:

- **People Management** → HR account
- **Administration** → Admin account

The implementation should therefore extend the existing expense-scope mechanism rather than introducing a separate reimbursement page.

---

## Subtask 1 — Reimbursement Expense Scope

### Goal

Add an expense-scope option specifically for **Reimbursements** so that the reimbursement data displayed to HR/Admin users is segregated according to the selected scope.

The reimbursement scope should follow the existing account-specific ownership/access model.

### Required Scope Options

#### Admin account

The reimbursement expense scope should support:

- **OWN** — Admin's own expenses
- **Employees** — Expenses belonging to employees
- **Other Admin/HRs** — Expenses belonging to other Admin/HR users
- **HRs and Admins** — Expenses belonging to HR and Admin users

#### HR account

The reimbursement expense scope should support:

- **OWN** — HR's own expenses, where applicable according to the existing expense-scope rules
- **Employees** — Expenses belonging to employees
- **Other Admin/HRs** — Expenses belonging to other Admin/HR users
- **HRs and Admins** — Expenses belonging to HR and Admin users

The exact data returned for each scope must remain consistent with the existing role and expense-visibility rules.

---

## Current Reimbursement Implementation

Reimbursement functionality currently exists through the following files:

- `src/features/expenses/components/ReimbursementTable.tsx`
- `src/features/expenses/components/ReimbursementHistoryTable.tsx`
- `src/features/expenses/actions/reimbursement-actions.ts`

The existing reimbursement workflow includes:

### Pending reimbursement processing

`ReimbursementTable.tsx` currently allows HR users to:

- Review approved expenses waiting for reimbursement
- View employee information
- View expense details
- View approval information
- Open the original receipt
- Open bill proof
- Enter a reimbursement rejection reason
- Reject reimbursement
- Mark an expense as reimbursed

### Reimbursement history

`ReimbursementHistoryTable.tsx` currently displays:

- Employee
- Expense
- Amount
- Expense status
- Reimbursement status
- Approved by
- Approved on
- Processed by
- Processed on
- Reimbursement rejection reason, when applicable

### Server actions

`reimbursement-actions.ts` currently provides:

- `reimburseExpenseAction()`
- `rejectReimbursementAction()`

The actions currently:

- Authenticate the user
- Require the `HR` role
- Validate that the expense exists
- Prevent processing an HR user's own expense
- Require the expense to be `APPROVED`
- Require reimbursement status to be `PENDING`
- Update reimbursement status
- Store reimbursement date and processor
- Store rejection reason when reimbursement is rejected
- Create an expense audit log
- Revalidate relevant application paths
- Create employee notifications
- Send reimbursement/rejection emails

---

## Existing Data Retrieval

The reimbursement-related data is currently retrieved through:

```ts
getApprovedExpensesForHR();
getReimbursementHistory();
```
