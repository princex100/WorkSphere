# 🏛️ WorkSphere — Project Principles, Architecture & Coding Standards

This document defines the core architecture, design patterns, error handling conventions, and development rules for **WorkSphere**. All code modifications, feature implementations, and refactoring MUST strictly adhere to these guidelines.

---

## **1. Layered Architecture (Strict Separation of Concerns)**

```
HTTP Request
     ↓
[ proxy.ts ] (CORS, Route Gating, Public vs Protected Redirects)
     ↓
[ Jwt.proxy.ts ] (Edge JWT Verification with jose + Internal Secret Double-Check)
     ↓
[ API Route Handler: src/app/api/* ] (asynchandler wrapper, input parsing, ApiResponse)
     ↓
[ Validation Layer: src/lib/validators/* ] (Zod schema safeParse & field error mapping)
     ↓
[ Service Layer: src/lib/services/* ] (Business logic, Hashing, Token generation, Mail)
     ↓
[ Repository Layer: src/lib/repositories/* ] (Parameterized SQL queries with pg.Pool)
     ↓
[ Database: PostgreSQL 17 / Redis 7 ]
```

### **Layer Isolation Rules:**
1. **API Routes (`src/app/api/*`)**:
   - MUST be wrapped in `asynchandler`.
   - Responsible ONLY for extracting request data/cookies and returning formatted `ApiResponse`.
   - **NEVER** write raw database queries or direct SQL in route handlers.
   - **NEVER** place complex business logic in route handlers.
2. **Services (`src/lib/services/*`)**:
   - Orchestrates use cases, cryptographic hashing, and external services.
   - Interacts with database **ONLY** through the repository layer.
   - Throws `ApiError` on business rule violations.
3. **Repositories (`src/lib/repositories/*`)**:
   - Responsible ONLY for executing SQL queries on `pg.Pool`.
   - **ALWAYS** use parameterized queries (`$1, $2, ...`) to prevent SQL injection.
   - **NEVER** throw raw HTTP errors; return `rows[0] ?? null` or standard values.

---

## **2. Standardized Error Handling & Response Format**

### **A. ApiError (`src/lib/errors/ApiError.ts`)**
Throw `ApiError` for all operational and validation failures:
```ts
new ApiError(message: string, statusCode: number, errors?: { field: string, message: string }[])
```
* **Status Codes**: `400` (Bad Request / Validation), `401` (Unauthorized), `403` (Forbidden), `404` (Not Found), `500` (Internal Error).
* **Field Errors**: Validation errors must include `errors` array:
  ```ts
  throw new ApiError("Validation failed", 400, [
      { field: "email", message: "invalid email address." }
  ]);
  ```

### **B. ApiResponse (`src/lib/responses/ApiResponse.ts`)**
Return all successful API responses using `ApiResponse`:
```ts
// Note parameter order: (statusCode, data, message)
return NextResponse.json(
    new ApiResponse(200, user, "User logged in successfully")
);
```
* **CRITICAL**: Never leak sensitive fields like `password_hash` in `ApiResponse.data`. Always return sanitized user records.

### **C. asynchandler Wrapper (`src/lib/utils/asynchandler.ts`)**
Every API route handler must be wrapped:
```ts
export const POST = asynchandler(async (request: NextRequest) => {
    // ...
});
```

---

## **3. Authentication, Token & Security Principles**

1. **Password Hashing**:
   - Always hash passwords with `bcrypt.hash(password, 10)` before storing in PostgreSQL.
   - Verify passwords with `bcrypt.compare(plaintext, hash)`.
2. **One-Time Token Security (Email Verification & Password Reset)**:
   - Generate a secure random token: `crypto.randomBytes(20/32).toString("hex")`.
   - Store **ONLY the SHA-256 hash** in the database (`crypto.createHash("sha256").update(token).digest("hex")`).
   - Send the **unhashed token** to the user via email link.
   - Upon consumption, hash the incoming token with SHA-256 before database lookup.
   - **Single-Use**: Delete the token immediately after successful verification/reset.
   - **Session Revocation**: Invalidate user refresh tokens (`deletJWTfromDB`) upon password reset.
3. **Session Cookies**:
   - Set `accessToken` and `refreshToken` cookies with `httpOnly: true`, `secure: true`, `sameSite: "strict"`.

---

## **4. Edge Middleware & Proxy Rules**

### **`src/proxy.ts`:**
* **CORS**: Injects CORS headers on preflight (`OPTIONS` 204), success, and error paths.
* **Public Paths**: Keep `apipublicpaths` (`/api/auth/*`) and `publicpages` (`/`, `/login`, `/signUp`, etc.) up to date.
* **Redirect Rules**:
  * Authenticated users visiting auth pages (`/login`, `/signUp`) -> Redirect to `/dashboard`.
  * Unauthenticated users visiting protected pages -> Redirect to `/` (Home).

### **`src/middlewares/Jwt.proxy.ts`:**
* Validates `accessToken` with `jose.jwtVerify`.
* Specific error reporting: Throws `TOKEN_EXPIRED` on `JWTExpired` and `TOKEN_INVALID` on `JWTInvalid`.
* Validates user existence with internal micro-call to `/api/users/current-user` using `INTERNAL_SECRET`.
* Attaches `user` (ID) and `role` to request headers for downstream handlers.

---

## **5. Database & Migration Standards**

1. **Connection Pool**: Import `pool` from `src/lib/db/index.ts`.
2. **Cascade Deletions**: All child token tables (`refresh_tokens`, `email_verification_tokens`, `password_reset_tokens`) referencing `users(id)` **MUST** specify `ON DELETE CASCADE`.
3. **Migration Runner**:
   - New database changes must be added as incremental SQL files in `src/lib/db/migrations/` (e.g. `0009_...sql`).
   - Executed via `npm run migrate` (`src/lib/db/migration_runner.ts`).

---

## **6. Frontend Axios Interceptor (`src/lib/auth/axios.ts`)**

* Uses `NEXT_PUBLIC_BACKEND_API_BASE_URL` with `withCredentials: true`.
* Response interceptor catches `TOKEN_EXPIRED` (401) and automatically calls `/api/auth/refresh` before retrying the original request.
