const apiKey = process.env.MINDEE_API_KEY;
const configuredModelId = process.env.MINDEE_OCR_MODEL_ID;

if (!apiKey) {
  throw new Error("MINDEE_API_KEY is not configured.");
}

if (!configuredModelId) {
  throw new Error("MINDEE_OCR_MODEL_ID is not configured.");
}

const mindeeApiKey: string = apiKey;
const modelId: string = configuredModelId;

const MINDEE_BASE_URL = "https://api-v2.mindee.net";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function extractReceiptData(
  fileData: string,
  fileName: string,
  mimeType?: string,
) {
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
    mimeType,
    size: buffer.length,
  });

  /*
   * -------------------------------------------------------
   * STEP 1: Enqueue OCR job
   * -------------------------------------------------------
   */

  const formData = new FormData();

  const fileBlob = new Blob([buffer], {
    type: mimeType || "image/jpeg",
  });

  formData.append("file", fileBlob, fileName);
  formData.append("model_id", modelId);

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
   * -------------------------------------------------------
   * STEP 2: Poll OCR job
   * -------------------------------------------------------
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
       * -----------------------------------------------------
       * IMPORTANT:
       *
       * Mindee can return the completed OCR inference
       * directly from the polling endpoint.
       *
       * The successful diagnostic request showed:
       *
       * {
       *   inference: {
       *     ...
       *     result: {
       *       pages: [...]
       *     }
       *   }
       * }
       *
       * Therefore, check for `inference` BEFORE looking
       * for `job.status`.
       * -----------------------------------------------------
       */

      if (pollingData?.inference) {
        console.log("Mindee OCR processing completed.");

        console.log("Mindee OCR result received.");

        return pollingData.inference;
      }

      /*
       * -----------------------------------------------------
       * A temporary 404 can occur while the job is
       * transitioning.
       * Retry instead of immediately failing.
       * -----------------------------------------------------
       */

      if (pollingResponse.status === 404) {
        console.warn(
          `Mindee OCR polling attempt ${attempt}/${maxAttempts}: ` +
            `job temporarily unavailable (404). Retrying...`,
        );

        continue;
      }

      if (!pollingResponse.ok) {
        console.error("Mindee Polling Error:", pollingData);

        throw new Error(
          pollingData?.detail ||
            pollingData?.message ||
            "Mindee OCR polling failed.",
        );
      }

      const pollingJob = pollingData?.job;

      const status = pollingJob?.status;

      console.log(`Mindee OCR attempt ${attempt}/${maxAttempts}:`, status);

      /*
       * -----------------------------------------------------
       * Job failed
       * -----------------------------------------------------
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
       * -----------------------------------------------------
       * Job completed with the traditional Processed status
       *
       * Keep this fallback in case Mindee returns a job object
       * with a result URL instead of returning the inference
       * directly.
       * -----------------------------------------------------
       */

      if (status === "Processed") {
        const resultUrl = pollingJob?.resultUrl ?? pollingJob?.result_url;

        if (!resultUrl) {
          console.error("Mindee Processed Job:", pollingData);

          throw new Error(
            "Mindee completed OCR but did not return a result URL.",
          );
        }

        console.log("Mindee OCR processing completed.");

        /*
         * ---------------------------------------------------
         * STEP 3: Retrieve OCR result
         * ---------------------------------------------------
         */

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

        console.log("Mindee OCR result received.");

        return resultData?.inference ?? resultData;
      }

      /*
       * -----------------------------------------------------
       * Job is still processing.
       * Continue polling.
       * -----------------------------------------------------
       */

      if (!status) {
        console.warn(
          `Mindee OCR attempt ${attempt}/${maxAttempts}: ` +
            "No job status or inference returned. Retrying...",
        );
      }
    } catch (error) {
      /*
       * If this is the final polling attempt, surface the error.
       * Otherwise retry transient polling failures.
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
   * -------------------------------------------------------
   * STEP 4: Polling timeout
   * -------------------------------------------------------
   */

  throw new Error(
    "Mindee OCR processing timed out before a result was available.",
  );
}
