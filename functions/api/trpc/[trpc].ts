/**
 * Cloudflare Pages Function for tRPC API
 * This handles all tRPC requests at /api/trpc/*
 * 
 * File path: functions/api/trpc/[trpc].ts
 * Route: /api/trpc/* (dynamic routing)
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../server/routers-d1';
import { createD1Context, type Context } from '../../../server/_core/trpc-d1';
import type { Env } from '../../../server/db-d1';

/**
 * Cloudflare Pages Function handler
 * This is the entry point for all /api/trpc/* requests
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: context.request,
    router: appRouter,
    createContext: (opts) => createD1Context({
      ...opts,
      env: context.env,
    }),
    onError: ({ error, path }) => {
      console.error(`tRPC Error on ${path}:`, error);
    },
  });
};
