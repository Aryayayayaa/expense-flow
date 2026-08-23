const REQUEST_DEADLINE_HOURS = 24;
const REQUEST_REMINDER_HOURS_BEFORE_DEADLINE = 6;

export function getRequestDeadline(createdAt = new Date()) {
  return new Date(
    createdAt.getTime() + REQUEST_DEADLINE_HOURS * 60 * 60 * 1000,
  );
}

export function shouldSendRequestReminder(
  deadlineAt: Date,
  reminderSentAt: Date | null,
  now = new Date(),
) {
  if (reminderSentAt) {
    return false;
  }

  const reminderTime =
    deadlineAt.getTime() -
    REQUEST_REMINDER_HOURS_BEFORE_DEADLINE * 60 * 60 * 1000;

  return now.getTime() >= reminderTime && now.getTime() < deadlineAt.getTime();
}

export function isRequestExpired(deadlineAt: Date | null, now = new Date()) {
  if (!deadlineAt) {
    return false;
  }

  return now.getTime() >= deadlineAt.getTime();
}
