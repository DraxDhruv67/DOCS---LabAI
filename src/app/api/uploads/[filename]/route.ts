import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized file download. Access denied.' }, { status: 401 });
  }

  const { filename } = await params;
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'storage', 'uploads', sanitizedFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const response = new NextResponse(fileBuffer);

  // Set appropriate content headers
  if (sanitizedFilename.endsWith('.pdf')) {
    response.headers.set('Content-Type', 'application/pdf');
  } else if (sanitizedFilename.endsWith('.png')) {
    response.headers.set('Content-Type', 'image/png');
  } else if (sanitizedFilename.endsWith('.jpg') || sanitizedFilename.endsWith('.jpeg')) {
    response.headers.set('Content-Type', 'image/jpeg');
  } else {
    response.headers.set('Content-Type', 'application/octet-stream');
  }

  response.headers.set('Content-Disposition', `inline; filename="${sanitizedFilename}"`);
  return response;
}
