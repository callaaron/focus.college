import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ULTRA aggressive caching - 30 minutes stale time
      staleTime: 30 * 60 * 1000,
      // Cache data for 60 minutes (maximum retention)
      gcTime: 60 * 60 * 1000,
      // No retry for faster failures
      retry: 0,
      // Don't refetch on window focus for better performance
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
      // Don't refetch when network reconnects
      refetchOnReconnect: false,
      // Network mode - online only for better UX
      networkMode: 'online',
      // Keep previous data while fetching new data (smoother transitions)
      placeholderData: (previousData: any) => previousData,
      // Enable structural sharing for better performance
      structuralSharing: true,
    },
    mutations: {
      // No retry for mutations
      retry: 0,
      // Network mode
      networkMode: 'online',
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Clear stored token on unauthorized
  localStorage.removeItem('auth_token');
  // Redirect to local login page
  window.location.href = '/login';
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      // Batch multiple requests together for better performance
      maxURLLength: 2083, // Maximum URL length for batching
      // Headers configuration
      headers() {
        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');
        return {
          // Add Authorization header if token exists
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers || {}),
          },
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
