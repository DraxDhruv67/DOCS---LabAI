# Bug Register

| ID | Title | Affected Area | Severity | Status | Recommended Fix |
|---|---|---|---|---|---|
| BUG-01 | Host-level Code Execution | `/api/v1/code/run` | CRITICAL | OPEN | Refactor local `child_process` runner to use Docker containers via Dockerode. |
| BUG-02 | Windows DLL rename collision on build | Next.js Build / Prisma | MEDIUM | OPEN | Kill background dev servers before running `npm run build` on Windows or ignore `.prisma/client` lock errors. |
| BUG-03 | AI Chat Assistant is inert | `/student/dashboard` | LOW | OPEN | Connect the frontend UI chat window to a Gemini/OpenAI backend handler. |
| BUG-04 | Admin System Analytics lack visualizations | `/admin/dashboard` | LOW | OPEN | Add Chart.js / Recharts to render historical pass rates and student enrollment. |
