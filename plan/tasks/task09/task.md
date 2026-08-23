# Task 09 — Notification Navigation

## Branch

`feature/notification-navigation`

## Objective

Improve the notification experience by ensuring that notification items correctly navigate users to the relevant page or resource when clicked.

The existing notification behavior, styling, unread/read state, and notification data must remain intact unless explicitly required for navigation.

---

## 09.1 — Review Existing Notification Implementation

#### STATUS: COMPLETED

- [x] Identify the existing notification component(s)
- [x] Identify where notification data is fetched/generated
- [x] Identify the existing notification types/categories
- [x] Identify whether notifications already contain a destination/path/reference
- [x] Identify the current click behavior of notification items
- [x] Identify all pages/resources that notifications are expxcted to navigate to
- [x] Confirm whether any notification currently has missing or incorrect navigation behavior

### Localhost Test — Existing Notification Behavior

- [x] Open the application on localhost
- [x] Log in with a user account that has notifications
- [x] Open the notification UI
- [x] Verify existing notifications are displayed correctly
- [x] Verify unread/read state still works
- [x] Verify notification content is unchanged
- [x] Verify no existing notification behavior is broken

---

## 09.2 — Define Notification Navigation Rules

### STATUS: COMPLETE

- [x] Define the destination for each existing notification type
- [x] Ensure expense-related notifications navigate to the appropriate expense page
- [x] Ensure approval-related notifications navigate to the appropriate approval/resource page
- [x] Ensure reimbursement-related notifications navigate to the appropriate reimbursement/resource page
- [x] Ensure role-related notifications navigate to the appropriate role-verification/resource page where applicable
- [x] Ensure notifications without a valid destination remain non-navigational
- [x] Ensure invalid or missing notification references do not cause application errors
- [x] Preserve role-based access restrictions when determining destinations

Notification Available data Likely destination
EXPENSE_SUBMITTED expenseId /approvals
EXPENSE_APPROVED expenseId /expenses
EXPENSE_REJECTED expenseId /expenses
EXPENSE_MODIFIED expenseId /expenses
EXPENSE_REIMBURSED expenseId /expenses
REIMBURSEMENT_REJECTED expenseId /expenses
EMPLOYEE_VERIFICATION_PENDING requestId, employeeId /hr
EMPLOYEE_VERIFICATION_APPROVED requestId /profile
EMPLOYEE_VERIFICATION_REJECTED requestId /profile
ROLE_VERIFICATION_PENDING requestId, employeeId /role-verification
ROLE_VERIFICATION_APPROVED requestId /profile
ROLE_VERIFICATION_REJECTED requestId /profile
EMPLOYEE_ACCOUNT_CREATED employeeId /admin or /hr
EMPLOYEE_ACCOUNT_DEACTIVATED employeeId /admin or /hr
EMPLOYEE_ACCOUNT_ACTIVATED employeeId /admin or /hr
EMPLOYEE_ACCOUNT_UPDATED requestId / employeeId / action depends on action
ROLE_UPGRADED requestId /profile
ROLE_DOWNGRADED unknown from supplied output needs inspection
ROLE_CHANGED unknown from supplied output needs inspection
ADMIN_ACTION unknown needs inspection
SYSTEM unknown needs inspection

---

## 09.3 — Implement Notification Navigation

### STATUS: COMPLETED

- [x] Make applicable notification items clickable
- [x] Navigate to the correct destination when a notification is clicked
- [x] Preserve existing notification styling
- [x] Preserve existing notification content
- [x] Preserve existing unread/read behavior
- [x] Ensure navigation uses the application's existing routing approach
- [x] Avoid unnecessary full-page reloads where client-side navigation is appropriate
- [x] Ensure clicking a notification does not navigate to an unauthorized page
- [x] Ensure invalid/missing notification references are handled safely

---

## 09.4 — Notification State After Navigation

### STATUS: COMPLETED

- [x] Verify notification read/unread state behaves correctly after navigation
- [x] Ensure clicking a notification does not incorrectly mark unrelated notifications as read
- [x] Ensure the notification count/badge remains consistent
- [x] Ensure the notification dropdown/popover closes appropriately after navigation
- [x] Ensure returning to the application does not create duplicate notifications
- [x] Ensure notification state remains consistent after page navigation

---

## 09.5 — Role-Based Notification Navigation

### STATUS: COMPLETED

- [x] Test notification navigation as an EMPLOYEE
- [x] Test notification navigation as an HR user
- [x] Test notification navigation as an ADMIN user
- [x] Verify each role only navigates to pages/resources it is authorized to access
- [x] Verify restricted notification destinations are handled safely
- [x] Verify no unauthorized data is exposed through notification navigation

---

## 09.6 — Edge Cases and Error Handling

### STATUS: COMPLETED

- [x] Handle notifications referencing deleted expenses/resources
- [x] Handle notifications referencing unavailable resources
- [x] Handle notifications with missing destination information
- [x] Handle notifications with invalid resource IDs
- [x] Verify navigation does not crash when the target resource no longer exists
- [x] Verify an appropriate fallback behavior is shown when navigation is unavailable
- [x] Verify no console errors occur during notification interaction

---

## Localhost Test — Notification Navigation

After completing the implementation:

- [x] Open the application on localhost
- [x] Log in as an EMPLOYEE
- [x] Open the notification panel
- [x] Click each applicable notification
- [x] Verify each notification navigates to the correct page/resource
- [x] Verify unread/read state behaves correctly
- [x] Verify notification count/badge behaves correctly
- [x] Return to the notification panel
- [x] Verify notification state remains correct

### ADMIN Test

- [x] Log in as an ADMIN
- [x] Open the notification panel
- [x] Test all applicable notification types
- [x] Verify each destination is correct
- [x] Verify role-restricted destinations work correctly
- [x] Verify no unauthorized navigation occurs

### HR Test

- [x] Log in as an HR user
- [x] Open the notification panel
- [x] Test all applicable notification types
- [x] Verify each destination is correct
- [x] Verify role-restricted destinations work correctly
- [x] Verify no unauthorized navigation occurs

### Edge-Case Test

- [x] Test a notification whose referenced resource no longer exists
- [x] Test a notification with missing/invalid destination data
- [x] Verify the application does not crash
- [x] Verify an appropriate fallback behavior occurs
- [x] Verify there are no unexpected console errors

---

## TypeScript / Build Verification

- [x] Run `npx tsc --noEmit`
- [x] Verify there are no TypeScript errors
- [x] Run the application locally
- [x] Verify there are no runtime errors related to notifications
- [x] Verify notification navigation works after a fresh application start

---

## Completion Criteria

- [x] All applicable notification types navigate to their correct destination
- [x] Existing notification UI and behavior remain intact
- [x] Read/unread state remains correct
- [x] Notification count/badge remains correct
- [x] Role-based access remains enforced
- [x] Invalid/deleted notification targets are handled safely
- [x] EMPLOYEE notification navigation tested successfully
- [x] HR notification navigation tested successfully
- [x] ADMIN notification navigation tested successfully
- [x] `npx tsc --noEmit` passes
- [x] Localhost testing passes
- [x] Changes committed to `feature/notification-navigation`
- [x] Changes pushed to GitLab
- [x] Changes pushed to GitHub
