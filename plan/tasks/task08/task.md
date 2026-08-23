# Task 08 — Sidebar Tooltips

## Objective

Improve the desktop and mobile sidebar navigation by adding clear tooltips
for sidebar navigation items where required.

The existing navigation structure, routes, active states, permissions,
icons, and mobile behavior must remain unchanged unless explicitly required
for the tooltip implementation.

---

## Subtasks

### 08.1 — Inspect Existing Sidebar Navigation

- [ ] Review `src/features/dashboard/components/Sidebar.tsx`
- [ ] Review `src/features/dashboard/components/MobileSidebar.tsx`
- [ ] Identify all sidebar navigation items
- [ ] Identify existing tooltip-related components/utilities, if any
- [ ] Confirm existing routes, active states, icons, and role-based visibility
      before making changes

### 08.2 — Desktop Sidebar Tooltips

- [ ] Add the required tooltips to desktop sidebar navigation items
- [ ] Ensure tooltip text clearly identifies each navigation item
- [ ] Preserve existing sidebar layout and navigation behavior
- [ ] Preserve existing active/inactive states
- [ ] Preserve existing role-based navigation visibility

#### Localhost Test — Desktop Sidebar

After completing 08.2:

- [ ] Open the application on localhost
- [ ] Log in as an ADMIN
- [ ] Hover over each applicable sidebar navigation item
- [ ] Confirm the correct tooltip is displayed
- [ ] Confirm tooltip text matches the corresponding navigation item
- [ ] Confirm navigation still works
- [ ] Confirm active sidebar state still works
- [ ] Confirm no visual/layout regression occurs

### 08.3 — Mobile Sidebar Tooltips

- [ ] Add the required tooltip behavior to the mobile sidebar
- [ ] Preserve the existing mobile sidebar layout
- [ ] Preserve mobile navigation behavior
- [ ] Preserve existing role-based navigation visibility

#### Localhost Test — Mobile Sidebar

After completing 08.3:

- [ ] Open the application on localhost
- [ ] Test the mobile/tablet sidebar layout
- [ ] Verify the applicable tooltip/help text appears correctly
- [ ] Verify navigation still works
- [ ] Verify active states still work
- [ ] Verify the sidebar does not overflow or break the mobile layout

### 08.4 — Cross-Role Validation

- [ ] Test sidebar behavior as ADMIN
- [ ] Test sidebar behavior as HR
- [ ] Test sidebar behavior as EMPLOYEE
- [ ] Confirm role-specific navigation items remain unchanged
- [ ] Confirm tooltips do not expose navigation items that the user cannot access

#### Localhost Test — Roles

- [ ] ADMIN sidebar verified
- [ ] HR sidebar verified
- [ ] EMPLOYEE sidebar verified

### 08.5 — TypeScript and Regression Validation

- [ ] Run `npx tsc --noEmit`
- [ ] Fix any TypeScript errors introduced by Task 08
- [ ] Re-test the affected sidebar functionality on localhost
- [ ] Confirm no unrelated functionality was affected

### 08.6 — Final Task Review

- [ ] Review all modified files
- [ ] Confirm no unnecessary files were modified
- [ ] Confirm existing navigation routes remain unchanged
- [ ] Confirm existing permissions remain unchanged
- [ ] Confirm desktop sidebar behavior
- [ ] Confirm mobile sidebar behavior
- [ ] Confirm all localhost tests pass

### 08.7 — Git and Documentation

- [ ] Commit the completed Task 08 implementation
- [ ] Push `feature/sidebar-tooltips`
- [ ] Update `plan/tasks/tasks.md`
- [ ] Mark Task 08 as completed in the task tracker
- [ ] Update `plan/spec2.md` if the final implementation changes any
      documented application behavior
- [ ] Record the completed work in this task folder
