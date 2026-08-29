// src/features/auth/actions/password-reset-actions.ts

"use server";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";

import { newPasswordSchema } from "../schemas/password-schema";

type PasswordResetState = {
  success: boolean;
  message: string;
  errors?: {
    email?: string[];
    otp?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

const OTP_EXPIRY_MINUTES = 1;
const MAX_OTP_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function requestPasswordResetAction(
  prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const emailValue = formData.get("email");

  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  if (!email) {
    return {
      success: false,
      message: "",
      errors: {
        email: ["Email is required."],
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });

  /*
   * Do not reveal whether an email belongs to an account.
   */
  if (!user || !user.isActive) {
    return {
      success: true,
      message:
        "If an active account exists with this email, an OTP has been sent.",
    };
  }

  /*
   * Invalidate every previous password-reset request.
   */
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const otp = generateOtp();
  const otpHash = hashValue(otp);

  /*
   * OTP is valid for exactly 1 minute.
   */
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      otpHash,
      expiresAt,
      attempts: 0,
    },
  });

  try {
    await sendBrevoEmail({
      to: {
        email: user.email,
        name: user.name,
      },
      subject: "ExpenseFlow Password Reset OTP",
      htmlContent: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            color: #1e293b;
          "
        >
          <h2>Expense<span style="color: #2563eb;">Flow</span></h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your ExpenseFlow password.
          </p>

          <p>
            Your verification OTP is:
          </p>

          <div
            style="
              margin: 24px 0;
              padding: 18px;
              background: #f1f5f9;
              border-radius: 8px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>1 minute</strong>.
          </p>

          <p>
            If the OTP expires, return to ExpenseFlow and request a new OTP.
          </p>

          <p>
            If you did not request a password reset, you can safely ignore
            this email.
          </p>
        </div>
      `,
      textContent: `Your ExpenseFlow password reset OTP is ${otp}. This OTP is valid for 1 minute.`,
    });
  } catch (error) {
    console.error("Password reset email error:", error);

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        otpHash,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return {
      success: false,
      message: "Unable to send the password reset email.",
    };
  }

  redirect(`/otp?email=${encodeURIComponent(user.email)}`);
}

export async function verifyPasswordResetOtpAction(
  prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const emailValue = formData.get("email");
  const otpValue = formData.get("otp");

  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  const otp = typeof otpValue === "string" ? otpValue.trim() : "";

  if (!email) {
    return {
      success: false,
      message: "",
      errors: {
        email: ["Email is required."],
      },
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    return {
      success: false,
      message: "",
      errors: {
        otp: ["OTP must be exactly 6 digits."],
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return {
      success: false,
      message: "",
      errors: {
        otp: ["Invalid or expired OTP."],
      },
    };
  }

  const resetRequest = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!resetRequest) {
    return {
      success: false,
      message: "",
      errors: {
        otp: ["Invalid or expired OTP. Please request a new OTP."],
      },
    };
  }

  /*
   * Check expiry BEFORE checking the OTP.
   */
  if (new Date() > resetRequest.expiresAt) {
    await prisma.passwordResetToken.update({
      where: {
        id: resetRequest.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return {
      success: false,
      message: "",
      errors: {
        otp: ["OTP has expired. Please request a new OTP."],
      },
    };
  }

  if (resetRequest.attempts >= MAX_OTP_ATTEMPTS) {
    return {
      success: false,
      message: "",
      errors: {
        otp: ["Maximum OTP attempts exceeded. Please request a new OTP."],
      },
    };
  }

  const enteredOtpHash = hashValue(otp);

  const otpMatches = enteredOtpHash === resetRequest.otpHash;

  if (!otpMatches) {
    const updatedAttempts = resetRequest.attempts + 1;

    await prisma.passwordResetToken.update({
      where: {
        id: resetRequest.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    const attemptsRemaining = Math.max(MAX_OTP_ATTEMPTS - updatedAttempts, 0);

    return {
      success: false,
      message: "",
      errors: {
        otp:
          attemptsRemaining > 0
            ? [
                `Invalid OTP. ${attemptsRemaining} attempt${
                  attemptsRemaining === 1 ? "" : "s"
                } remaining.`,
              ]
            : ["Maximum OTP attempts exceeded. Please request a new OTP."],
      },
    };
  }

  /*
   * OTP is valid.
   *
   * Generate a separate short-lived reset token.
   * The OTP itself is never used as the password-reset URL token.
   */
  const resetToken = generateResetToken();

  await prisma.passwordResetToken.update({
    where: {
      id: resetRequest.id,
    },
    data: {
      verifiedAt: new Date(),
      resetTokenHash: hashValue(resetToken),
      resetTokenExpiresAt: new Date(
        Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
      ),
    },
  });

  redirect(`/new-password?token=${encodeURIComponent(resetToken)}`);
}

export async function resetPasswordAction(
  prevState: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const tokenValue = formData.get("token");
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");

  const token = typeof tokenValue === "string" ? tokenValue.trim() : "";

  const password = typeof passwordValue === "string" ? passwordValue : "";

  const confirmPassword =
    typeof confirmPasswordValue === "string" ? confirmPasswordValue : "";

  if (!token) {
    return {
      success: false,
      message: "Invalid password reset link.",
    };
  }

  /*
   * Validates:
   * - minimum 8 characters
   * - maximum 100 characters
   * - password confirmation
   */
  const result = newPasswordSchema.safeParse({
    password,
    confirmPassword,
  });

  if (!result.success) {
    return {
      success: false,
      message: "",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const resetRequest = await prisma.passwordResetToken.findFirst({
    where: {
      resetTokenHash: hashValue(token),
      verifiedAt: {
        not: null,
      },
      usedAt: null,
      resetTokenExpiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          isActive: true,
          password: true,
        },
      },
    },
  });

  if (!resetRequest || !resetRequest.user.isActive) {
    return {
      success: false,
      message: "Invalid or expired password reset link.",
    };
  }

  /*
   * Check whether the new password is the same as the user's
   * existing password.
   *
   * The existing password hash was already retrieved as part
   * of the reset-request query above, so this does NOT create
   * another database call.
   */
  if (resetRequest.user.password) {
    const isSamePassword = await bcrypt.compare(
      result.data.password,
      resetRequest.user.password,
    );

    if (isSamePassword) {
      return {
        success: false,
        message:
          "Enter a new password to reset password for the registered account.",
      };
    }
  }

  const hashedPassword = await bcrypt.hash(result.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetRequest.userId,
      },
      data: {
        password: hashedPassword,
      },
    }),

    /*
     * Mark the successful reset request as used.
     */
    prisma.passwordResetToken.update({
      where: {
        id: resetRequest.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),

    /*
     * Invalidate every other active reset request
     * belonging to the same user.
     */
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetRequest.userId,
        id: {
          not: resetRequest.id,
        },
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  redirect("/login?reset=success");
}
