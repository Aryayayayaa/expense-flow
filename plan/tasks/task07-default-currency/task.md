# Task 07 — Default Currency

## Status IN PROGRESS

## Objective

Implement the user's default currency preference across the application.

A newly registered user must be able to select their preferred/default currency during registration. This currency should be stored against the user account and used as the user's default currency throughout the application.

The user must also be able to change this preference later from the **Edit Profile** section.

This task establishes the user-level currency preference that will be used by subsequent expense-related features.

---

## Scope

### 1. Registration

#### STATUS: COMPLETED

Add a default currency selection to the user registration flow.

The registration form should:

[x] Provide a currency selection field.
[x] Allow the user to choose from the application's supported currencies.
[x] Have a sensible default selection.
[x] Validate the selected currency.
[x] Persist the selected currency when the user account is created.
The selected currency must become the user's stored default currency.

---

### 2. User Data

#### STATUS: COMPLETED

The user's default currency must be persisted in the database as part of the user profile/account data.

The implementation must:

[x] Use the existing supported currency definitions where possible.
[x] Avoid duplicating the supported currency list unnecessarily.
[x] Store a normalized currency code.
[x] Maintain compatibility with existing users/data.

If an existing user does not yet have a stored default currency, the application must have a safe fallback behavior.

---

### 3. Edit Profile

### STATUS: COMPLETED

The **Edit Profile** section must allow the authenticated user to change their default currency.

The Edit Profile flow should:

[x] Display the user's current default currency.
[x] Allow selection of another supported currency.
[x] Validate the selected currency.
[x] Persist the updated preference.
[x] Display appropriate success/error feedback.
[x] Reflect the new currency preference after the profile is updated.

---

### 4. Expense Creation

#### STATUS: COMPLETED

The expense creation form should use the user's default currency as the initial currency selection.

The user's default currency should:
[x] Be loaded from the authenticated user's profile.
[x] Be selected automatically when opening the New Expense form.
[x] Still allow the user to manually select another supported currency for an individual expense.

Changing the expense currency for one expense must not change the user's default currency.

The default currency is a user preference; the expense currency remains an expense-level value.

---

### 5. Existing Expense Behavior

#### STATUS: COMPLETED

### 5. Existing Expense Behavior

#### STATUS: COMPLETED

Existing expenses must retain their originally stored currency.

Changing the user's default currency must NOT:
[x] Convert existing expenses.
[x] Modify existing expense currency values.
[x] Modify historical exchange rates.
[x] Recalculate previously stored base-currency amounts.

The default currency only affects future/default selections.

However, the user's current default currency must affect the **display representation** of existing expenses without modifying their stored transaction data.

The application should:
[x] Display existing expense amounts using the user's current default currency.
[x] Convert the existing expense's stored amount into the user's current default currency for display purposes only.
[x] When the expense's original currency is different from the user's current default currency, display the original transaction amount and currency in brackets next to/below the converted default-currency value.
[x] When the expense's original currency matches the user's current default currency, display only the default-currency value without the original-currency value in brackets.
[x] Preserve the original expense amount and currency in the database.
[x] Preserve the historical exchange rate and exchange-rate date stored against the expense.
[x] Preserve the previously stored base-currency amount.
[x] Changing the user's default currency must update the displayed representation of existing expenses without mutating the stored expense record.

Example:

If the user's default currency is INR and an expense was originally created as USD 100:

Display:

    ₹<converted INR value>
    ($100)

If the user later changes their default currency to USD:

Display:

    $100

No bracketed original value is required because the expense's original currency now matches the user's current default currency.

If the user later changes their default currency to EUR:

Display:

    €<converted EUR value>
    ($100)

The original transaction remains stored as USD 100 throughout these changes.

This display-currency behavior must eventually be applied consistently across:
[x] My Expenses / Expense Cards.
[x] Dashboard.
[x] Analytics.
[x] Reports.
[x] Approvals.

## The display conversion must not overwrite or recalculate the historical transaction data stored for the expense.

---

### 6. Dashboard Default Currency Display

#### STATUS: COMPLETED

The Dashboard must use the authenticated user's current default currency for all applicable monetary display and aggregation.

The Dashboard must:

- [x] Load the authenticated user's current default currency.
- [x] Display "Total Expenses" using the user's current default currency.
- [x] Display "This Month" using the user's current default currency.
- [x] Include expenses stored in all supported currencies when calculating totals.
- [x] Convert non-default-currency expenses into the user's current default currency before aggregation.
- [x] Keep expenses originally stored in the user's default currency unchanged.
- [x] Ensure changing the user's default currency updates Dashboard monetary values in the same session.
- [x] Ensure changing the user's default currency does not modify historical expense data.

#### Recent Expenses

The Recent Expenses table must continue to contain:

- Date
- Expense
- Category
- Amount

Only the Amount column requires currency-display changes.

The Amount column must:

- [x] Display the expense amount primarily in the user's current default currency.
- [x] Convert the expense into the user's default currency when the original expense currency differs.
- [x] Display the original transaction amount and currency in brackets when the original currency differs from the default currency.
- [x] Display only the default-currency amount when the original expense currency matches the default currency.
- [x] Preserve the original transaction amount and currency in the database.
- [x] Never overwrite the historical expense amount merely because the user's default currency changes.

---

### 7. Expense Display Currency

#### STATUS: NEXT

The user's default currency must become the primary display currency for expense values throughout the application.

This is a display/representation requirement and must not modify the original expense currency stored in the database.

The implementation must:

[ ] Load the authenticated user's current defaultCurrency.

[ ] Display expense values primarily in the user's current default currency.

[ ] Convert expenses whose original currency differs from the user's default currency using the available exchange-rate information.

[ ] Preserve and display the original transaction amount and currency for expenses whose original currency differs from the user's default currency.

---

### 8. Default Currency Changes

#### STATUS: NOT STARTED

[ ] When a user changes their default currency from the Edit Profile section, the new currency must immediately become the application's display currency for that user.

---

### 9. My Expenses Page

#### STATUS: NOT STARTED

Remove currency filtering from the My Expenses page.

The /expenses page must:

[ ] Remove the currency filter from the available filters.

[ ] Never provide an ALL, INR, USD, EUR, etc. currency filter to the user.

[ ] Display all expenses regardless of their original currency.

[ ] Display expense amounts primarily using the user's current default currency.

[ ] Display the original amount and original currency for expenses whose original currency differs from the user's default currency.

[ ] Ensure summary values use the user's default currency.

[ ] Ensure "Total Expenses" is calculated using converted default-currency values.

[ ] Ensure "This Month" is calculated using converted default-currency values.

[ ] Keep category, year, month, date, approval, and reimbursement filters working independently of currency.

Currency must not be used as a filtering dimension.

---

### 10. Dashboard

#### STATUS: NOT STARTED

The Dashboard must use the user's default currency rather than assuming INR.

The Dashboard must:

[ ] Load the user's current default currency.

[ ] Display Total Expenses in the user's default currency.

[ ] Display This Month in the user's default currency.

[ ] Convert non-default-currency expenses into the user's default currency for aggregation.

[ ] Display recent expense values primarily in the user's default currency.

[ ] Display the original transaction amount/currency as secondary information when the expense currency differs from the user's default currency.

[ ] Continue to support users whose default currency is INR.

[ ] Continue to support users whose default currency is any other supported currency.

---

### 11. Reports

STATUS: NOT STARTED

Remove currency filtering from the Reports page.

The Reports page must:

[ ] Have no currency filter.

[ ] Use the authenticated user's default currency for applicable user-level report output.

[ ] Convert non-default-currency expenses into the user's default currency.

[ ] Include both default-currency expenses and converted non-default-currency expenses in totals.

[ ] Display report totals using the user's default currency.

[ ] Ensure charts, summaries, totals, and other monetary outputs use the same default-currency basis.

[ ] Preserve the original transaction currency where the report displays individual expense-level information.

The Reports page must not assume INR as the reporting currency.

---

### 12. Analytics

#### STATUS: NOT STARTED

Remove currency filtering from the Analytics page.

The Analytics page must:

[ ] Have no currency filter.

[ ] Use the authenticated user's default currency for monetary analysis.

[ ] Convert non-default-currency expenses into the user's default currency.

[ ] Include converted values in totals, averages, category analysis, trends, charts, and other monetary calculations.

[ ] Display monetary output using the user's current default currency.

[ ] Preserve original expense currency information where individual transactions are displayed.

Changing the user's default currency must cause Analytics to use the new default currency for its monetary output.

---

### 13. Approvals

#### STATUS: NOT STARTED

The Approvals page must also respect the appropriate default-currency display behavior.

For expenses submitted by employees:

[ ] Display the relevant user's default currency as the primary display currency where the expense is being represented for that user.

[ ] Convert the expense into the appropriate default currency when required.

[ ] Preserve the original expense amount and currency as secondary information when different.

[ ] Approval history must display monetary values consistently.

[ ] My Expense Status must display monetary values using the authenticated user's default currency.

The implementation must ensure that changing a user's default currency does not alter the historical expense transaction itself.

---

### 14. Currency Filters Removal

#### STATUS: NOT STARTED

Currency filters must be removed completely from:

[ ] /expenses

[ ] /analytics

[ ] /reports

The application must not expose currency filtering controls on these pages.

Currency selection remains available where it is logically required:

[ ] Registration — user default currency.

[ ] Edit Profile — user default currency.

[ ] Expense Creation — individual expense currency.

The currency selected during expense creation is independent of the user's default currency.

---

### 15. Currency Conversion and Historical Values

#### STATUS: NOT STARTED

The application must distinguish between:

User default currency.
Original expense currency.
Original expense amount.
Stored exchange rate.
Normalized/default-currency display amount.

Existing expense records must remain historically accurate.

The implementation must:
[ ] Preserve the original expense amount.
[ ] Preserve the original expense currency.
[ ] Preserve the stored exchange rate information.
[ ] Avoid overwriting historical transaction data merely because the user's default currency changes.
[ ] Use conversion logic to determine the appropriate display/reporting value.
[ ] Avoid treating the user's default currency as the expense's original currency.

---

### 16. Application-Wide Currency Consistency

#### STATUS: NOT STARTED

The default currency behavior must be consistent wherever monetary values are displayed.
The implementation should review monetary output across:
[ ] Dashboard.
[ ] My Expenses.
[ ] Expense cards.
[ ] Expense summaries.
[ ] Analytics.
[ ] Reports.
[ ] Approvals.
[ ] Approval history.
[ ] My Expense Status.
[ ] Any additional page/component that displays expense amounts.
No page should silently fall back to INR when the authenticated user's default currency is another supported currency unless the fallback is explicitly required for legacy/missing data.

---

### 17. Backward Compatibility

#### STATUS: NOT STARTED

Existing users and existing expenses must continue to work correctly after this feature is completed.
The implementation must:
[ ] Provide a safe default currency for legacy users without a stored preference.
[ ] Continue displaying legacy INR expenses correctly.
[ ] Continue using existing baseCurrencyAmount values where appropriate.
[ ] Avoid breaking existing expense records.
[ ] Avoid breaking existing reports and analytics data.
[ ] Ensure users with newly selected default currencies can still access all existing expenses.

---

### Completion Criteria

#### STATUS: NOT STARTED

Task 07 is complete only when all of the following are satisfied:
[ ] New users can select their default currency during registration.
[x] Default currency is stored on the User model.
[x] Existing users have safe fallback behavior.
[x] Users can change their default currency from Edit Profile.
[ ] New Expense form automatically selects the user's default currency.
[ ] Users can still select a different currency for an individual expense.
[ ] Changing an expense's currency does not change the user's default currency.
[ ] Existing expenses retain their original transaction currency.
[ ] Existing expense amounts are not overwritten when the user changes default currency.
[ ] My Expenses has no currency filter.
[ ] Reports has no currency filter.
[ ] Analytics has no currency filter.
[ ] Dashboard displays monetary values in the user's default currency.
[ ] My Expenses displays monetary values in the user's default currency.
[ ] Reports display monetary values in the user's default currency.
[ ] Analytics displays monetary values in the user's default currency.
[ ] Approvals display monetary values consistently with the applicable default currency.
[ ] Non-default-currency expenses are converted for default-currency display and aggregation.
[ ] Original transaction amount/currency remains visible as secondary information where required.
[ ] Report and Analytics calculations use converted default-currency values.
[ ] Changing the user's default currency updates future display/reporting output without modifying historical expense data.
[ ] All supported currencies are handled consistently.
[ ] Server-side validation prevents unsupported currency codes.
[ ] Server-side authorization prevents users from modifying another user's default currency.

---

Testing Checklist
STATUS: IN PROGRESS
Registration
[x] Register a new user with INR.
[x] Register a new user with USD.
[x] Register a new user with another supported currency.
[x] Verify the selected currency is persisted in the database.
[x] Verify invalid currency codes are rejected.

Edit Profile
[x] Change default currency from INR to USD.
[x] Change default currency from USD to EUR.
[x] Change default currency back to INR.
[x] Verify the new preference persists after logout/login.
[x] Verify another user's default currency cannot be modified.

Expense Creation
[ ] Verify the New Expense form initially selects the user's default currency.
[ ] Create an expense using the default currency.
[ ] Create an expense using a different currency.
[ ] Verify changing the expense currency does not change the user's default currency.

Existing Expenses
[ ] Create expenses in multiple currencies.
[ ] Change the user's default currency.
[ ] Verify existing expense original amounts remain unchanged.
[ ] Verify existing expense original currencies remain unchanged.
[ ] Verify displayed converted values use the new default currency.

Dashboard
[ ] Verify summary values use the user's default currency.
[ ] Verify monthly totals use the user's default currency.
[ ] Verify recent expenses display converted values correctly.

My Expenses
[ ] Verify currency filter is completely removed.
[ ] Verify all currencies are displayed together.
[ ] Verify summary values use the default currency.
[ ] Verify non-default transaction amounts are shown as secondary information.

Reports
[ ] Verify currency filter is completely removed.
[ ] Verify report totals use the user's default currency.
[ ] Verify non-default expenses are converted before aggregation.

Analytics
[ ] Verify currency filter is completely removed.
[ ] Verify monetary analytics use the user's default currency.
[ ] Verify charts and totals include converted non-default-currency expenses.

Approvals
[ ] Verify pending approval amounts display correctly.
[ ] Verify approval history amounts display correctly.
[ ] Verify My Expense Status amounts display correctly.

Regression
[ ] Run TypeScript validation.
[ ] Run ESLint.
[ ] Run production build.
[ ] Test INR as default currency.
[ ] Test USD as default currency.
[ ] Test EUR as default currency.
[ ] Test at least one additional supported currency.
[ ] Verify existing users and existing expenses continue working.

---

## Technical Considerations

### Supported currencies

Use the existing currency configuration:

```text
src/constants/currencies
```
