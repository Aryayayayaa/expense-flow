import { del, issueSignedToken, presignUrl } from "@vercel/blob";

import { getCloudinary } from "@/lib/cloudinary";

import {
  isSupportedReceiptMimeType,
  RECEIPT_MIME_EXTENSIONS,
} from "./receipt-constants";

const CLOUDINARY_PATH_PREFIX = "cloudinary:v1:";
const RECEIPT_VIEW_TTL_MS = 5 * 60 * 1000;

type CloudinaryReceiptLocation = {
  deliveryType: string;
  resourceType: string;
  format: string;
  publicId: string;
};

export type StoredReceipt = {
  url: string;
  path: string;
};

function isCloudinaryPath(path: string) {
  return path.startsWith("cloudinary:");
}

function encodeCloudinaryPath(location: CloudinaryReceiptLocation) {
  return `${CLOUDINARY_PATH_PREFIX}${location.deliveryType}:${location.resourceType}:${location.format}:${location.publicId}`;
}

function parseCloudinaryPath(path: string): CloudinaryReceiptLocation {
  if (!path.startsWith(CLOUDINARY_PATH_PREFIX)) {
    throw new Error("Invalid Cloudinary receipt path.");
  }

  const encoded = path.slice(CLOUDINARY_PATH_PREFIX.length);
  const [deliveryType, resourceType, format, ...publicIdParts] =
    encoded.split(":");
  const publicId = publicIdParts.join(":");

  if (!deliveryType || !resourceType || !format || !publicId) {
    throw new Error("Invalid Cloudinary receipt path.");
  }

  return {
    deliveryType,
    resourceType,
    format,
    publicId,
  };
}

async function getBlobReceiptViewUrl(pathname: string) {
  const validUntil = Date.now() + RECEIPT_VIEW_TTL_MS;

  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    pathname,
    operation: "get",
    access: "private",
    validUntil,
  });

  return presignedUrl;
}

function getCloudinaryReceiptViewUrl(path: string) {
  const location = parseCloudinaryPath(path);
  const cloudinary = getCloudinary();
  const expiresAt = Math.floor((Date.now() + RECEIPT_VIEW_TTL_MS) / 1000);

  return cloudinary.utils.private_download_url(
    location.publicId,
    location.format,
    {
      resource_type: location.resourceType,
      type: location.deliveryType,
      expires_at: expiresAt,
      attachment: false,
    },
  );
}

async function getCloudinaryReceiptBuffer(path: string): Promise<Buffer> {
  const signedUrl = getCloudinaryReceiptViewUrl(path);

  const response = await fetch(signedUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to read the existing receipt. Status: ${response.status}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function uploadReceiptToCloudinary(input: {
  buffer: Buffer;
  mimeType: string;
  expenseId: number;
}): Promise<StoredReceipt> {
  if (!isSupportedReceiptMimeType(input.mimeType)) {
    throw new Error(
      "Unsupported receipt format. Please upload JPG, PNG, WEBP, or PDF.",
    );
  }

  const format = RECEIPT_MIME_EXTENSIONS[input.mimeType];
  const resourceType = input.mimeType === "application/pdf" ? "raw" : "image";
  const cloudinary = getCloudinary();

  const result = await cloudinary.uploader.upload(
    `data:${input.mimeType};base64,${input.buffer.toString("base64")}`,
    {
      folder: `expenseflow/receipts/expenses/${input.expenseId}`,
      public_id: `original-receipt-${Date.now()}`,
      resource_type: resourceType,
      type: "private",
      format,
      overwrite: false,
    },
  );

  const deliveryType = result.type || "private";
  const storedResourceType = result.resource_type || resourceType;
  const storedFormat = result.format || format;

  return {
    url: result.secure_url,
    path: encodeCloudinaryPath({
      deliveryType,
      resourceType: storedResourceType,
      format: storedFormat,
      publicId: result.public_id,
    }),
  };
}

export async function getReceiptViewUrl(
  ocrReceiptPath: string | null,
): Promise<string> {
  if (!ocrReceiptPath) {
    throw new Error("No original receipt attached.");
  }

  if (isCloudinaryPath(ocrReceiptPath)) {
    return getCloudinaryReceiptViewUrl(ocrReceiptPath);
  }

  return getBlobReceiptViewUrl(ocrReceiptPath);
}

export async function getStoredReceiptBuffer(
  receiptPath: string | null,
): Promise<Buffer | null> {
  if (!receiptPath) {
    return null;
  }

  if (isCloudinaryPath(receiptPath)) {
    return getCloudinaryReceiptBuffer(receiptPath);
  }

  const validUntil = Date.now() + RECEIPT_VIEW_TTL_MS;

  const signedToken = await issueSignedToken({
    pathname: receiptPath,
    operations: ["get"],
    validUntil,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    pathname: receiptPath,
    operation: "get",
    access: "private",
    validUntil,
  });

  const response = await fetch(presignedUrl);

  if (!response.ok) {
    throw new Error("Unable to read the existing receipt.");
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function deleteStoredReceipt(path: string | null) {
  if (!path) {
    return;
  }

  if (isCloudinaryPath(path)) {
    const location = parseCloudinaryPath(path);
    const cloudinary = getCloudinary();

    await cloudinary.uploader.destroy(location.publicId, {
      resource_type: location.resourceType,
      type: location.deliveryType,
      invalidate: true,
    });

    return;
  }

  await del(path);
}
