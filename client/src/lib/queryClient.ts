import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get the API base URL
const getBaseUrl = () => {
  return window.location.origin;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL starts with /api
  const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
  const fullUrl = `${getBaseUrl()}${apiUrl}`;

  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Accept": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const apiUrl = url.startsWith('/api') ? url : `/api${url}`;
    const fullUrl = `${getBaseUrl()}${apiUrl}`;

    const res = await fetch(fullUrl, {
      credentials: "include",
      mode: "cors",
      headers: {
        "Accept": "application/json",
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});