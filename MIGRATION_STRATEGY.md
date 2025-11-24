# D1 Migration Strategy - Router Conversion

## Challenge
The current `server/routers.ts` is 4,831 lines with complex logic that needs to be converted from Express/MySQL to Workers/D1.

## Strategy: Incremental Migration

### Phase 1: Core Infrastructure (✅ Completed)
- [x] Create `drizzle/schema-d1.ts` - SQLite schema
- [x] Create `server/db-d1.ts` - D1 connection
- [x] Create `server/_core/trpc-d1.ts` - tRPC adapter for Workers
- [x] Create `functions/api/trpc/[trpc].ts` - Pages Function entry point
- [x] Update `wrangler.toml` - D1 binding configuration
- [x] Create `drizzle.config.d1.ts` - D1-specific Drizzle config

### Phase 2: Router Migration Approach

Since the router is massive (4,831 lines), we'll use a **modular rewrite** approach:

#### Step 1: Create Stub Router (Now)
Create a minimal `server/routers-d1.ts` that:
- Exports the basic structure
- Includes auth endpoints (login, logout, me)
- Provides a foundation for incremental additions

#### Step 2: Migration Priority Order
1. **Auth endpoints** (highest priority - needed for login)
   - `auth.me`
   - `auth.logout`
   - `auth.localLogin`
   - `auth.changePassword`

2. **Profile endpoints** (high priority - needed for user data)
   - `profile.get`
   - `profile.update`
   - `profile.complete`

3. **Assessment endpoints** (high priority - core feature)
   - `assessment.getQuestions`
   - `assessment.submitAnswers`
   - `assessment.getProgress`

4. **Competency endpoints** (medium priority)
   - `competencies.list`
   - `competencies.getByDomain`
   - `competencies.getUserScores`

5. **Organization endpoints** (medium priority)
   - `organization.getAssessment`
   - `organization.submitAssessment`

6. **Remaining endpoints** (lower priority)
   - Wiki, feedback, changelogs, etc.

#### Step 3: Key Differences to Handle

**MySQL → SQLite Changes:**
```typescript
// MySQL: timestamp() returns Date objects
const user = await db.select().from(users).where(eq(users.id, 1));
console.log(user.createdAt); // Date object

// SQLite/D1: integer timestamps return numbers
const user = await db.select().from(users).where(eq(users.id, 1));
console.log(user.createdAt); // Unix timestamp (number)
// Need to: new Date(user.createdAt * 1000) when displaying
```

**Express Context → Workers Context:**
```typescript
// OLD (Express):
ctx.res.cookie(COOKIE_NAME, token, options);
ctx.res.clearCookie(COOKIE_NAME);

// NEW (Workers):
// Set cookie via Response headers
return new Response(JSON.stringify(data), {
  headers: {
    'Set-Cookie': `${COOKIE_NAME}=${token}; ${serializeOptions(options)}`,
  },
});
```

**Database Connection:**
```typescript
// OLD (Express):
const database = await getDb(); // Pool-based connection

// NEW (D1):
const database = ctx.db; // Already initialized in context
```

### Phase 3: Conversion Script

For each router section, follow this pattern:

```typescript
// 1. Import D1 versions
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc-d1";
import { initializeD1Database } from "./db-d1";
import * as schema from "../drizzle/schema-d1";

// 2. Remove Express-specific code
// - ctx.res.cookie() → Return Response with Set-Cookie header
// - ctx.res.clearCookie() → Return Response with expired cookie
// - await getDb() → Use ctx.db directly

// 3. Update timestamp handling
// - MySQL Date objects → Unix timestamps (integers)
// - new Date() → Math.floor(Date.now() / 1000) or sql`(unixepoch())`

// 4. Update enum handling
// - MySQL ENUM constraints are enforced
// - SQLite text enums need runtime validation (Zod helps here)

// 5. Test incrementally
// - Each router section should be tested before moving to next
```

## Implementation Plan

### Next Steps (After Cloudflare Auth):

1. **Create `server/routers-d1.ts`** - Start with auth router
2. **Implement JWT helpers for Workers** - Web Crypto API based
3. **Test auth flow** - Login, logout, session management
4. **Incrementally add routers** - One module at a time
5. **Update frontend imports** - Point to new D1 endpoints if needed
6. **Migration script** - Convert existing MySQL data to D1

## Estimated Timeline

- Phase 1 (Infrastructure): ✅ **1 hour** (DONE)
- Phase 2 (Auth + Profile + Assessment): **2-3 hours**
- Phase 3 (Competencies + Organizations): **1-2 hours**
- Phase 4 (Remaining endpoints): **1-2 hours**
- Phase 5 (Testing + Bug fixes): **1-2 hours**

**Total: 6-9 hours** (as initially estimated)

## Current Status

✅ Infrastructure completed
⏸️ Waiting for Cloudflare authentication
📋 Ready to proceed with router migration after auth is set up

## Files Created So Far

1. `/drizzle/schema-d1.ts` - Complete SQLite schema (27 tables)
2. `/server/db-d1.ts` - D1 database initialization
3. `/server/_core/trpc-d1.ts` - tRPC adapter for Workers
4. `/functions/api/trpc/[trpc].ts` - Pages Function handler
5. `/drizzle.config.d1.ts` - D1 Drizzle configuration
6. `/wrangler.toml` - Updated with D1 bindings (placeholder ID)

## Next File to Create

`/server/routers-d1.ts` - Start with minimal auth router, then expand incrementally.
