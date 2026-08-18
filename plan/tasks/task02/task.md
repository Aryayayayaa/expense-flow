# Task 02 — Global Theme Toggle

## Objective

Implement a global light/dark theme toggle for ExpenseFlow.

The theme toggle must be available to all authenticated users regardless of role
(ADMIN, HR, or EMPLOYEE) and must remain accessible across all dashboard pages.

The toggle is implemented at the shared dashboard/sidebar level rather than
separately within individual role-specific pages.

---

## Subtask 02.1 — Theme State and Persistence

- [x] Create a reusable `ThemeToggle` client component.
- [x] Support `light` and `dark` theme states.
- [x] Persist the selected theme using `localStorage`.
- [x] Restore the persisted theme when the application loads.
- [x] Apply the selected theme using the `dark` class on the root `<html>` element.
- [x] Prevent theme UI from rendering before client-side hydration is complete.
- [x] Keep theme state independent from user role.
- [x] Verify TypeScript compilation with `npx tsc --noEmit`.

### Implementation

Created:

`src/features/dashboard/components/ThemeToggle.tsx`

The component currently manages:

- Client-side theme state.
- `localStorage` persistence.
- Root `<html>` class manipulation.
- Light/dark mode switching.
- Hydration-safe rendering.

---

## Subtask 02.2 — Desktop Sidebar Integration

- [x] Import `ThemeToggle` into `Sidebar.tsx`.
- [x] Render the theme toggle above the Logout button.
- [x] Ensure the toggle is visible for ADMIN, HR, and EMPLOYEE accounts.
- [x] Preserve the existing sidebar navigation.
- [x] Preserve the existing Logout functionality.
- [x] Verify the toggle works from dashboard pages.

---

## Subtask 02.3 — Mobile Sidebar Integration

- [ ] Import the same `ThemeToggle` component into `MobileSidebar.tsx`.
- [ ] Render the theme toggle above the Logout button.
- [ ] Reuse the same global theme state and persistence mechanism.
- [ ] Ensure opening/closing the mobile drawer does not reset the theme.
- [ ] Verify the toggle works correctly on mobile layouts.

---

## Subtask 02.4 — Global Theme Styling

- [ ] Add global dark-mode CSS variables/styles.
- [ ] Ensure the application background changes correctly in dark mode.
- [ ] Ensure global foreground/text colors remain readable.
- [ ] Apply appropriate dark-mode styling to shared dashboard UI.
- [ ] Add required Tailwind `dark:` utility classes to shared components.
- [ ] Preserve the existing light-mode appearance.
- [ ] Ensure the selected theme applies globally rather than only to the sidebar.

---

## Subtask 02.5 — Cross-Role and Cross-Page Verification

- [ ] Verify using an EMPLOYEE account.
- [ ] Verify using an HR account.
- [ ] Verify using an ADMIN account.
- [ ] Verify the toggle appears on the desktop sidebar.
- [ ] Verify the toggle appears on the mobile sidebar.
- [ ] Verify the toggle appears directly above Logout.
- [ ] Verify switching from light → dark.
- [ ] Verify switching from dark → light.
- [ ] Verify theme persistence after page refresh.
- [ ] Verify theme persistence during page navigation.
- [ ] Verify theme persistence across dashboard routes.
- [ ] Verify authentication and Logout remain unaffected.
- [ ] Verify navigation remains unaffected.

---

## Subtask 02.6 — Validation

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Confirm zero TypeScript errors.
- [ ] Confirm production build succeeds.
- [ ] Confirm no hydration errors.
- [ ] Confirm no existing functionality is broken.

---

## Task 02 Completion Criteria

- [ ] Global light/dark theme toggle is implemented.
- [ ] Theme state is persisted across page refreshes.
- [ ] Desktop sidebar contains the toggle above Logout.
- [ ] Mobile sidebar contains the toggle above Logout.
- [ ] Toggle is available to ADMIN, HR, and EMPLOYEE accounts.
- [ ] Theme applies globally across dashboard pages.
- [ ] Light mode remains visually/functionally correct.
- [ ] Dark mode is visually/functionally usable.
- [ ] Cross-page navigation preserves the selected theme.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.
- [ ] Git commit is created for the completed Task 02 implementation.

---

## Git Branch

`feature/theme-toggle`

## Status

**IN PROGRESS**
