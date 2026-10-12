# Security Audit Report

## Critical Vulnerabilities
1. **Host-level Code Execution (RCE risk)**
   - **Severity**: **CRITICAL**
   - **Details**: Student code is currently evaluated via `child_process.spawnSync` directly on the host server (`src/lib/executionEngine.ts`). This allows malicious students to access host files, consume full CPU memory, launch fork bombs, or expose environment variables.
   - **Remediation**: Isolate the execution engine into ephemeral Docker containers (Sandbox Phase 2) with strict `timeout`, `memory`, `pids-limit`, and completely disabled networking.

## Medium/Low Vulnerabilities
2. **Missing Rate Limiting**
   - **Severity**: **MEDIUM**
   - **Details**: No API rate limiters (`express-rate-limit` or Next.js edge equivalent) exist on `/api/auth/login` or `/api/student/attempts`. Students could spam submissions to exhaust server threads during the execution phase.
   - **Remediation**: Add IP and User-based rate limiters to authentication and execution endpoints.

3. **Insecure Concurrent DB Operations**
   - **Severity**: **LOW**
   - **Details**: `Submission.upsert` inside `/api/student/attempts` could potentially encounter race conditions if a student spam-clicks the submit button in a laggy network.
   - **Remediation**: Use database-level locking or debouncing on the frontend.

## Secure Practices Verified
- **Auth Integrity**: Role-based access control is properly validated server-side.
- **SQL Injection**: Prevented globally by the strict use of Prisma ORM parametization.
- **CSRF / XSS**: Mostly mitigated by Next.js architecture and standard React DOM escaping.
