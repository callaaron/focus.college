# Package.json Updates for D1 Migration

## Dependencies to Update

### Keep (No Changes Needed)
These packages work fine with D1:
- `drizzle-orm@^0.44.5` - Already supports D1
- `@trpc/server@^11.6.0` - Supports fetch adapter
- `@trpc/client@^11.6.0` - Frontend client
- `@trpc/react-query@^11.6.0` - React integration
- `bcryptjs` - Works in Workers
- `zod` - Works in Workers
- `superjson` - Works in Workers

### Remove (MySQL-Specific)
These are no longer needed:
- ❌ `mysql2` - Not needed for D1
- ❌ `express` - Using Pages Functions instead
- ❌ `@types/express` - Not needed

### Add (D1-Specific)
If not already present:
- ✅ `drizzle-orm` - Already present (supports D1)
- ⚠️ `better-sqlite3` - Only for local dev/testing (optional)
- ⚠️ `@cloudflare/workers-types` - TypeScript types for Workers

## Scripts to Update

### Current Scripts
```json
{
  "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
  "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "db:push": "drizzle-kit generate && drizzle-kit migrate"
}
```

### New Scripts for D1
```json
{
  "dev": "wrangler pages dev dist --d1=DB",
  "dev:vite": "vite",
  "build": "vite build",
  "preview": "wrangler pages dev dist --d1=DB",
  "deploy": "npm run build && wrangler pages deploy dist",
  
  "db:generate": "drizzle-kit generate --config=drizzle.config.d1.ts",
  "db:migrate:local": "wrangler d1 migrations apply focus-college-db --local",
  "db:migrate:remote": "wrangler d1 migrations apply focus-college-db --remote",
  "db:studio": "drizzle-kit studio --config=drizzle.config.d1.ts"
}
```

## Updated package.json (Relevant Sections)

```json
{
  "scripts": {
    "dev": "wrangler pages dev dist --d1=DB --port=3000",
    "dev:vite": "vite",
    "build": "vite build",
    "preview": "wrangler pages dev dist --d1=DB",
    "deploy": "npm run build && wrangler pages deploy dist",
    "check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    
    "db:generate": "drizzle-kit generate --config=drizzle.config.d1.ts",
    "db:migrate:local": "wrangler d1 migrations apply focus-college-db --local",
    "db:migrate:remote": "wrangler d1 migrations apply focus-college-db --remote",
    "db:studio": "drizzle-kit studio --config=drizzle.config.d1.ts",
    
    "_legacy:dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "_legacy:build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "_legacy:start": "NODE_ENV=production node dist/index.js"
  },
  "dependencies": {
    "@trpc/client": "^11.6.0",
    "@trpc/react-query": "^11.6.0",
    "@trpc/server": "^11.6.0",
    "bcryptjs": "^3.0.3",
    "drizzle-orm": "^0.44.5",
    "superjson": "^1.13.3",
    "zod": "^4.1.12",
    // ... (all other React/UI dependencies stay the same)
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241127.0",
    "drizzle-kit": "^0.31.4",
    "wrangler": "^4.0.0",
    // ... (all other dev dependencies)
  }
}
```

## Installation Commands

After updating package.json, run:

```bash
# Remove old dependencies
npm uninstall mysql2 express @types/express

# Add new dev dependencies if needed
npm install -D @cloudflare/workers-types

# Update all dependencies
npm install

# Verify Wrangler is available
npx wrangler --version
```

## Development Workflow Changes

### Old Workflow (Express + MySQL)
```bash
npm run dev  # Starts Express server on port 3000
```

### New Workflow (Pages Functions + D1)
```bash
# Terminal 1: Build frontend and watch for changes
npm run dev:vite

# Terminal 2: Run Pages Functions with D1
npm run dev
```

Or use a single command with Wrangler's built-in dev server:
```bash
npm run dev  # Serves both frontend and Functions with HMR
```

## Notes

1. **Wrangler Dev Server**: The new `wrangler pages dev` command serves both:
   - Static files from `dist/` (built by Vite)
   - Functions from `functions/` directory
   - D1 database (local or remote)

2. **Hot Reload**: Wrangler provides hot reloading for Functions

3. **Environment Variables**: Set in `.dev.vars` file (not `.env`)
   ```
   JWT_SECRET=your-secret-here
   NODE_ENV=development
   ```

4. **TypeScript Types**: Add to `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "types": ["@cloudflare/workers-types"]
     }
   }
   ```
