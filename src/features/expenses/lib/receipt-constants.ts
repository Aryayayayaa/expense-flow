export const RECEIPT_MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
} as const;

export const RECEIPT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export type ReceiptMimeType = keyof typeof RECEIPT_MIME_EXTENSIONS;

export function isSupportedReceiptMimeType(
  mimeType: string,
): mimeType is ReceiptMimeType {
  return mimeType in RECEIPT_MIME_EXTENSIONS;
}
