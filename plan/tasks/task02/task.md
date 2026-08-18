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

- [x] Import the same `ThemeToggle` component into `MobileSidebar.tsx`.
- [x] Render the theme toggle above the Logout button.
- [x] Reuse the same global theme state and persistence mechanism.
- [x] Ensure opening/closing the mobile drawer does not reset the theme.
- [x] Verify the toggle works correctly on mobile layouts.

---

## Subtask 02.4 — Global Theme Styling

- [x] Add global dark-mode CSS variables/styles.
- [x] Ensure the application background changes correctly in dark mode.
- [x] Ensure global foreground/text colors remain readable.
- [x] Apply appropriate dark-mode styling to shared dashboard UI.
- [x] Add required Tailwind `dark:` utility classes to shared components.
- [x] Preserve the existing light-mode appearance.
- [x] Ensure the selected theme applies globally rather than only to the sidebar.

---

## Subtask 02.5 — Cross-Role and Cross-Page Verification

- [x] Verify using an EMPLOYEE account.
- [x] Verify using an HR account.
- [x] Verify using an ADMIN account.
- [x] Verify the toggle appears on the desktop sidebar.
- [x] Verify the toggle appears on the mobile sidebar.
- [x] Verify the toggle appears directly above Logout.
- [x] Verify switching from light → dark.
- [x] Verify switching from dark → light.
- [x] Verify theme persistence after page refresh.
- [x] Verify theme persistence during page navigation.
- [x] Verify theme persistence across dashboard routes.
- [x] Verify authentication and Logout remain unaffected.
- [x] Verify navigation remains unaffected.

---

## Subtask 02.6 — Validation

- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run build`.
- [x] Confirm zero TypeScript errors.
- [x] Confirm production build succeeds.
- [x] Confirm no hydration errors.
- [x] Confirm no existing functionality is broken.

---

## Task 02 Completion Criteria

- [x] Global light/dark theme toggle is implemented.
- [x] Theme state is persisted across page refreshes.
- [x] Desktop sidebar contains the toggle above Logout.
- [x] Mobile sidebar contains the toggle above Logout.
- [x] Toggle is available to ADMIN, HR, and EMPLOYEE accounts.
- [x] Theme applies globally across dashboard pages.
- [x] Light mode remains visually/functionally correct.
- [x ] Dark mode is visually/functionally usable.
- [x] Cross-page navigation preserves the selected theme.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] Git commit is created for the completed Task 02 implementation.

---

## Git Branch

`feature/theme-toggle`

## Status

**COMPLETED**
