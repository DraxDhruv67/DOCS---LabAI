# End-to-End Workflow Testing

## Workflow 1: Authentication & RBAC
- **Status**: **PASS**
- **Details**: Users can login. System maps `ADMIN`, `FACULTY`, and `STUDENT` roles to their respective dashboards. Endpoints strictly enforce permissions (e.g., Faculty attempting to access Admin endpoints yields `401 Unauthorized`).

## Workflow 2: Faculty Experiment Creation
- **Status**: **PASS**
- **Details**: Faculty can view assigned subjects/batches, create experiments, and add multiple questions. Dynamic UI allows adding multiple test cases per question (both visible and hidden). Edit/Delete flows correctly update the database.

## Workflow 3: Student Code Execution & Evaluation
- **Status**: **PASS**
- **Details**: Students enter the workspace, navigate between multiple questions via tabs, write code in the browser IDE, and execute it. 
- The system correctly runs the code (via Phase 1 local engine), asserts it against hidden/visible test cases, generates mock AI hints, calculates time/memory, and overlays a "Question Solved!" modal if passed. 
- Final scores are correctly upserted into the `Submission` table.

## Workflow 4: Plagiarism Detection
- **Status**: **PASS**
- **Details**: Faculty triggers plagiarism checks on completed sessions. The backend accurately tokenizes and compares code across all student submissions using Jaccard Similarity, updating the highest similarity metrics onto the student submissions.

## Workflow 5: Assignments & Timetables
- **Status**: **PARTIAL**
- **Details**: Faculty can create assignments and assign deadlines. Students can view assignments and submit them. Timetables can be viewed, but the Admin analytics/timetable UI components still need visual enhancements (requested as Phase backlog).

## Workflow 6: AI Chat Assistant
- **Status**: **NOT IMPLEMENTED / PARTIAL**
- **Details**: The UI exists for a student AI chat assistant (`<Sparkles /> DOCS AI Academic Assistant`), but backend generative integrations are mocked or absent.

## Security Warning (Workflow Blockers)
- The local execution workflow (Workflow 3) currently executes student code on the host OS. This introduces severe security vulnerabilities (fork bombs, infinite loops, memory leaks). Transitioning to Docker is urgently required.
