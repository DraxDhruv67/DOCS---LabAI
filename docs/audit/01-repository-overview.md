# Repository Overview

## 1. Technologies & Architecture
- **Frontend Framework**: Next.js (App Router `src/app/`)
- **Backend Framework**: Next.js API Routes (`src/app/api/`)
- **Database**: PostgreSQL (via Prisma ORM, located at `prisma/schema.prisma`)
- **Language**: TypeScript (`.ts`, `.tsx`)
- **Styling**: Tailwind CSS
- **Authentication**: Custom JWT/Session based auth (`src/app/api/auth/`)
- **Code Execution**: Node.js `child_process` (local prototype) located in `src/app/api/v1/code/run` and `src/lib/executionEngine.ts`. 

## 2. Directory Structure
- `src/app/api/admin/`: Admin endpoints (batches, departments, rubrics, subjects, users).
- `src/app/api/auth/`: Authentication (login, logout, me).
- `src/app/api/faculty/`: Faculty endpoints (assignments, experiments, plagiarism, questions, sessions, subjects).
- `src/app/api/student/`: Student endpoints (assignments/submit, attempts, sessions, sessions/entry, subjects).
- `src/app/api/v1/code/run/`: Local code execution endpoint.
- `src/app/api/uploads/`: File upload handling endpoints.

## 3. Database Schema Overview
- **Users**: Admin, Faculty, Student roles.
- **Academic Hierarchy**: Department, AcademicSession, StudyYear, Division, Batch, Subject.
- **Entity Relations**:
  - `SubjectFacultyBatch`: Maps faculty to subjects and specific batches.
  - `StudentBatch`: Maps students to batches.
  - `Experiment` -> `PracticalQuestion` -> `TestCase`.
  - `PracticalSession` -> `Attempt` and `Submission`.
- **Other entities**: `Assignment`, `AssignmentSubmission`, `Resource`, `TimetableSlot`, `Notification`, `AuditLog`.

## 4. Initial Observations
- **Dependencies**: React, Next.js, Prisma, TailwindCSS.
- **State**: Development in progress. Execution engine is a local prototype (Phase 1) relying on `child_process.spawnSync`. Docker sandbox is planned but not yet implemented.
- **Auth**: Protected by checking `await getCurrentUser()` in most endpoints.
- **Test Suite**: No explicit `__tests__` or `.test.ts` directory found in the high-level scan. Testing relies on static TypeScript checks (`npx tsc`).
