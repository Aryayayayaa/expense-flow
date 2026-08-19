# Task 04 — Icons Client Interactive

Status: NOT STARTED

## Objective

Make the non-functional icons in the application's top-right horizontal header client interactive and ensure each icon performs the appropriate navigation or existing interactive behavior.

The affected controls are the icons displayed in the top-right application header:

- Notification bell
- Help / question-mark icon
- User profile / avatar icon

The notification bell is already interactive and displays notifications. Its existing behavior must be preserved.

The question-mark icon and profile/avatar icon must be connected to their respective destinations.

---

## Scope

### 04.1 — Review Existing Header Icon Implementation

Identify the shared dashboard/header component responsible for rendering:

- Notification bell
- Help/question-mark icon
- User profile/avatar icon

Confirm which icons are already client interactive and which require navigation.

Do not unnecessarily rewrite the existing notification functionality.

Status: COMPLETED

---

### 04.2 — Make Help / Question-Mark Icon Interactive

Make the question-mark icon a client-side navigation control.

The icon should lead to a dedicated application information/help page within the dashboard route structure.

The destination should provide useful information such as:

- What ExpenseFlow is.
- What the application is used for.
- Basic guidance on submitting and managing expenses.
- Explanation of expense approval and reimbursement workflows.
- How users can navigate the application.
- A Contact Us / About Us section where appropriate.

The page should follow the application's existing layout and visual design.

The question-mark icon must have an accessible label/title describing its purpose.

Status: COMPLETED

---

### 04.3 — Make Profile Icon Interactive

Make the user profile/avatar icon a client-side navigation control.

Clicking the profile/avatar must navigate the authenticated user to:

`/profile`

The existing avatar appearance should be preserved.

The control must have an accessible label/title such as:

`Profile`

Status: STARTING NEXT

---

### 04.4 — Preserve Notification Bell Interaction

Verify that the existing notification bell remains fully functional.

The following existing behavior must not regress:

- Notification icon remains clickable.
- Existing notification panel/dropdown continues to work.
- Existing unread notification indicator remains functional.
- Existing notification navigation/actions continue to work.

No unnecessary changes should be made to the notification implementation.

Status: NOT STARTED

---

### 04.5 — Header Navigation and Accessibility Review

Review all three header icons together.

Verify:

- [ ] Bell remains interactive.
- [ ] Question-mark icon navigates to the Help/About page.
- [ ] Profile/avatar navigates to `/profile`.
- [ ] All header controls have accessible labels.
- [ ] Keyboard interaction works.
- [ ] Hover/focus states are visually clear.
- [ ] Navigation does not require JavaScript unnecessarily when a normal Next.js link is sufficient.
- [ ] Existing header styling remains consistent.
- [ ] Light and dark themes remain visually compatible.

Status: NOT STARTED

---

### 04.6 — Testing

Test the header interactions for:

- Employee accounts.
- HR accounts.
- Admin accounts.

Test:

- [ ] Notification bell.
- [ ] Help/question-mark navigation.
- [ ] Profile navigation.
- [ ] Keyboard accessibility.
- [ ] Light theme.
- [ ] Dark theme.
- [ ] Direct navigation to the Help/About page.
- [ ] Direct navigation to `/profile`.
- [ ] No regression in existing notification behavior.

Run:

```bash
npx tsc --noEmit
```
