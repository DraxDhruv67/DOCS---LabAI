import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { ExecutionJob, ExecutionResult, Language } from './types';

const execAsync = promisify(exec);

// Determine execution environment specifics
const isWin = os.platform() === 'win32';

const LANGUAGE_CONFIG = {
  c: {
    filename: 'main.c',
    compileCmd: (dir: string) => isWin ? `gcc main.c -o out.exe` : `gcc main.c -o out`,
    runCmd: (dir: string) => isWin ? path.join(dir, 'out.exe') : path.join(dir, 'out'),
  },
  cpp: {
    filename: 'main.cpp',
    compileCmd: (dir: string) => isWin ? `g++ main.cpp -o out.exe` : `g++ main.cpp -o out`,
    runCmd: (dir: string) => isWin ? path.join(dir, 'out.exe') : path.join(dir, 'out'),
  },
  java: {
    filename: 'Main.java', // Note: User code MUST use class Main
    compileCmd: (dir: string) => `javac Main.java`,
    runCmd: (dir: string) => `java Main`,
  },
  python: {
    filename: 'script.py',
    compileCmd: null,
    runCmd: (dir: string) => isWin ? `python script.py` : `python3 script.py`,
  },
  r: {
    filename: 'script.R',
    compileCmd: null,
    runCmd: (dir: string) => `Rscript script.R`,
  },
};

export class LocalExecutionEngine {
  
  public async execute(job: ExecutionJob): Promise<ExecutionResult> {
    const config = LANGUAGE_CONFIG[job.language];
    if (!config) {
      throw new Error(`Unsupported language: ${job.language}`);
    }

    // 1. Create temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `docs-exec-${job.id}-`));
    
    try {
      // 2. Write source code and input
      const sourcePath = path.join(tempDir, config.filename);
      await fs.writeFile(sourcePath, job.sourceCode, 'utf-8');
      
      const inputPath = path.join(tempDir, 'input.txt');
      await fs.writeFile(inputPath, job.input || '', 'utf-8');

      // 3. Compile if necessary
      if (config.compileCmd) {
        try {
          await execAsync(config.compileCmd(tempDir), { cwd: tempDir, timeout: 10000 });
        } catch (err: any) {
          return {
            jobId: job.id,
            status: 'COMPILE_ERROR',
            stdout: '',
            stderr: err.stderr || err.message,
            exitCode: err.code || 1,
            executionTimeMs: 0
          };
        }
      }

      // 4. Execute Phase
      return await this.runProcess(job, tempDir, config.runCmd(tempDir), inputPath);

    } finally {
      // 5. Cleanup
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error(`Failed to cleanup temp dir ${tempDir}`, cleanupErr);
      }
    }
  }

  private runProcess(job: ExecutionJob, cwd: string, command: string, inputPath: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      const startTime = process.hrtime.bigint();
      const timeoutMs = job.timeoutMs || 5000;
      
      let stdout = '';
      let stderr = '';
      
      // Parse command to spawn args (simple split for prototype)
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      const child = spawn(cmd, args, { cwd });

      // Provide input via stdin if any
      if (job.input) {
        child.stdin.write(job.input);
      }
      child.stdin.end();

      let isTimeout = false;
      const timer = setTimeout(() => {
        isTimeout = true;
        child.kill('SIGKILL');
      }, timeoutMs);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Prototype safe-guard: prevent massive output DOS
        if (stdout.length > 1024 * 1024) { 
          child.kill('SIGKILL');
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        const endTime = process.hrtime.bigint();
        const executionTimeMs = Number(endTime - startTime) / 1000000;

        if (isTimeout || signal === 'SIGKILL') {
          resolve({
            jobId: job.id,
            status: 'TIMEOUT',
            stdout,
            stderr: stderr || 'Execution timed out or exceeded output limits.',
            exitCode: code ?? 1,
            executionTimeMs
          });
        } else {
          resolve({
            jobId: job.id,
            status: code === 0 ? 'SUCCESS' : 'RUNTIME_ERROR',
            stdout,
            stderr,
            exitCode: code ?? 1,
            executionTimeMs
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        const endTime = process.hrtime.bigint();
        resolve({
          jobId: job.id,
          status: 'RUNTIME_ERROR',
          stdout,
          stderr: stderr || err.message,
          exitCode: 1,
          executionTimeMs: Number(endTime - startTime) / 1000000
        });
      });
    });
  }
}
