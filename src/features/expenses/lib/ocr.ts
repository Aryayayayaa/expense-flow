import type { OcrResult } from "../types/ocr";
import { parseReceiptText } from "./parseReceiptText";

const apiKey = process.env.MINDEE_API_KEY;
const modelId = process.env.MINDEE_OCR_MODEL_ID;

if (!apiKey) {
  throw new Error("MINDEE_API_KEY is not configured.");
}

if (!modelId) {
  throw new Error("MINDEE_OCR_MODEL_ID is not configured.");
}

const mindeeApiKey: string = apiKey;
const mindeeModelId: string = modelId;

const MINDEE_BASE_URL = "https://api-v2.mindee.net";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractReceiptData(
  fileData: string,
  fileName: string,
): Promise<OcrResult> {
  /*
   * ---------------------------------------------------------
   * STEP 1: Decode Base64 file
   * ---------------------------------------------------------
   */

  const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;

  if (!base64Data) {
    throw new Error("Receipt file data is empty.");
  }

  const buffer = Buffer.from(base64Data, "base64");

  if (buffer.length === 0) {
    throw new Error("Receipt file could not be decoded.");
  }

  console.log("OCR file:", {
    fileName,
    size: buffer.length,
  });

  /*
   * ---------------------------------------------------------
   * STEP 2: Enqueue OCR job
   * ---------------------------------------------------------
   */

  const formData = new FormData();

  const fileBlob = new Blob([buffer]);

  formData.append("file", fileBlob, fileName);
  formData.append("model_id", mindeeModelId);

  const enqueueResponse = await fetch(
    `${MINDEE_BASE_URL}/v2/products/ocr/enqueue`,
    {
      method: "POST",
      headers: {
        Authorization: mindeeApiKey,
        Accept: "application/json",
      },
      body: formData,
      cache: "no-store",
    },
  );

  const enqueueData = await enqueueResponse.json();

  if (!enqueueResponse.ok) {
    console.error("Mindee Enqueue Error:", enqueueData);

    throw new Error(
      enqueueData?.detail ||
        enqueueData?.message ||
        "Mindee OCR request failed.",
    );
  }

  const job = enqueueData?.job;

  if (!job) {
    console.error("Mindee Enqueue Response:", enqueueData);

    throw new Error("Mindee did not return an OCR job.");
  }

  const jobId = job.id;

  const pollingUrl = job.pollingUrl ?? job.polling_url;

  if (!pollingUrl) {
    console.error("Mindee Job Response:", job);

    throw new Error("Mindee did not return a polling URL.");
  }

  console.log("Mindee OCR job created:", {
    jobId,
    pollingUrl,
  });

  /*
   * ---------------------------------------------------------
   * STEP 3: Poll OCR job
   * ---------------------------------------------------------
   *
   * Mindee can return the inference result directly from the
   * polling endpoint even though the job status may not be
   * returned as "Processed".
   *
   * This is important because your direct test showed exactly
   * that behavior.
   * ---------------------------------------------------------
   */

  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(1500);

    try {
      const pollingResponse = await fetch(pollingUrl, {
        method: "GET",
        headers: {
          Authorization: mindeeApiKey,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const pollingData = await pollingResponse.json();

      /*
       * -------------------------------------------------------
       * Temporary 404
       * -------------------------------------------------------
       */

      if (pollingResponse.status === 404) {
        console.warn(
          `Mindee OCR polling attempt ${attempt}/${maxAttempts}: ` +
            "job temporarily unavailable (404). Retrying...",
        );

        continue;
      }

      /*
       * -------------------------------------------------------
       * Other HTTP errors
       * -------------------------------------------------------
       */

      if (!pollingResponse.ok) {
        console.error("Mindee Polling Error:", pollingData);

        throw new Error(
          pollingData?.detail ||
            pollingData?.message ||
            "Mindee OCR polling failed.",
        );
      }

      /*
       * -------------------------------------------------------
       * IMPORTANT:
       *
       * The direct Mindee test showed that a successful
       * response can contain:
       *
       * {
       *   inference: {
       *     result: {
       *       pages: [...]
       *     }
       *   }
       * }
       *
       * instead of:
       *
       * {
       *   job: {
       *     status: "Processed"
       *   }
       * }
       *
       * Therefore check for inference FIRST.
       * -------------------------------------------------------
       */

      const inference = pollingData?.inference;

      if (inference?.result?.pages) {
        console.log("Mindee OCR processing completed.");

        const rawText = inference.result.pages
          .map((page: { content?: string }) => {
            return page?.content ?? "";
          })
          .filter(Boolean)
          .join("\n");

        console.log("Mindee OCR raw text received.");

        return parseReceiptText(rawText);
      }

      /*
       * -------------------------------------------------------
       * Normal job response
       * -------------------------------------------------------
       */

      const pollingJob = pollingData?.job;

      const status = pollingJob?.status;

      console.log(`Mindee OCR attempt ${attempt}/${maxAttempts}:`, status);

      /*
       * -------------------------------------------------------
       * Job failed
       * -------------------------------------------------------
       */

      if (status === "Failed") {
        console.error("Mindee Job Failed:", pollingData);

        const jobError = pollingJob?.error;

        throw new Error(
          jobError?.detail ||
            jobError?.message ||
            "Mindee OCR processing failed.",
        );
      }

      /*
       * -------------------------------------------------------
       * Job processed
       * -------------------------------------------------------
       */

      if (status === "Processed") {
        const resultUrl = pollingJob?.resultUrl ?? pollingJob?.result_url;

        if (!resultUrl) {
          console.error("Mindee Processed Job:", pollingData);

          throw new Error(
            "Mindee completed OCR but did not return a result URL.",
          );
        }

        const resultResponse = await fetch(resultUrl, {
          method: "GET",
          headers: {
            Authorization: mindeeApiKey,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const resultData = await resultResponse.json();

        if (!resultResponse.ok) {
          console.error("Mindee Result Error:", resultData);

          throw new Error(
            resultData?.detail ||
              resultData?.message ||
              "Unable to retrieve Mindee OCR result.",
          );
        }

        const resultPages = resultData?.inference?.result?.pages;

        if (!resultPages) {
          throw new Error("Mindee OCR result did not contain any pages.");
        }

        const rawText = resultPages
          .map((page: { content?: string }) => {
            return page?.content ?? "";
          })
          .filter(Boolean)
          .join("\n");

        console.log("Mindee OCR result received.");

        return parseReceiptText(rawText);
      }

      /*
       * -------------------------------------------------------
       * No usable result yet
       * -------------------------------------------------------
       */

      if (!status) {
        console.warn(
          `Mindee OCR attempt ${attempt}/${maxAttempts}: ` +
            "No job status or inference returned. Retrying...",
        );
      }
    } catch (error) {
      /*
       * -------------------------------------------------------
       * Retry transient polling errors
       * -------------------------------------------------------
       */

      if (attempt === maxAttempts) {
        console.error("Mindee Polling Error:", error);

        throw error;
      }

      console.warn(
        `Mindee OCR polling attempt ${attempt}/${maxAttempts} ` +
          "encountered a temporary error. Retrying...",
        error,
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * STEP 4: Polling timeout
   * ---------------------------------------------------------
   */

  throw new Error(
    "Mindee OCR processing timed out before a result was available.",
  );
}
