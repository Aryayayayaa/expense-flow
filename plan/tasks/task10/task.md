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

### STATUS: IN PROGRESS

- [x] Add `Requests` to the desktop Sidebar
- [x] Add `Requests` to the MobileSidebar
- [x] Add the request options under Requests
- [ ] Ensure navigation styling matches the existing dashboard navigation
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

### STATUS: IN PROGRESS

- [x] Move/reuse the existing Name Change Request component
- [x] Render it through the Requests flow
- [x] Preserve existing submission behavior
- [x] Preserve existing validation
- [x] Preserve existing approval/rejection workflow
- [x] Preserve existing notifications
- [x] Verify request status handling
- [ ] Verify Employee behavior
- [ ] Verify HR/Admin behavior where applicable

---

## 10.6 — Integrate Role Verification Request

### STATUS: IN PROGRESS

- [x] Move/reuse the existing Role Verification Request component
- [x] Render it through the Requests flow
- [x] Preserve existing submission behavior
- [x] Preserve existing validation
- [x] Preserve existing approval/rejection workflow
- [x] Preserve existing notifications
- [x] Verify role-aware visibility
- [ ] Verify authorization
- [ ] Verify Employee behavior
- [ ] Verify HR/Admin behavior where applicable

---

## 10.7 — Integrate Identity Verification

### STATUS: IN PROGRESS

- [x] Move/reuse the existing Identity Verification component
- [x] Render it through the Requests flow
- [x] Preserve existing submission behavior
- [x] Preserve existing validation
- [x] Preserve existing approval/rejection workflow
- [x] Preserve existing notifications
- [x] Verify role-aware visibility
- [ ] Verify authorization
- [ ] Verify Employee behavior
- [ ] Verify HR/Admin behavior where applicable

---

## 10.8 — Role-Aware Request Permissions

### STATUS: IN PROGRESS

- [ ] Verify Employee request options
- [ ] Verify HR request options
- [ ] Verify Admin request options
- [ ] Ensure Admin has all rights available to HR
- [ ] Ensure HR cannot access Admin-only functionality
- [ ] Ensure Employee cannot access HR/Admin-only functionality
- [ ] Verify direct URL authorization
- [ ] Verify server-side authorization
- [ ] Verify unavailable request options have appropriate fallback behavior

### Current Permission Requirement

- [ ] Admin can approve/reject Name Change requests
- [ ] Admin can approve/reject Role Verification requests
- [ ] Admin can approve/reject Identity Verification requests
- [ ] Ensure Admin request-review permissions match HR request-review permissions
- [ ] Verify authorization inside the server actions, not only through UI visibility

---

## 10.9 — Request State and UX

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

## 10.10 — Responsive Requests Navigation

- [ ] Verify Requests navigation on desktop
- [ ] Verify Requests navigation on mobile
- [x] Verify dropdown/selection behavior
- [x] Verify selected-state styling
- [x] Verify navigation does not interfere with existing sidebar items
- [ ] Verify mobile sidebar closes/behaves correctly after navigation

---

## 10.11 — Profile and Requests Integration Testing

### Employee

- [ ] Test `/profile`
- [ ] Test profile editing
- [ ] Test Requests navigation
- [ ] Test Name Change Request
- [ ] Test Role Verification
- [ ] Test Identity Verification
- [ ] Test invalid request URL
- [ ] Test unauthorized request URL
- [ ] Test page refresh
- [ ] Test browser back/forward
- [ ] Test mobile navigation

### HR

- [ ] Test `/profile`
- [ ] Test profile editing
- [ ] Test applicable Requests
- [ ] Test existing HR review workflows
- [ ] Test authorization
- [ ] Test invalid request URL
- [ ] Test direct URL access
- [ ] Test page refresh
- [ ] Test mobile navigation

### Admin

- [ ] Test `/profile`
- [ ] Test profile editing
- [ ] Test applicable Requests
- [ ] Test all HR-level permissions
- [ ] Test Admin-specific permissions
- [ ] Test authorization
- [ ] Test invalid request URL
- [ ] Test direct URL access
- [ ] Test page refresh
- [ ] Test mobile navigation

---

## 10.12 — Quality Checks

### STATUS: IN PROGRESS

- [ ] Run `npm run lint`
- [ ] Resolve Task 10-related lint errors
- [x] Run `npx tsc --noEmit`
- [x] Resolve Task 10-related TypeScript errors
- [ ] Run the application and perform final manual testing
- [ ] Verify no unexpected console errors
- [ ] Verify no broken navigation
- [ ] Verify no authorization bypasses

---

## 10.13 — Final Task 10 Review

- [ ] Review all changed files
- [ ] Review role-aware behavior
- [ ] Review profile/request separation
- [ ] Review desktop/mobile navigation
- [ ] Review request workflows
- [ ] Review authorization
- [ ] Review edge cases
- [ ] Confirm all Task 10 subtasks are complete
- [ ] Update `spec.md` with final implementation notes
- [ ] Update `tasks.md` with final completion status
- [ ] Commit Task 10 changes
