import type { OcrResult } from "../types/ocr";

/*
 * Parse a numeric amount from a string.
 *
 * Supports:
 *   84
 *   84.00
 *   1,234.50
 *   ₹84
 *   Rs. 84
 *   INR 84
 */
function parseNumericAmount(value: string): number | null {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/[₹$€£]/g, "")
    .replace(/\b(?:INR|Rs\.?)\b/gi, "")
    .trim();

  const match = cleaned.match(/\d+(?:\.\d{1,2})?/);

  if (!match) {
    return null;
  }

  const amount = Number(match[0]);

  return Number.isFinite(amount) ? amount : null;
}

/*
 * Extract the amount that most likely represents the final amount
 * payable by the customer.
 *
 * Priority:
 *
 *   1. Explicit final amount labels
 *      - Grand Total
 *      - Total Amount
 *      - Amount Due
 *      - Amount Payable
 *      - Net Payable
 *      - AMOUNT
 *      - Balance
 *
 *   2. Tax-inclusive labels
 *
 *   3. Generic Total
 *
 *   4. Currency-prefixed amount fallback
 *
 * Pre-tax values such as Sub-total and Taxable Amount are ignored.
 */
function parseAmount(text: string): number | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const numberPattern = /(?:₹|rs\.?|inr|\$|€|£)?\s*\d[\d,]*(?:\.\d{1,2})?/gi;

  /*
   * Highest priority:
   * Explicit final/payable amount labels.
   *
   * This handles both:
   *
   *   AMOUNT 84.80
   *
   * and OCR where the label and value are on separate lines:
   *
   *   AMOUNT
   *   84.80
   */
  const finalAmountPatterns = [
    /\bgrand\s*total\b/i,
    /\btotal\s*amount\b/i,
    /\btotal\s*(?:due|payable)\b/i,
    /\bamount\s*(?:due|payable)\b/i,
    /^\s*amount\s*$/i,
    /\bfinal\s*(?:amount|total|payable)\b/i,
    /\bnet\s*(?:amount|total|payable)\b/i,
    /\bpayable\s*amount\b/i,
    /\bto\s*pay\b/i,
    /\bbalance\b/i,
  ];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const isFinalAmountLine = finalAmountPatterns.some((pattern) =>
      pattern.test(line),
    );

    if (!isFinalAmountLine) {
      continue;
    }

    /*
     * First try to find an amount on the same line.
     *
     * Example:
     *   Balance 84.80
     */
    const sameLineMatches = line.match(numberPattern);

    if (sameLineMatches && sameLineMatches.length > 0) {
      const amount = parseNumericAmount(
        sameLineMatches[sameLineMatches.length - 1],
      );

      if (amount !== null) {
        return amount;
      }
    }

    /*
     * OCR may put the amount on the line immediately after
     * the label.
     *
     * Example:
     *
     *   AMOUNT
     *   84.80
     */
    const nextLine = lines[index + 1];

    if (nextLine) {
      const nextLineMatches = nextLine.match(numberPattern);

      if (nextLineMatches && nextLineMatches.length > 0) {
        const amount = parseNumericAmount(
          nextLineMatches[nextLineMatches.length - 1],
        );

        if (amount !== null) {
          return amount;
        }
      }
    }
  }

  /*
   * Second priority:
   * Explicit tax-inclusive amounts.
   */
  const taxInclusivePatterns = [
    /\btotal\s*(?:including|incl\.?|inclusive)\s*(?:tax|gst|vat)\b/i,
    /\b(?:including|incl\.?|inclusive)\s*(?:tax|gst|vat)\b/i,
    /\btax\s*included\b/i,
    /\bgst\s*included\b/i,
    /\bvat\s*included\b/i,
    /\btotal\s*after\s*(?:tax|gst|vat)\b/i,
  ];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const matchesPattern = taxInclusivePatterns.some((pattern) =>
      pattern.test(line),
    );

    if (!matchesPattern) {
      continue;
    }

    const sameLineMatches = line.match(numberPattern);

    if (sameLineMatches && sameLineMatches.length > 0) {
      const amount = parseNumericAmount(
        sameLineMatches[sameLineMatches.length - 1],
      );

      if (amount !== null) {
        return amount;
      }
    }

    const nextLine = lines[index + 1];

    if (nextLine) {
      const nextLineMatches = nextLine.match(numberPattern);

      if (nextLineMatches && nextLineMatches.length > 0) {
        const amount = parseNumericAmount(
          nextLineMatches[nextLineMatches.length - 1],
        );

        if (amount !== null) {
          return amount;
        }
      }
    }
  }

  /*
   * Explicitly ignore common pre-tax values.
   */
  const excludedPatterns = [
    /\bsubtotal\b/i,
    /\bsub\s*total\b/i,
    /\btaxable\s*amount\b/i,
    /\bamount\s*before\s*tax\b/i,
    /\bamount\s*without\s*tax\b/i,
    /\bbefore\s*tax\b/i,
    /\bexcluding\s*tax\b/i,
    /\bexcl\.?\s*tax\b/i,
    /\btaxable\b/i,
  ];

  /*
   * Generic "total" is preferable to arbitrary numbers.
   */
  const genericTotalLines = lines.filter((line) => {
    return (
      /\btotal\b/i.test(line) &&
      !excludedPatterns.some((pattern) => pattern.test(line))
    );
  });

  for (const line of genericTotalLines) {
    const matches = line.match(numberPattern);

    if (!matches || matches.length === 0) {
      continue;
    }

    const amount = parseNumericAmount(matches[matches.length - 1]);

    if (amount !== null) {
      return amount;
    }
  }

  /*
   * Currency-prefixed amount fallback.
   *
   * The last currency amount is usually closest to the final
   * payable amount on a receipt.
   */
  const currencyMatches = text.match(
    /(?:₹|rs\.?|inr|\$|€|£)\s*\d[\d,]*(?:\.\d{1,2})?/gi,
  );

  if (currencyMatches && currencyMatches.length > 0) {
    const amount = parseNumericAmount(
      currencyMatches[currencyMatches.length - 1],
    );

    if (amount !== null) {
      return amount;
    }
  }

  return null;
}

function parseVendor(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  const vendorLine = lines.find((line) =>
    /\b(?:store|shop|restaurant|mart|market|limited|ltd|pvt|private|inc|corp)\b/i.test(
      line,
    ),
  );

  if (vendorLine) {
    return vendorLine;
  }

  return lines[0];
}

/*
 * Convert a detected date into YYYY-MM-DD.
 */
function normalizeDate(
  year: number,
  month: number,
  day: number,
): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

/*
 * Parse a date from common receipt formats.
 */
function parseDate(text: string): string | null {
  const currentYear = new Date().getFullYear();

  /*
   * YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
   */
  const isoLike = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);

  if (isoLike) {
    const result = normalizeDate(
      Number(isoLike[1]),
      Number(isoLike[2]),
      Number(isoLike[3]),
    );

    if (result) {
      return result;
    }
  }

  /*
   * DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY
   */
  const dayMonthYear = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);

  if (dayMonthYear) {
    const result = normalizeDate(
      Number(dayMonthYear[3]),
      Number(dayMonthYear[2]),
      Number(dayMonthYear[1]),
    );

    if (result) {
      return result;
    }
  }

  /*
   * DD Mon YYYY
   */
  const dayMonthNameYear = text.match(
    /\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(20\d{2})\b/i,
  );

  if (dayMonthNameYear) {
    const months: Record<string, number> = {
      jan: 1,
      january: 1,
      feb: 2,
      february: 2,
      mar: 3,
      march: 3,
      apr: 4,
      april: 4,
      may: 5,
      jun: 6,
      june: 6,
      jul: 7,
      july: 7,
      aug: 8,
      august: 8,
      sep: 9,
      september: 9,
      oct: 10,
      october: 10,
      nov: 11,
      november: 11,
      dec: 12,
      december: 12,
    };

    const month = months[dayMonthNameYear[2].toLowerCase()];

    if (month) {
      const result = normalizeDate(
        Number(dayMonthNameYear[3]),
        month,
        Number(dayMonthNameYear[1]),
      );

      if (result) {
        return result;
      }
    }
  }

  /*
   * Mon DD, YYYY
   */
  const monthNameDayYear = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(20\d{2})\b/i,
  );

  if (monthNameDayYear) {
    const months: Record<string, number> = {
      jan: 1,
      january: 1,
      feb: 2,
      february: 2,
      mar: 3,
      march: 3,
      apr: 4,
      april: 4,
      may: 5,
      jun: 6,
      june: 6,
      jul: 7,
      july: 7,
      aug: 8,
      august: 8,
      sep: 9,
      september: 9,
      oct: 10,
      october: 10,
      nov: 11,
      november: 11,
      dec: 12,
      december: 12,
    };

    const month = months[monthNameDayYear[1].toLowerCase()];

    if (month) {
      const result = normalizeDate(
        Number(monthNameDayYear[3]),
        month,
        Number(monthNameDayYear[2]),
      );

      if (result) {
        return result;
      }
    }
  }

  /*
   * DD/MM or DD-MM without year.
   *
   * Use the current year as the best available assumption.
   */
  const dayMonthWithoutYear = text.match(
    /\b(\d{1,2})[-/.](\d{1,2})\b(?![-/.]\d)/,
  );

  if (dayMonthWithoutYear) {
    const result = normalizeDate(
      currentYear,
      Number(dayMonthWithoutYear[2]),
      Number(dayMonthWithoutYear[1]),
    );

    if (result) {
      return result;
    }
  }

  return null;
}

/*
 * Parse a time from common receipt formats.
 */
function parseTime(text: string): string | null {
  const timeMatch = text.match(
    /\b(0?\d|1[0-2]|2[0-3])[:.](\d{2})(?::(\d{2}))?\s*(AM|PM)?\b/i,
  );

  if (!timeMatch) {
    return null;
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[4]?.toUpperCase();

  if (minutes > 59) {
    return null;
  }

  if (meridiem === "AM") {
    if (hours === 12) {
      hours = 0;
    }
  } else if (meridiem === "PM") {
    if (hours !== 12) {
      hours += 12;
    }
  }

  if (hours > 23) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

/*
 * Combine OCR date + OCR time into the exact format expected by
 * <input type="datetime-local">.
 */
function parseExpenseDate(text: string): string | null {
  const date = parseDate(text);

  if (!date) {
    return null;
  }

  const time = parseTime(text) ?? "00:00";

  return `${date}T${time}`;
}

export function parseReceiptText(text: string): OcrResult {
  return {
    vendor: parseVendor(text),
    amount: parseAmount(text),
    expenseDate: parseExpenseDate(text),
    rawText: text,
  };
}
