# Task 10 — Profile Flow

Branch: `feature/profile-flow`

---

## 10.1 — Review Existing Profile and Request Architecture

### STATUS: COMPLETED

- [x] Inspect the current `/profile` page
- [x] Identify all profile-related components
- [x] Identify all request-related components currently rendered on `/profile`
- [x] Inspect existing Name Change Request workflow
- [x] Inspect existing Role Verification workflow
- [x] Inspect existing Identity Verification workflow
- [x] Inspect corresponding server actions
- [x] Inspect existing role/permission checks
- [x] Identify reusable components and avoid unnecessary rewrites
- [x] Document the current architecture before modifying it

---

## 10.2 — Refactor `/profile` Page

### STATUS: NEXT

- [ ] Keep profile details on `/profile`
- [ ] Keep profile editing functionality on `/profile`
- [ ] Remove request workflow UI from `/profile`
- [ ] Ensure profile editing still works
- [ ] Ensure profile page remains role-aware where applicable
- [ ] Verify Employee profile
- [ ] Verify HR profile
- [ ] Verify Admin profile

---

## 10.3 — Create Requests Navigation

- [ ] Add `Requests` to the desktop Sidebar
- [ ] Add `Requests` to the MobileSidebar
- [ ] Add the request options under Requests
- [ ] Ensure navigation styling matches the existing dashboard navigation
- [ ] Ensure selected request state is visually clear
- [ ] Ensure desktop and mobile behavior remain consistent

---

## 10.4 — Create Requests Flow / Routing

- [ ] Establish the Requests entry point
- [ ] Establish request selection/navigation
- [ ] Render the selected request component
- [ ] Support direct navigation to a request
- [ ] Support browser refresh
- [ ] Support browser back/forward navigation
- [ ] Handle missing request selection
- [ ] Handle invalid request selection
- [ ] Handle unavailable request selection for the current role

---

## 10.5 — Integrate Name Change Request

- [ ] Move/reuse the existing Name Change Request component
- [ ] Render it through the Requests flow
- [ ] Preserve existing submission behavior
- [ ] Preserve existing validation
- [ ] Preserve existing approval/rejection workflow
- [ ] Preserve existing notifications
- [ ] Verify request status handling
- [ ] Verify Employee behavior
- [ ] Verify HR/Admin behavior where applicable

---

## 10.6 — Integrate Role Verification Request

- [ ] Move/reuse the existing Role Verification Request component
- [ ] Render it through the Requests flow
- [ ] Preserve existing submission behavior
- [ ] Preserve existing validation
- [ ] Preserve existing approval/rejection workflow
- [ ] Preserve existing notifications
- [ ] Verify role-aware visibility
- [ ] Verify authorization
- [ ] Verify Employee behavior
- [ ] Verify HR/Admin behavior where applicable

---

## 10.7 — Integrate Identity Verification

- [ ] Move/reuse the existing Identity Verification component
- [ ] Render it through the Requests flow
- [ ] Preserve existing submission behavior
- [ ] Preserve existing validation
- [ ] Preserve existing approval/rejection workflow
- [ ] Preserve existing notifications
- [ ] Verify role-aware visibility
- [ ] Verify authorization
- [ ] Verify Employee behavior
- [ ] Verify HR/Admin behavior where applicable

---

## 10.8 — Role-Aware Request Permissions

- [ ] Verify Employee request options
- [ ] Verify HR request options
- [ ] Verify Admin request options
- [ ] Ensure Admin has all rights available to HR
- [ ] Ensure HR cannot access Admin-only functionality
- [ ] Ensure Employee cannot access HR/Admin-only functionality
- [ ] Verify direct URL authorization
- [ ] Verify server-side authorization
- [ ] Verify unavailable request options have appropriate fallback behavior

---

## 10.9 — Request State and UX

- [ ] Display appropriate request state
- [ ] Handle pending requests
- [ ] Handle approved requests
- [ ] Handle rejected requests
- [ ] Prevent invalid duplicate submissions where existing logic requires it
- [ ] Provide appropriate empty states
- [ ] Provide appropriate error states
- [ ] Ensure no blank/broken UI occurs for invalid request selections

---

## 10.10 — Responsive Requests Navigation

- [ ] Verify Requests navigation on desktop
- [ ] Verify Requests navigation on mobile
- [ ] Verify dropdown/selection behavior
- [ ] Verify selected-state styling
- [ ] Verify navigation does not interfere with existing sidebar items
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

- [ ] Run `npm run lint`
- [ ] Resolve Task 10-related lint errors
- [ ] Run `npx tsc --noEmit`
- [ ] Resolve Task 10-related TypeScript errors
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
