export type Language = 'c' | 'cpp' | 'java' | 'python' | 'r';

export interface ExecutionJob {
  id: string;
  language: Language;
  sourceCode: string;
  input?: string;
  // Execution constraints
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export interface ExecutionResult {
  jobId: string;
  status: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIMEOUT';
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsedMb?: number;
}
