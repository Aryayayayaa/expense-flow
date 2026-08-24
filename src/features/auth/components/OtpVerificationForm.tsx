// src/features/auth/components/OtpVerificationForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";

import {
  requestPasswordResetAction,
  verifyPasswordResetOtpAction,
} from "../actions/password-reset-actions";

type Props = {
  email: string;
};

const initialState = {
  success: false,
  message: "",
  errors: {},
};

const OTP_DURATION_SECONDS = 60;

export default function OtpVerificationForm({ email }: Props) {
  const [state, formAction, pending] = useActionState(
    verifyPasswordResetOtpAction,
    initialState,
  );

  const [secondsRemaining, setSecondsRemaining] =
    useState(OTP_DURATION_SECONDS);

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [secondsRemaining]);

  async function handleResend() {
    if (resending || secondsRemaining > 0) {
      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const formData = new FormData();

      formData.set("email", email);

      const result = await requestPasswordResetAction(initialState, formData);

      /*
       * Successful request redirects to /otp.
       * This branch mainly handles unexpected non-redirect responses.
       */
      if (!result.success) {
        setResendMessage(result.message || "Unable to send a new OTP.");
        return;
      }

      setSecondsRemaining(OTP_DURATION_SECONDS);
    } catch (error) {
      /*
       * redirect() is intentionally thrown by the server action.
       * Next.js handles that redirect automatically.
       */
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        return;
      }

      console.error("Resend OTP error:", error);

      setResendMessage("Unable to send a new OTP.");
    } finally {
      setResending(false);
    }
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const countdown = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="w-full max-w-md">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="email" value={email} />

        <div>
          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            OTP
          </label>

          <input
            id="otp"
            type="text"
            name="otp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="000000"
          />

          {state.errors?.otp?.[0] && (
            <p className="mt-1 text-sm text-red-600">{state.errors.otp[0]}</p>
          )}
        </div>

        {state.message && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <div className="text-center">
          {secondsRemaining > 0 ? (
            <p className="text-sm text-slate-500">
              OTP expires in{" "}
              <span className="font-semibold text-slate-700">{countdown}</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-red-600">OTP expired.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending || secondsRemaining <= 0}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || secondsRemaining > 0}
          className="text-sm font-medium text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {resending ? "Sending new OTP..." : "Send New OTP"}
        </button>
      </div>

      {resendMessage && (
        <p className="mt-2 text-center text-sm text-red-600">{resendMessage}</p>
      )}
    </div>
  );
}
