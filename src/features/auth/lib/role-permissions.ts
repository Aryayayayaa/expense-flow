import type { Role } from "@prisma/client";

export function canReviewRoleRequest(reviewerRole: Role, requestedRole: Role) {
  if (requestedRole !== "ADMIN" && requestedRole !== "HR") {
    return false;
  }

  return reviewerRole === "HR" || reviewerRole === "ADMIN";
}

export function canReviewOwnRoleRequest(
  reviewerId: number,
  requesterId: number,
) {
  return reviewerId !== requesterId;
}

export function canApproveExpense(role: Role) {
  return role === "ADMIN";
}

export function canVerifyEmployee(role: Role) {
  return role === "HR" || role === "ADMIN";
}
