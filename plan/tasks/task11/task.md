# Task 11 — DELETE Method

## Objective

Ensure that deleting an expense uses the HTTP DELETE method instead of POST.

The expense deletion action must be represented as a DELETE request in the browser's Network tab while the corresponding expense deletion audit event must still be recorded in `ExpenseAuditLog`.

## Requirements

- Expense deletion must use HTTP DELETE.
- The browser Network tab must show the expense deletion request as `DELETE`.
- Expense deletion must continue to work correctly.
- `ExpenseAuditLog` must continue recording the deletion action.
- Recording an audit log must not change the HTTP method of the expense deletion request.
- Existing authorization and validation for expense deletion must remain intact.
- No unnecessary schema changes should be introduced.

## Implementation

- Identify the current expense deletion request/action.
- Replace the POST-based deletion request with DELETE where appropriate.
- Keep the existing database deletion behavior.
- Keep the existing `ExpenseAuditLog` creation.
- Verify that the audit event still records the deletion after changing the HTTP method.

## Verification

### Functional verification

1. Log in with an account authorized to delete an expense.
2. Open the relevant expense.
3. Delete the expense.
4. Confirm that the expense is deleted successfully.
5. Confirm that the corresponding audit log is still created.

### Browser Network verification

1. Open Chrome DevTools.
2. Open the **Network** tab.
3. Delete an expense.
4. Locate the request responsible for deleting the expense.
5. Confirm its HTTP method is:

   `DELETE`

6. Confirm it is not:

   `POST`

### Audit verification

Confirm that the corresponding deletion event is still present in `ExpenseAuditLog`.

## Completion Criteria

- [ ] Expense deletion uses HTTP DELETE.
- [ ] Expense deletion works successfully.
- [ ] Network tab shows DELETE.
- [ ] ExpenseAuditLog still records the deletion.
- [ ] Authorization behavior is unchanged.
- [ ] `npx tsc --noEmit` passes.
- [ ] Git working tree is clean after commit.
