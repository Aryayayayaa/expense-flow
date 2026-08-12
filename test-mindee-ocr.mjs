import fs from "node:fs";

const apiKey = process.env.MINDEE_API_KEY;
const modelId = process.env.MINDEE_OCR_MODEL_ID;

if (!apiKey) {
  throw new Error("MINDEE_API_KEY is missing");
}

if (!modelId) {
  throw new Error("MINDEE_OCR_MODEL_ID is missing");
}

const filePath = process.argv[2];

if (!filePath) {
  throw new Error(
    'Usage: node --env-file=.env.local test-mindee-ocr.mjs "/path/to/receipt.jpg"',
  );
}

const buffer = fs.readFileSync(filePath);

console.log("Testing Mindee directly...");
console.log({
  filePath,
  size: buffer.length,
  modelId,
});

const form = new FormData();

form.append(
  "file",
  new Blob([buffer], {
    type: "image/jpeg",
  }),
  "receipt.jpg",
);

form.append("model_id", modelId);

const enqueueResponse = await fetch(
  "https://api-v2.mindee.net/v2/products/ocr/enqueue",
  {
    method: "POST",
    headers: {
      Authorization: apiKey,
      Accept: "application/json",
    },
    body: form,
  },
);

const enqueueData = await enqueueResponse.json();

console.log("\nENQUEUE:");
console.dir(enqueueData, { depth: 10 });

if (!enqueueResponse.ok) {
  throw new Error(enqueueData?.detail || "Mindee enqueue failed");
}

const pollingUrl = enqueueData.job?.polling_url ?? enqueueData.job?.pollingUrl;

if (!pollingUrl) {
  throw new Error("No polling URL returned");
}

console.log("\nPOLLING URL:");
console.log(pollingUrl);

for (let attempt = 1; attempt <= 10; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log(`\nPOLL ${attempt}/10`);

  const response = await fetch(pollingUrl, {
    method: "GET",
    headers: {
      Authorization: apiKey,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  console.log("HTTP STATUS:", response.status);

  console.dir(data, { depth: 10 });

  if (!response.ok) {
    break;
  }

  const status = data?.job?.status;

  console.log("JOB STATUS:", status);

  if (status === "Processed" || status === "Failed") {
    break;
  }
}
