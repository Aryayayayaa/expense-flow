export async function uploadReceiptFile(expenseId: number, file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(`/api/expenses/${expenseId}/ocr-receipt`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.url || !data.path) {
    throw new Error(data.error ?? "Unable to upload receipt.");
  }

  return {
    url: data.url as string,
    path: data.path as string,
  };
}
