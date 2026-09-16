# WorkSphere Project Architecture Rules

All coding changes must adhere to the following principles:

1. **Architecture Layers**:
   - `Route Handler` -> `Validator (Zod)` -> `Service` -> `Repository` -> `PostgreSQL`
   - No direct DB queries in routes/services; all SQL belongs in `src/lib/repositories/user.repository.ts`.
2. **Error & Response Convention**:
   - Errors: `new ApiError(message, statusCode, [{ field, message }])`
   - Success: `new ApiResponse(statusCode, data, message)`
   - Handler Wrapper: Every route must be wrapped in `asynchandler`.
3. **Security Standards**:
   - Bcrypt hashing for passwords (10 salt rounds).
   - SHA-256 hashing for email and password reset tokens in database.
   - Deleting one-time tokens immediately after consumption.
   - Revoking sessions (`deletJWTfromDB`) upon password reset.
   - Never leaking `password_hash` in `ApiResponse`.
4. **Middleware & Proxy**:
   - `src/proxy.ts` manages CORS, public routes, and redirect logic (`/` fallback for unauthenticated users).
   - `src/middlewares/Jwt.proxy.ts` verifies tokens using `jose`, yields `TOKEN_EXPIRED`/`TOKEN_INVALID`, and double-checks with `/api/users/current-user` via `INTERNAL_SECRET`.
5. **Database**:
   - Parameterized queries (`$1, $2, ...`).
   - `ON DELETE CASCADE` on all user-linked token tables.
   - DDL changes via `src/lib/db/migrations/` and `npm run migrate`.
