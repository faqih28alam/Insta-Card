export const apiFetch = (path: string, options?: RequestInit) =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: "include",
  });
