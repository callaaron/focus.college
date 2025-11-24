import { createTRPCReact } from "@trpc/react-query";
// Import D1 router type for production (Cloudflare Pages)
import type { AppRouter } from "../../../server/routers-d1";

export const trpc = createTRPCReact<AppRouter>();
