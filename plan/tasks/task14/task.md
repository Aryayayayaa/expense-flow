# Task 14 — Dynamic Reusable Dialog System

## Objective

Replace the existing browser-native `alert()` and `window.confirm()` dialogs used throughout the application with a reusable, dynamic application-level dialog component.

The dialog system should be reusable across different features and actions instead of creating separate dialog components for every individual use case.

The dialog must dynamically adapt its content, appearance, available actions, and input requirements according to the situation.

---

## Requirements

### 1. Create a reusable Dialog component

Create a common dialog component that can be reused wherever confirmation, warning, rejection, deletion, approval, or reason-input dialogs are required.

The component should support dynamic configuration such as:

- Dialog title
- Description/message
- Dialog type/variant
- Primary action label
- Secondary/cancel action
- Loading state
- Optional user input
- Optional reason textarea
- Appropriate visual indication for the action

---

### 2. Support different dialog scenarios

The reusable dialog should support situations including, but not limited to:

- Delete confirmation
- Approve confirmation
- Reject confirmation
- Reimburse confirmation
- Reject with reason
- Other destructive/action confirmations currently using `window.confirm()`
- Other notifications currently using `alert()`

Examples:

**Delete**

- Title: Delete Expense
- Message asking the user to confirm deletion
- Primary action: Delete
- Secondary action: Cancel

**Approve**

- Title: Approve Expense
- Confirmation message
- Primary action: Approve
- Secondary action: Cancel

**Reject**

- Title: Reject Expense
- Reason input
- Primary action: Reject
- Secondary action: Cancel
- Reason must be validated before submission

**Reimburse**

- Title: Reimburse Expense
- Confirmation message
- Primary action: Reimburse
- Secondary action: Cancel

---

### 3. Dynamic behavior

The same dialog component should be used for different situations.

The implementation should avoid creating separate components such as:

- DeleteDialog
- ApproveDialog
- RejectDialog
- ReimburseDialog

unless there is a genuine structural reason to do so.

Instead, the common dialog should receive the required configuration through props/state.

---

### 4. Dynamic visual variants

Support appropriate visual variants for different actions, for example:

- Default / informational
- Warning
- Destructive
- Success

The dialog should visually communicate the nature of the action while maintaining the existing application's design language.

---

### 5. Optional reason/input support

The dialog should support an optional input area so that the same component can be reused for actions that require additional information.

For example:

- Rejection reason
- Cancellation reason
- Other action-specific explanations

The input should only appear when requested by the caller.

Validation should prevent submission when a required reason is empty.

---

### 6. Loading / processing state

The dialog must support a processing/loading state.

While an action is being executed:

- Disable the relevant buttons
- Prevent duplicate submissions
- Show an appropriate loading label/state
- Keep the dialog open until the action completes

---

### 7. Replace browser-native dialogs

Find and replace relevant uses of:

```ts
window.alert();
```
