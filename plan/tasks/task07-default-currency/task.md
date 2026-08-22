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

#### STATUS: COMPLETED

The user's default currency must become the primary display currency for expense values throughout the application.

This is a display/representation requirement and must not modify the original expense currency stored in the database.

The implementation must:
[x] Load the authenticated user's current defaultCurrency.
[x] Display expense values primarily in the user's current default currency.
[x] Convert expenses whose original currency differs from the user's default currency using the available exchange-rate information.
[x] Preserve and display the original transaction amount and currency for expenses whose original currency differs from the user's default currency.

Important: DO NOT remove the currency filter from /expenses.

The currency filter must remain available and must continue to filter expenses by their ORIGINAL transaction currency.

The responsibilities must remain separate:

1. Currency filter:
   - Filters by expense.currency, i.e. the original currency stored on the transaction.
   - ALL shows expenses of all original currencies.
   - INR shows only expenses originally created in INR.
   - USD shows only expenses originally created in USD.
   - EUR shows only expenses originally created in EUR.
   - And similarly for all supported currencies.

2. Default currency:
   - Controls the primary currency used to DISPLAY monetary values.
   - Controls summary calculations.
   - Must not modify the stored expense amount or original currency.

Review the existing /expenses implementation and make only the changes actually required to satisfy this behavior.

**Specifically verify/fix:**

- ExpensesPageClient continues passing:
  selectedCurrency
  onCurrencyChange
  to Filters.
- selectedCurrency remains part of the client-side filtering logic.
- matchesCurrency compares against expense.currency, not displayAmount or defaultCurrency.
- Currency filtering must not cause the displayed currency to change.
- displayAmount must continue representing the expense in the user's CURRENT default currency.
- Summary cards must calculate Total Expenses and This Month using displayAmount.
- Summary cards must always format values using defaultCurrency.
- When an expense's original currency differs from defaultCurrency:
  - primary amount should use displayAmount/defaultCurrency
  - original amount and original currency should remain visible as secondary information.
- When original currency equals defaultCurrency:
  - display the original amount as the primary amount
  - do not show a redundant secondary currency value.
- ALL currency filter must show all expenses while still displaying every monetary value in the user's current default currency.
- Individual currency filters must only change which transactions are included, not how those transactions are displayed.
- Category, year, month, date, approval and reimbursement filters must continue working independently.

After making the changes:

1. Run TypeScript validation.
2. Run ESLint.
3. Run the production build if appropriate.
4. Report exactly which files were changed and why.
5. Do not move to the next subtask.

---

8. Insights — Analysis

#### STATUS: NEXT

Create an Insights section/page that contains Analysis and Reports together.
There must be NO sub-tabs between Analysis and Reports.
The Analysis section must provide monetary analysis based on the authenticated user's current default currency and the selected currency filter.

**Currency Filter**
The existing currency filter must remain available.

The currency filter must:
[ ] Keep the existing order of currency options unchanged.
[ ] Default to the authenticated user's current defaultCurrency when the user first lands on the Insights page.
[ ] Not default to ALL CURRENCIES.
[ ] Allow the user to explicitly select ALL CURRENCIES.
[ ] Allow the user to select any supported individual currency.

**When a specific currency is selected**

When the currency filter contains a specific currency such as INR, USD, EUR, etc.:

[ ] Include only expenses whose original transaction currency matches the selected currency.
[ ] Do not convert expenses from another original currency into the selected currency.
[ ] Use the original stored expense amount for the analysis.

For example:
Currency Filter = USD
USD 100 → included as USD 100
INR 5000 → excluded
EUR 200 → excluded

When ALL CURRENCIES is selected
When the currency filter is ALL CURRENCIES:

[ ] Include expenses from all supported original currencies.
[ ] Use the authenticated user's current default currency as the reporting/display currency.
[ ] Convert expenses whose original currency differs from the user's default currency.
[ ] Do not modify the original stored expense amount or currency.
[ ] Aggregate the converted values using the user's default currency.

**Analysis graphs**
Analysis must include the relevant existing analysis graphs for:

[ ] Category-based spending.
[ ] Monthly spending.
[ ] Yearly spending.

**For each graph:**
[ ] Specific currency filter → only expenses originally saved in that currency are included.
[ ] ALL CURRENCIES → all expenses are converted to the user's default currency before aggregation.
[ ] Graph totals must use the same conversion logic as the summary values.

**Analysis tooltips**
When ALL CURRENCIES is selected, graph tooltips must explain how the displayed value was calculated.
For example, if the user's default currency is EUR:
EUR: €200.00
INR: ₹5,000.00 = €44.71
USD: $30.00 = €25.67

---

Total: €270.38

The exact visual formatting may vary, but the tooltip must clearly communicate:
[ ] Original currency.
[ ] Original amount.
[ ] Converted amount in the user's default currency.
[ ] Final total used by the graph.

The same calculation principle must work for category, monthly, and yearly graphs.

---

9. Insights — Reports

#### STATUS: NOT STARTED

The Reports section must be part of the same Insights page/section as Analysis.
There must be NO separate Reports sub-tab.
Reports must follow the same currency-filter and conversion rules established for Analysis.

**Currency Filter**
The existing currency filter must remain available.
[ ] Currency filter options must remain in their existing order.
[ ] The authenticated user's defaultCurrency must be selected by default when first landing on Insights.
[ ] ALL CURRENCIES must remain available as an explicit selection.

**Specific currency selected**
When a specific currency is selected:
[ ] Include only expenses originally saved with that currency.
[ ] Do not convert expenses from other currencies.
[ ] Use the original transaction amount for calculations.

**ALL CURRENCIES selected**
When ALL CURRENCIES is selected:
[ ] Include expenses from all currencies.
[ ] Convert non-default-currency expenses into the authenticated user's current default currency.
[ ] Aggregate converted values using the default currency.
[ ] Never overwrite historical expense values.

**Summary Cards**
Summary cards must follow the same filtering and conversion behavior as /expenses.
[ ] Summary values respond to the selected filters.
[ ] Specific currency → only expenses originally saved in that currency are included.
[ ] ALL CURRENCIES → all expenses are included after conversion to the user's default currency.
[ ] Summary values are displayed using the user's default currency.
[ ] Total Expenses uses the same calculation basis as the filtered report data.
[ ] This Month uses the same calculation basis as the filtered report data.
[ ] Other monetary summary values use the same conversion rules.

**Spending Summary**
The Spending Summary must:
[ ] Respect the active filters.
[ ] Use the user's default currency for displayed monetary values.
[ ] Convert non-default currencies when ALL CURRENCIES is selected.
[ ] Exclude expenses with other original currencies when a specific currency is selected.
[ ] Use the same calculation logic as the Summary Cards.

**Largest Expenses**
The Largest Expenses section must contain:
Column Requirement
Description Expense description/title
Category Expense category
Date Expense date
Default Currency Amount Amount represented in user's default currency
Original Amount Original transaction amount/currency when different from default currency

**Requirements:**
[ ] Respect all active filters.
[ ] When a specific currency is selected, only expenses originally saved in that currency are included.
[ ] When ALL CURRENCIES is selected, non-default currencies are converted to the user's default currency.
[ ] Preserve the original transaction amount and currency.
[ ] Show - for Original Amount when the original currency is the user's default currency.

**Top Spending Categories**
Top Spending Categories must:
[ ] Respect all active filters.
[ ] When a specific currency is selected, include only expenses originally saved with that currency.
[ ] Do not convert values when a specific currency is selected.
[ ] When ALL CURRENCIES is selected, convert all applicable expenses into the user's default currency.
[ ] Sum converted values by category.
[ ] Compare categories using the converted default-currency totals.

**Reports tooltips**
When ALL CURRENCIES is selected, report visualizations/tooltips must explain the calculation in the same manner as Analysis.

For example:
EUR: €200.00
INR: ₹5,000.00 = €44.71
USD: $30.00 = €25.67

---

Total: €270.38

The exact UI can differ, but the calculation must be understandable to the user.

---

10. Application-Wide Currency Consistency & Final Validation

#### STATUS: NOT STARTED

The final subtask ensures that all default-currency functionality implemented throughout Task 07 behaves consistently.

**Application-wide display**
Review monetary output across:
[ ] Dashboard.
[ ] My Expenses.
[ ] Expense cards.
[ ] Expense summaries.
[ ] Insights → Analysis.
[ ] Insights → Reports.
[ ] Approvals.
[ ] Approval history.
[ ] My Expense Status.
[ ] Any additional page/component that displays expense amounts.

**Currency behavior**
[ ] Authenticated user's current defaultCurrency is used wherever default-currency display is required.
[ ] Changing the user's default currency does not modify historical expense data.
[ ] Original expense amount remains unchanged.
[ ] Original expense currency remains unchanged.
[ ] Stored exchange-rate information remains unchanged.
[ ] Non-default-currency expenses are converted only when default-currency aggregation/display requires conversion.
[ ] Specific currency filters include only expenses originally saved in that currency.
[ ] ALL CURRENCIES includes expenses from all supported currencies and converts them to the user's default currency where required.
[ ] No monetary page silently assumes INR when the user's default currency is another supported currency.

**Currency filters**
Currency filters must NOT be removed as previously planned.
They remain available where they are useful for analysis/reporting.
[x] /expenses currency filter remains available.
[ ] /insights currency filter remains available.
[ ] Currency filter options retain their existing order.
[ ] Insights defaults the currency filter to the user's default currency.
[ ] ALL CURRENCIES remains available as an explicit option.
[ ] Registration continues to use currency selection for the user's default currency.
[x] Edit Profile continxes to use currency selection for the user's default currency.
[ ] Expense Creation continues to allow an individual expense currency independent of the user's default currency.

**Historical data**
[ ] Changing the user's default currency does not update historical expense currency.
[ ] Changing the user's default currency does not update historical expense amount.
[ ] Existing baseCurrencyAmount values continue to be used appropriately.
[x] Existing exchange-rate information is preserved.
[x] Legacy INR expenses continue to work correctly.
[x] Users can access existing expenses after changing their default currency.

**Authorization and validation**
[ ] Unsupported currency codes are rejected server-side.
[ ] Users cannot modify another user's default currency.
[ ] Currency conversion is performed using the existing exchange-rate implementation.

Final regression
[ ] Test INR as default currency.
[ ] Test USD as default currency.
[ ] Test EUR as default currency.
[ ] Test at least one additional supported currency.
[ ] Test expenses containing multiple original currencies.
[ ] Test switching default currency during the same authenticated session.
[ ] Verify the new currency becomes effective without requiring logout/login.
[x] Verify Dashboard reflects the new currency.
[x] Verify My Expenses reflects the new currency.
[ ] Verify Insights reflects the new currency.
[ ] Verify Analysis reflects the new currency.
[ ] Verify Reports reflects the new currency.
[ ] Verify Approvals reflects the appropriate currency.
[ ] Run TypeScript validation.
[ ] Run ESLint.
[ ] Run production build.

**Completion Criteria**

#### STATUS: NOT STARTED

Task 07 is complete only when all of the following are satisfied:
[x] New users can select their default currency during registration.
[x] Default currency is stored on the User model.
[x] Existing users have safe fallback behavior.
[x] Users can change their default currency from Edit Profile.
[x] Changing the default currency updates the active session without requiring logout/login.
[x] Dashboard displays monetary values in the user's default currency.
[ ] New Expense form automatically selects the user's default currency.
[ ] Users can still select a different currency for an individual expense.
[ ] Changing an expense's currency does not change the user's default currency.
[x] Existing expenses retain their original transaction currency.
[x] Existing expense amounts are not overwritten when the user changes default currency.
[ ] My Expenses displays monetary values in the user's default currency.
[ ] My Expenses currency filter remains available.
[ ] My Expenses specific-currency filtering uses the original transaction currency.
[ ] My Expenses ALL CURRENCIES includes all expenses and uses default-currency values for aggregation.
[ ] Insights contains Analysis and Reports without sub-tabs.
[ ] Insights currency filter remains available.
[ ] Insights defaults the currency filter to the authenticated user's default currency.
[ ] Analysis supports category, monthly, and yearly analysis.
[ ] Analysis specific-currency filtering includes only expenses originally saved in that currency.
[ ] Analysis ALL CURRENCIES converts expenses to the user's default currency.
[ ] Analysis tooltips explain multi-currency calculations.
[ ] Reports summary values respond to active filters.
[ ] Reports Spending Summary responds to active filters.
[ ] Reports Largest Expenses responds to active filters.
[ ] Reports Top Spending Categories respond to active filters.
[ ] Reports specific-currency filtering uses original transaction currency.
[ ] Reports ALL CURRENCIES converts expenses to the user's default currency.
[ ] Reports tooltips explain multi-currency calculations where applicable.
[ ] Approvals display monetary values consistently with the applicable default currency.
[ ] My Expense Status displays monetary values using the authenticated user's default currency.
[ ] Non-default-currency expenses are converted when default-currency display/aggregation is required.
[ ] Original transaction amount/currency remains available where required.
[ ] Historical expense data is never modified merely because the user's default currency changes.
[ ] All supported currencies are handled consistently.
[ ] Server-side validation prevents unsupported currency codes.
[ ] Server-side authorization prevents users from modifying another user's default currency.
[ ] TypeScript validation passes.
[ ] ESLint passes.
[ ] Production build passes.

**Testing Checklist**

#### STATUS: IN PROGRESS

**Registration**
[x] Register a new user with INR.
[x] Register a new user with USD.
[x] Register a new user with another supported currency.
[x] Verify the selected currency is persisted in the database.
[x] Verify invalid currency codes are rejected.

**Edit Profile**
[x] Change default currency from INR to USD.
[x] Change default currency from USD to EUR.
[x] Change default currency back to INR.
[x] Verify the new preference persists after logout/login.
[x] Verify the new currency becomes active during the same session without logout/login.
[x] Verify another user's default currency cannot be modified.

**Expense Creation**
[x] Verify the New Expense form initially selects the user's default currency.
[x] Create an expense using the default currency.
[x] Create an expense using a different currency.
[x] Verify changing the expense currency does not change the user's default currency.

**Existing Expenses**
[ ] Create expenses in multiple currencies.
[ ] Change the user's default currency.
[ ] Verify existing expense original amounts remain unchanged.
[ ] Verify existing expense original currencies remain unchanged.
[ ] Verify displayed converted values use the new default currency.

**Dashboard**
[x] Verify summary values use the user's default currency.
[x] Verify monthly totals use the user's default currency.
[x] Verify recent expenses display converted values correctly.

**My Expenses**
[ ] Verify the currency filter remains available.
[ ] Verify currency filter options retain their existing order.
[ ] Verify ALL CURRENCIES includes all expenses.
[ ] Verify selecting a specific currency includes only expenses originally saved in that currency.
[ ] Verify summary values use the default currency.
[ ] Verify non-default transaction amounts are shown as secondary information where required.

**Insights — Analysis**
[ ] Verify Analysis and Reports appear together without sub-tabs.
[ ] Verify the currency filter remains available.
[ ] Verify the default selected currency is the authenticated user's default currency.
[ ] Verify selecting a specific currency includes only expenses originally saved in that currency.
[ ] Verify selecting a specific currency does not convert other currencies.
[ ] Verify ALL CURRENCIES includes expenses from all currencies.
[ ] Verify ALL CURRENCIES converts non-default expenses to the user's default currency.
[ ] Verify category analysis uses the correct currency behavior.
[ ] Verify monthly analysis uses the correct currency behavior.
[ ] Verify yearly analysis uses the correct currency behavior.
[ ] Verify graph tooltips explain the conversion calculation when ALL CURRENCIES is selected.

**Insights — Reports**
[ ] Verify Summary Cards respond to filters.
[ ] Verify Spending Summary responds to filters.
[ ] Verify Largest Expenses responds to filters.
[ ] Verify Top Spending Categories respond to filters.
[ ] Verify specific currency selection includes only expenses originally saved in that currency.
[ ] Verify ALL CURRENCIES converts expenses to the user's default currency.
[ ] Verify Original Amount is shown when applicable.
[ ] Verify - is shown when the original currency equals the default currency.
[ ] Verify report tooltips explain multi-currency calculations.

**Approvals**
[ ] Verify pending approval amounts display correctly.
[ ] Verify approval history amounts display correctly.
[ ] Verify My Expense Status amounts display correctly.

**Regression**
[ ] Test INR as default currency.
[ ] Test USD as default currency.
[ ] Test EUR as default currency.
[ ] Test at least one additional supported currency.
[ ] Test multiple original expense currencies.
[ ] Change default currency without logging out.
[ ] Verify Dashboard updates.
[ ] Verify My Expenses updates.
[ ] Verify Insights updates.
[ ] Verify Analysis updates.
[ ] Verify Reports updates.
[ ] Verify Approvals updates.
[ ] Run TypeScript validation.
[ ] Run ESLint.
[ ] Run production build.
[ ] Verify existing users and existing expenses continue working.
