import os from 'os';
import { executeCode, ExecutionResult, TestCaseInput } from './executionEngine';

export interface ExecutionJob {
  id: string;
  code: string;
  language: string;
  testCases: TestCaseInput[];
  submittedAt: number;
  resolve: (result: ExecutionResult) => void;
  reject: (err: any) => void;
}

export interface QueueTelemetry {
  queuedJobs: number;
  activeJobs: number;
  maxConcurrency: number;
  totalProcessed: number;
}

class ExecutionQueueManager {
  private queue: ExecutionJob[] = [];
  private activeJobsCount = 0;
  private readonly maxConcurrency: number;
  private totalProcessed = 0;

  constructor() {
    // Determine concurrency based on host CPUs (cap between 2 and 8 to prevent host freeze)
    const cpus = os.cpus().length || 4;
    this.maxConcurrency = Math.min(Math.max(cpus, 2), 8);
    console.log(`[ExecutionQueue] Initialized with max concurrency of ${this.maxConcurrency} parallel containers`);
  }

  /**
   * Enqueue a student execution job
   */
  public async enqueue(
    code: string,
    language: string,
    testCases: TestCaseInput[]
  ): Promise<ExecutionResult> {
    // Prevent catastrophic memory leak if queue explodes beyond 1000 waiting jobs
    if (this.queue.length > 1000) {
      throw new Error('Execution engine is at maximum capacity (Queue full). Please retry in a few seconds.');
    }

    return new Promise<ExecutionResult>((resolve, reject) => {
      const job: ExecutionJob = {
        id: Math.random().toString(36).substring(7),
        code,
        language,
        testCases,
        submittedAt: Date.now(),
        resolve,
        reject,
      };

      this.queue.push(job);
      this.processNext();
    });
  }

  /**
   * Worker loop to process jobs up to maxConcurrency
   */
  private async processNext(): Promise<void> {
    if (this.activeJobsCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeJobsCount++;

    try {
      // Execute the job safely inside Docker
      const result = await executeCode(job.code, job.language, job.testCases);
      this.totalProcessed++;
      job.resolve(result);
    } catch (error) {
      job.reject(error);
    } finally {
      this.activeJobsCount--;
      // Immediately pull the next job waiting in queue
      this.processNext();
    }
  }

  /**
   * Get real-time queue health & telemetry
   */
  public getTelemetry(): QueueTelemetry {
    return {
      queuedJobs: this.queue.length,
      activeJobs: this.activeJobsCount,
      maxConcurrency: this.maxConcurrency,
      totalProcessed: this.totalProcessed,
    };
  }
}

// Global singleton instance across Next.js API route invocations
const globalForQueue = global as unknown as { executionQueueManager?: ExecutionQueueManager };

export const executionQueue = globalForQueue.executionQueueManager ?? new ExecutionQueueManager();

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.executionQueueManager = executionQueue;
}
