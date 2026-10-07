import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { LocalExecutionEngine, ExecutionJob, Language } from '@/lib/execution-engine';

const engine = new LocalExecutionEngine();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, sourceCode, input, timeoutMs } = body;

    if (!language || !sourceCode) {
      return NextResponse.json(
        { error: 'Language and sourceCode are required.' },
        { status: 400 }
      );
    }

    const job: ExecutionJob = {
      id: crypto.randomUUID(),
      language: language as Language,
      sourceCode,
      input: input || '',
      timeoutMs: timeoutMs || 5000,
    };

    const result = await engine.execute(job);

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Execution Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during execution' },
      { status: 500 }
    );
  }
}
