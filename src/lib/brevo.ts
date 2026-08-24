// src/lib/brevo.ts

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type SendBrevoEmailParams = {
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  htmlContent: string;
  textContent?: string;
};

export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: SendBrevoEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "ExpenseFlow";

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured.");
  }

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is not configured.");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [to],
      subject,
      htmlContent,
      ...(textContent ? { textContent } : {}),
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Brevo error:", data);

    throw new Error(data?.message ?? "Unable to send email.");
  }

  return data;
}
