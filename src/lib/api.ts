export async function fetchData<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}
