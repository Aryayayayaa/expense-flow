import type { OcrResult } from "../types/ocr";

/*
 * --------------------------------------------------------------------------
 * Numeric Amount Parser
 * --------------------------------------------------------------------------
 *
 * Converts a string containing a monetary value into a number.
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
 * --------------------------------------------------------------------------
 * Amount Parser
 * --------------------------------------------------------------------------
 *
 * Attempts to identify the FINAL amount payable by the customer.
 *
 * Priority:
 *
 *   1. Explicit final amount labels
 *   2. Tax-inclusive totals
 *   3. Generic receipt totals
 *   4. Currency-prefixed amounts
 *
 * Important:
 *
 * Receipt OCR does not always preserve the visual layout.
 *
 * For example, the receipt may visually contain:
 *
 *   Eat-In Total       188.00
 *
 * but Mindee may return:
 *
 *   Eat-In Total
 *   188.00
 *
 * Therefore this parser checks BOTH:
 *
 *   - the same line
 *   - the following line
 */
function parseAmount(text: string): number | null {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  /*
   * Matches monetary-looking values.
   *
   * Examples:
   *
   *   188.00
   *   1,234.50
   *   ₹188.00
   *   Rs. 188.00
   *   INR 188.00
   */
  const numberPattern = /(?:₹|rs\.?|inr|\$|€|£)?\s*\d[\d,]*(?:\.\d{1,2})?/gi;

  /*
   * ------------------------------------------------------------------------
   * Helper: extract amount from a line
   * ------------------------------------------------------------------------
   */
  function extractAmountFromLine(line: string): number | null {
    const matches = line.match(numberPattern);

    if (!matches || matches.length === 0) {
      return null;
    }

    /*
     * If a line somehow contains multiple numbers, the last one is
     * generally the monetary value associated with the label.
     *
     * Example:
     *
     *   GST @ 2.5%  4.48
     *
     * We want 4.48 rather than 2.5.
     */
    for (let index = matches.length - 1; index >= 0; index--) {
      const amount = parseNumericAmount(matches[index]);

      if (amount !== null) {
        return amount;
      }
    }

    return null;
  }

  /*
   * ------------------------------------------------------------------------
   * Helper: extract amount from current line OR next line
   * ------------------------------------------------------------------------
   *
   * This is particularly important for OCR because labels and values may
   * be separated into different lines.
   */
  function extractAmountNearLine(index: number): number | null {
    /*
     * First check the same line.
     */
    const sameLineAmount = extractAmountFromLine(lines[index]);

    if (sameLineAmount !== null) {
      return sameLineAmount;
    }

    /*
     * Then check the immediately following line.
     *
     * Example:
     *
     *   Eat-In Total
     *   188.00
     */
    const nextLine = lines[index + 1];

    if (nextLine) {
      const nextLineAmount = extractAmountFromLine(nextLine);

      if (nextLineAmount !== null) {
        return nextLineAmount;
      }
    }

    return null;
  }

  /*
   * ------------------------------------------------------------------------
   * 1. Highest priority: explicit final amount labels
   * ------------------------------------------------------------------------
   *
   * These labels strongly indicate the final payable amount.
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

    /*
     * Receipt-specific final-total formats.
     *
     * For example:
     *
     *   Eat-In Total
     *   188.00
     *
     * This is the format visible on the provided receipt.
     */
    /\beat[\s-]*in\s*total\b/i,
    /\btotal\s*bill\b/i,
    /\btotal\s*sale\b/i,
    /\btotal\s*purchase\b/i,
  ];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const isFinalAmountLine = finalAmountPatterns.some((pattern) =>
      pattern.test(line),
    );

    if (!isFinalAmountLine) {
      continue;
    }

    const amount = extractAmountNearLine(index);

    if (amount !== null) {
      return amount;
    }
  }

  /*
   * ------------------------------------------------------------------------
   * 2. Tax-inclusive totals
   * ------------------------------------------------------------------------
   *
   * Examples:
   *
   *   Total including GST 188.00
   *   Total including tax
   *   188.00
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

    const amount = extractAmountNearLine(index);

    if (amount !== null) {
      return amount;
    }
  }

  /*
   * ------------------------------------------------------------------------
   * 3. Generic receipt total
   * ------------------------------------------------------------------------
   *
   * Many receipts simply use:
   *
   *   Total
   *   188.00
   *
   * or:
   *
   *   Total 188.00
   *
   * We therefore check both the current line and the next line.
   *
   * However, we explicitly exclude:
   *
   *   Sub-Total
   *   Taxable Amount
   *   Before Tax
   *
   * because those are not the final payable amount.
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

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (!/\btotal\b/i.test(line)) {
      continue;
    }

    if (excludedPatterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    const amount = extractAmountNearLine(index);

    if (amount !== null) {
      return amount;
    }
  }

  /*
   * ------------------------------------------------------------------------
   * 4. Payment-line fallback
   * ------------------------------------------------------------------------
   *
   * Some receipts do not clearly expose a "Total" amount but repeat the
   * final amount under the payment method.
   *
   * Example:
   *
   *   Total
   *   188.00
   *   Card
   *   188.00
   *
   * We only use this as a fallback because payment lines can sometimes
   * contain unrelated values.
   */
  const paymentPatterns = [
    /\bcard\b/i,
    /\bcash\b/i,
    /\bupi\b/i,
    /\bcredit\s*card\b/i,
    /\bdebit\s*card\b/i,
    /\bpayment\b/i,
    /\bpaid\b/i,
  ];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (!paymentPatterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    const amount = extractAmountNearLine(index);

    if (amount !== null) {
      return amount;
    }
  }

  /*
   * ------------------------------------------------------------------------
   * 5. Currency-prefixed amount fallback
   * ------------------------------------------------------------------------
   *
   * Used when the receipt contains values such as:
   *
   *   ₹188.00
   *   Rs. 188.00
   *   INR 188.00
   *
   * The last currency-prefixed amount is generally closest to the final
   * payable amount.
   */
  const currencyMatches = text.match(
    /(?:₹|rs\.?|inr)\s*\d[\d,]*(?:\.\d{1,2})?/gi,
  );

  if (currencyMatches && currencyMatches.length > 0) {
    const amount = parseNumericAmount(
      currencyMatches[currencyMatches.length - 1],
    );

    if (amount !== null) {
      return amount;
    }
  }

  /*
   * No reliable amount could be identified.
   */
  return null;
}

/*
 * --------------------------------------------------------------------------
 * Vendor Parser
 * --------------------------------------------------------------------------
 */
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
 * --------------------------------------------------------------------------
 * Date Validation
 * --------------------------------------------------------------------------
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
 * --------------------------------------------------------------------------
 * Date Parser
 * --------------------------------------------------------------------------
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
 * --------------------------------------------------------------------------
 * Time Parser
 * --------------------------------------------------------------------------
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
 * --------------------------------------------------------------------------
 * Expense Date Parser
 * --------------------------------------------------------------------------
 *
 * Combines:
 *
 *   OCR date
 *   +
 *   OCR time
 *
 * into the format expected by:
 *
 *   <input type="datetime-local">
 */
function parseExpenseDate(text: string): string | null {
  const date = parseDate(text);

  if (!date) {
    return null;
  }

  const time = parseTime(text) ?? "00:00";

  return `${date}T${time}`;
}

/*
 * --------------------------------------------------------------------------
 * Public Parser
 * --------------------------------------------------------------------------
 */
export function parseReceiptText(text: string): OcrResult {
  return {
    vendor: parseVendor(text),
    amount: parseAmount(text),
    expenseDate: parseExpenseDate(text),
    rawText: text,
  };
}
