<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WorkSphere Mandatory Project Rules & Architecture Principles

All AI assistant actions and code edits MUST strictly follow the architecture and coding conventions established in `PROJECT_RULES.md`:

1. **Layered Architecture Isolation**:
   - `API Routes (src/app/api/*)`: Must be wrapped in `asynchandler`. Only handle parsing, validation invocation, calling services, and returning `ApiResponse(statusCode, data, message)`. NEVER write SQL queries or complex business logic directly in route handlers.
   - `Validators (src/lib/validators/*)`: Use Zod. Return `{ success: true, data }` or `{ success: false, errors: [{ field, message }] }`.
   - `Services (src/lib/services/*)`: Business logic, password hashing (bcrypt 10 rounds), token hashing (SHA-256), email triggers. Always throw `ApiError`. Interact with DB ONLY through repositories.
   - `Repositories (src/lib/repositories/*)`: Dedicated parameterized SQL queries using `pg.Pool`. NEVER throw raw HTTP errors. Return sanitized records or null.
2. **Error & Response Structures**:
   - Errors: Always throw `ApiError(message, statusCode, [{ field, message }])`.
   - Success: Always return `ApiResponse(statusCode, data, message)`.
   - Security: NEVER return `password_hash` to clients.
3. **Authentication & Token Lifecycle**:
   - Passwords must be hashed with `bcrypt.hash(password, 10)`.
   - Single-use verification/reset tokens must be stored as SHA-256 hashes in DB, with unhashed tokens in email links.
   - Used reset tokens must be deleted immediately (`deletePasswordResetTokens`), and sessions revoked (`deletJWTfromDB`).
4. **Proxy & Middleware**:
   - Keep public routes updated in `src/proxy.ts` (`publicpages`, `apipublicpaths`).
   - Unauthenticated page access falls back to `/`.
   - `Jwt.proxy.ts` decodes via `jose`, throws `TOKEN_EXPIRED` / `TOKEN_INVALID`, validates user existence via internal secret, and sets `user` & `role` headers.
5. **Database**:
   - All child tables referencing `users(id)` must have `ON DELETE CASCADE`.
   - Manage schema changes strictly via migrations in `src/lib/db/migrations/`.
