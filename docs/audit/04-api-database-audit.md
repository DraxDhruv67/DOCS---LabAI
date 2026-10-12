# API and Database Verification

## Database Audit
- **Schema Completeness**: The Prisma schema comprehensively models the intended domain (Users, Hierarchy, Experiments, Sessions, Submissions, Attempts).
- **Referential Integrity**: Proper cascading deletes (`onDelete: Cascade`) exist on almost all relations (e.g., deleting an experiment deletes its questions and test cases).
- **Security Check**: Roles are strictly checked at the API layer. No row-level security is enforced at the database level.
- **Constraints**: 
  - Submissions are uniquely constrained by composite IDs (`${sessionId}_${user.id}_${questionId}`). 
  - Attempts correctly map a `sessionId` + `studentId` + `questionId` to track historical attempts, updating the final score dynamically.

## API Audit
- **Authorization**: **PASS**. All endpoints appropriately call `getCurrentUser()` and validate the `.role` property (ADMIN, FACULTY, STUDENT) before execution.
- **Plagiarism API** (`/api/faculty/plagiarism`): **PASS**. Actively implements code tokenization and Jaccard Similarity to compare submissions pairwise and persists the highest `plagiarismScore`.
- **Code Execution API** (`/api/v1/code/run`): **PARTIAL**. Implements execution natively via `child_process`. It handles C, C++, Java, and Python, enforces timeouts, captures stdout/stderr, and determines PASSED/FAILED. *It lacks isolated containerization (Docker) which exposes security risks.*
- **Question API** (`/api/faculty/questions`): **PASS**. Full CRUD functionality exists. Recently patched to properly wipe and recreate dynamic testcase inputs on `PUT`.
- **Attempt/Submit API** (`/api/student/attempts`): **PASS**. Securely stores code and evaluates via the execution engine, dynamically saving `aiSuggestions` and updating marks natively.

## Issues / Blockers
- **Docker Sandbox Integration missing**: The execution runs directly on the host server process, requiring Phase 2 implementation.
