# Task 07 — Default Currency

## Status: STARTING

## Objective

Implement the user's default currency preference across the application.

A newly registered user must be able to select their preferred/default currency during registration. This currency should be stored against the user account and used as the user's default currency throughout the application.

The user must also be able to change this preference later from the **Edit Profile** section.

This task establishes the user-level currency preference that will be used by subsequent expense-related features.

---

## Scope

### 1. Registration

Add a default currency selection to the user registration flow.

The registration form should:

- Provide a currency selection field.
- Allow the user to choose from the application's supported currencies.
- Have a sensible default selection.
- Validate the selected currency.
- Persist the selected currency when the user account is created.

The selected currency must become the user's stored default currency.

---

### 2. User Data

The user's default currency must be persisted in the database as part of the user profile/account data.

The implementation must:

- Use the existing supported currency definitions where possible.
- Avoid duplicating the supported currency list unnecessarily.
- Store a normalized currency code.
- Maintain compatibility with existing users/data.

If an existing user does not yet have a stored default currency, the application must have a safe fallback behavior.

---

### 3. Edit Profile

The **Edit Profile** section must allow the authenticated user to change their default currency.

The Edit Profile flow should:

- Display the user's current default currency.
- Allow selection of another supported currency.
- Validate the selected currency.
- Persist the updated preference.
- Display appropriate success/error feedback.
- Reflect the new currency preference after the profile is updated.

---

### 4. Expense Creation

The expense creation form should use the user's default currency as the initial currency selection.

The user's default currency should:

- Be loaded from the authenticated user's profile.
- Be selected automatically when opening the New Expense form.
- Still allow the user to manually select another supported currency for an individual expense.

Changing the expense currency for one expense must not change the user's default currency.

The default currency is a user preference; the expense currency remains an expense-level value.

---

### 5. Existing Expense Behavior

Existing expenses must retain their originally stored currency.

Changing the user's default currency must NOT:

- Convert existing expenses.
- Modify existing expense currency values.
- Modify historical exchange rates.
- Recalculate previously stored base-currency amounts.

The default currency only affects future/default selections.

---

### 6. Validation and Security

Default currency updates must only be performed for the authenticated user's own profile.

The implementation must:

- Validate the currency against the application's supported currencies.
- Reject invalid/unsupported currency codes.
- Prevent unauthorized users from modifying another user's default currency.
- Keep server-side validation authoritative.

Client-side validation/UI behavior must not be treated as a security boundary.

---

## Technical Considerations

### Supported currencies

Use the existing currency configuration:

```text
src/constants/currencies
```
