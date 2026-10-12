import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { executionQueue } from '@/lib/executionQueue';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const telemetry = executionQueue.getTelemetry();
  return NextResponse.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    telemetry,
  });
}
