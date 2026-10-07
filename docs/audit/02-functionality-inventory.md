# Complete Functionality Inventory

## A. Authentication & Session
- **F-AUTH-01**: User Login (`POST /api/auth/login`)
- **F-AUTH-02**: User Logout (`POST /api/auth/logout`)
- **F-AUTH-03**: Session Retrieval (`GET /api/auth/me`)

## B. Administration
- **F-ADM-01**: Create/List Users (`GET/POST /api/admin/users`)
- **F-ADM-02**: Bulk User Import (`CSV upload in admin dashboard`)
- **F-ADM-03**: Create/List Departments (`GET/POST /api/admin/departments`)
- **F-ADM-04**: Create/List Subjects (`GET/POST /api/admin/subjects`)
- **F-ADM-05**: Create/List Batches (`GET/POST /api/admin/batches`)
- **F-ADM-06**: Manage Rubrics (`GET/POST/PUT/DELETE /api/admin/rubrics`)

## C. Faculty
- **F-FAC-01**: View Assigned Subjects/Batches (`GET /api/faculty/subjects`)
- **F-FAC-02**: Create/Edit/Delete Experiments (`GET/POST/PUT/DELETE /api/faculty/experiments`)
- **F-FAC-03**: Create/Edit/Delete Questions (`GET/POST/PUT/DELETE /api/faculty/questions`)
- **F-FAC-04**: Add Multiple Test Cases (`PUT /api/faculty/questions` with dynamic test cases UI)
- **F-FAC-05**: Create Assignments (`POST /api/faculty/assignments`)
- **F-FAC-06**: Schedule Practical Sessions (`GET/POST /api/faculty/sessions`)
- **F-FAC-07**: Run Plagiarism Check (`POST /api/faculty/plagiarism`)

## D. Student
- **F-STU-01**: View Subjects (`GET /api/student/subjects`)
- **F-STU-02**: Submit Code Attempts (`POST /api/student/attempts`)
- **F-STU-03**: Join Practical Session (`POST /api/student/sessions/entry`)
- **F-STU-04**: View Practical Sessions (`GET /api/student/sessions`)
- **F-STU-05**: Submit Assignment (`POST /api/student/assignments/submit`)

## E. Code Execution Engine
- **F-EXEC-01**: Execute Code locally via `child_process` (`POST /api/v1/code/run`)
- **F-EXEC-02**: AI Hints generation (`src/lib/executionEngine.ts`)

## F. Files & Notifications
- **F-FILE-01**: File Upload (`POST /api/uploads`)
- **F-FILE-02**: File Download (`GET /api/uploads/[filename]`)
- **F-NOT-01**: Notifications (`GET /api/notifications`)
