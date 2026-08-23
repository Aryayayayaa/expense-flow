# Task 10 — Profile Flow

Branch: `feature/profile-flow`

---

## 10.1 — Profile / Requests Separation & History

### STATUS: COMPLETED

- [x] Keep `/profile` limited to profile details and profile editing
- [x] Remove request components from `/profile`
- [x] Add `Requests` entry to desktop sidebar
- [x] Add `Requests` entry to mobile sidebar
- [x] Remove standalone `Role Verification` sidebar entry
- [x] Employee: show own name-change request history
- [x] Employee: show own role-verification request history
- [x] Employee: show own identity-verification request history
- [x] HR: show pending + history for name-change requests
- [x] HR: show pending + history for role-verification requests
- [x] HR: show pending + history for identity-verification requests
- [x] Admin: show pending + history for name-change requests
- [x] Admin: show pending + history for role-verification requests
- [x] Admin: show pending + history for identity-verification requests
- [x] Ensure employee history is restricted to the logged-in employee
- [x] Restore existing historical records after moving the UI
- [x] Verify role-aware visibility
- [x] Run lint
- [x] Run TypeScript check

---

## 10.2 — Refactor `/profile` Page

### STATUS: COMPLETED

- [x] Keep profile details on `/profile`
- [x] Keep profile editing functionality on `/profile`
- [x] Remove request workflow UI from `/profile`
- [x] Ensure profile editing still works
- [x] Ensure profile page remains role-aware where applicable
- [x] Verify Employee profile
- [x] Verify HR profile
- [x] Verify Admin profile
- [x] Remove Role Verification from Admin/HR sidebar + mobile sidebar
- [x] Employee sees own request history
- [x] Name-change history preserved
- [x] Role-verification history preserved
- [x] Identity-verification history preserved
- [x] HR/Admin see pending + history for each request type
- [x] Existing historical records remain visible after moving components

---

## 10.3 — Create Requests Navigation

### STATUS: COMPLETED

- [x] Add `Requests` to the desktop Sidebar
- [x] Add `Requests` to the MobileSidebar
- [x] Add the request options under Requests
- [x] Ensure navigation styling matches the existing dashboard navigation
- [x] Ensure selected request state is visually clear
- [x] Ensure desktop and mobile behavior remain consistent

---

## 10.4 — Create Requests Flow / Routing

### STATUS: IN PROGRESS

- [x] Establish the Requests entry point
- [x] Establish request selection/navigation
- [x] Render the selected request component
- [x] Support direct navigation to a request
- [x] Support browser refresh
- [x] Support browser back/forward navigation
- [x] Handle missing request selection
- [x] Handle invalid request selection
- [ ] Handle unavailable request selection for the current role
- [ ] Support notification navigation to the relevant request
- [ ] Support approved/rejected request notification navigation
- [x] Preserve the selected request after navigation

---

## 10.5 — Integrate Name Change Request

### STATUS: COMPLETED

- [x] Move/reuse the existing Name Change Request component
- [x] Render it through the Requests flow
- [x] Preserve existing submission behavior
- [x] Preserve existing validation
- [x] Preserve existing approval/rejection workflow
- [x] Preserve existing notifications
- [x] Verify request status handling
- [x] Verify Employee behavior
- [x] Verify HR/Admin behavior where applicable

---

## 10.6 — Integrate Role Verification Request

### STATUS: COMPLETED

- [x] Move/reuse the existing Role Verification Request component
- [x] Render it through the Requests flow
- [x] Preserve existing submission behavior
- [x] Preserve existing validation
- [x] Preserve existing approval/rejection workflow
- [x] Preserve existing notifications
- [x] Verify role-aware visibility
- [x] Verify authorization
- [x] Verify Employee behavior
- [x] Verify HR/Admin behavior where applicable

---

## 10.7 — Integrate Identity Verification

### STATUS: COMPLETED

- [x] Move/reuse the existing Identity Verification component
- [x] Render it through the Requests flow
- [x] Preserve existing submission behavior
- [x] Preserve existing validation
- [x] Preserve existing approval/rejection workflow
- [x] Preserve existing notifications
- [x] Verify role-aware visibility
- [x] Verify authorization
- [x] Verify Employee behavior
- [x] Verify HR/Admin behavior where applicable

---

## 10.8 — Role-Aware Request Permissions

### STATUS: COMPLETED

- [x] Verify Employee request options
- [x] Verify HR request options
- [x] Verify Admin request options
- [x] Ensure Admin has all rights available to HR
- [x] Ensure HR cannot access functionality outside HR/Admin permissions
- [x] Ensure Employee cannot access HR/Admin-only functionality
- [x] Verify direct URL authorization
- [x] Verify server-side authorization
- [x] Verify unavailable request options have appropriate fallback behavior

### Current Permission Requirement

- [x] Admin can approve/reject Name Change requests
- [x] Admin can approve/reject Role Verification requests
- [x] Admin can approve/reject Identity Verification requests
- [x] Ensure Admin request-review permissions match HR request-review permissions
- [x] Verify authorization inside the server actions, not only through UI visibility

---

## 10.9 — HR/Admin Self Request Workflows

### STATUS: COMPLETED

- [x] Allow HR users to submit Name Change requests
- [x] Allow Admin users to submit Name Change requests
- [x] Allow HR users to submit Identity Verification requests
- [x] Allow Admin users to submit Identity Verification requests
- [x] Allow HR users to submit Role Verification requests
- [x] Allow Admin users to submit Role Verification requests
- [x] Ensure request submitters cannot approve their own requests
- [x] Ensure request submitters cannot reject their own requests
- [x] Enforce self-review prevention server-side
- [x] Notify eligible HR/Admin reviewers when a request is submitted
- [x] Exclude the request submitter from reviewer notifications
- [x] Preserve existing role-specific review permissions
- [x] Preserve existing Employee request workflows
- [x] Verify request authorization through server actions

---

## 10.10 — Request Deadlines, Reminders & Auto-Rejection

### STATUS: NOT STARTED

- [ ] Define request deadline duration
- [ ] Add request deadline tracking
- [ ] Ensure deadline is assigned when a request is created
- [ ] Prevent invalid/missing deadlines
- [ ] Implement pending-request reminder logic
- [ ] Notify eligible reviewers about approaching deadlines
- [ ] Prevent unnecessary duplicate reminders
- [ ] Implement automatic rejection after deadline expiry
- [ ] Store auto-rejection reason
- [ ] Store automatic review timestamp
- [ ] Mark expired requests as rejected
- [ ] Notify the requester when a request is automatically rejected
- [ ] Notify eligible reviewers when a request is automatically rejected
- [ ] Ensure already-reviewed requests are not auto-rejected
- [ ] Ensure already-rejected requests are not reminded
- [ ] Ensure expired requests cannot be manually approved/rejected
- [ ] Ensure auto-rejection is idempotent
- [ ] Preserve request history after auto-rejection
- [ ] Verify Name Change deadline workflow
- [ ] Verify Role Verification deadline workflow
- [ ] Verify Identity Verification deadline workflow

---

## 10.11 — Notification Navigation

### STATUS: NOT STARTED

- [ ] Identify all Task 10 request-related notification types
- [ ] Define destination for pending request notifications
- [ ] Define destination for approved request notifications
- [ ] Define destination for rejected request notifications
- [ ] Navigate to the relevant Requests section when a notification is clicked
- [ ] Preserve the relevant request type in the destination URL
- [ ] Support Name Change notification navigation
- [ ] Support Role Verification notification navigation
- [ ] Support Identity Verification notification navigation
- [ ] Support HR/Admin review notification navigation
- [ ] Support Employee result notification navigation
- [ ] Handle notifications referencing already-reviewed requests
- [ ] Handle invalid/missing request IDs gracefully
- [ ] Verify notification navigation on desktop
- [ ] Verify notification navigation on mobile

---

## 10.12 — Request State and UX

### STATUS: IN PROGRESS

- [x] Display appropriate request state
- [x] Handle pending requests
- [x] Handle approved requests
- [x] Handle rejected requests
- [ ] Prevent invalid duplicate submissions where existing logic requires it
- [x] Provide appropriate empty states
- [ ] Provide appropriate error states
- [ ] Ensure no blank/broken UI occurs for invalid request selections

---

## 10.13 — Responsive Requests Navigation

### STATUS: COMPLETED

- [x] Verify Requests navigation on desktop
- [x] Verify Requests navigation on mobile
- [x] Verify dropdown/selection behavior
- [x] Verify selected-state styling
- [x] Verify navigation does not interfere with existing sidebar items
- [x] Verify mobile sidebar closes/behaves correctly after navigation

---

## 10.14 — Profile and Requests Integration Testing

### STATUS: COMPLETED

### Employee

- [x] Test `/profile`
- [x] Test profile editing
- [x] Test Requests navigation
- [x] Test Name Change Request
- [x] Test Role Verification
- [x] Test Identity Verification
- [x] Test invalid request URL
- [x] Test unauthorized request URL
- [x] Test page refresh
- [x] Test browser back/forward
- [x] Test mobile navigation

### HR

- [x] Test `/profile`
- [x] Test profile editing
- [x] Test applicable Requests
- [x] Test existing HR review workflows
- [x] Test authorization
- [x] Test invalid request URL
- [x] Test direct URL access
- [x] Test page refresh
- [x] Test mobile navigation

### Admin

- [x] Test `/profile`
- [x] Test profile editing
- [x] Test applicable Requests
- [x] Test all HR-level permissions
- [x] Test Admin-specific permissions
- [x] Test authorization
- [x] Test invalid request URL
- [x] Test direct URL access
- [x] Test page refresh
- [x] Test mobile navigation

---

## 10.15 — Quality Checks

### STATUS: IN PROGRESS

- [x] Run `npm run lint`
- [x] Resolve Task 10-related lint errors
- [x] Run `npx tsc --noEmit`
- [x] Resolve Task 10-related TypeScript errors
- [x] Run the application and perform final manual testing
- [x] Verify no unexpected console errors
- [x] Verify no broken navigation
- [x] Verify no authorization bypasses

---

## 10.16 — Final Task 10 Review

- [x] Review all changed files
- [x] Review role-aware behavior
- [x] Review profile/request separation
- [x] Review desktop/mobile navigation
- [x] Review request workflows
- [x] Review authorization
- [x] Review edge cases
- [x] Confirm all Task 10 subtasks are complete
- [x] Update `tasks.md` with final completion status
- [x] Commit Task 10 changes
