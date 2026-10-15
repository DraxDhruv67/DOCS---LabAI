import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let csvContent = '';
  let filename = 'template.csv';

  if (type === 'students') {
    filename = 'students_import_template.csv';
    csvContent = 'name,email,rollNo,departmentCode,studyYearName,divisionName,batchName,password\n' +
      'Rohan Mehta,rohan.m@docs.edu,21DS01,CSE-DS,SY,Division D,Batch 1,student123\n' +
      'Aarav Sharma,aarav.s@docs.edu,21DS02,CSE-DS,SY,Division D,Batch 1,student123\n' +
      'Priya Patel,priya.p@docs.edu,21DS03,CSE-DS,SY,Division D,Batch 2,student123';
  } else if (type === 'faculty') {
    filename = 'faculty_import_template.csv';
    csvContent = 'name,email,employeeId,departmentCode,password\n' +
      'Prof. Ananya Sharma,ananya.s@docs.edu,FAC-101,CSE-DS,faculty123\n' +
      'Prof. Rajesh Kulkarni,rajesh.k@docs.edu,FAC-102,CSE-DS,faculty123';
  } else if (type === 'allocations') {
    filename = 'staff_subject_mapping_template.csv';
    csvContent = 'facultyEmail,subjectCode,batchName,divisionName,studyYearName,departmentCode\n' +
      'ananya.s@docs.edu,ML101,Batch 1,Division D,SY,CSE-DS\n' +
      'ananya.s@docs.edu,ML101,Batch 2,Division D,SY,CSE-DS';
  } else {
    return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
  }

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ error: 'File and import type are required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'The uploaded file contains no data rows.' }, { status: 400 });
    }

    const defaultStudentPassword = await bcrypt.hash('student123', 10);
    const defaultFacultyPassword = await bcrypt.hash('faculty123', 10);

    let importedCount = 0;
    const errors: string[] = [];

    if (type === 'students') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const { name, email, rollNo, departmentCode, studyYearName, divisionName, batchName, password } = row;

        if (!email || !name) {
          errors.push(`Row ${i + 2}: Missing required name or email`);
          continue;
        }

        // Find department
        let deptId: string | null = null;
        if (departmentCode) {
          const dept = await prisma.department.findUnique({ where: { code: String(departmentCode).trim() } });
          if (dept) deptId = dept.id;
        }

        // Find batch
        let batchId: string | null = null;
        if (batchName) {
          const batch = await prisma.batch.findFirst({
            where: {
              name: String(batchName).trim(),
              ...(divisionName ? { division: { name: String(divisionName).trim() } } : {}),
            },
          });
          if (batch) batchId = batch.id;
        }

        const passwordHash = password ? await bcrypt.hash(String(password), 10) : defaultStudentPassword;

        await prisma.user.upsert({
          where: { email: String(email).trim().toLowerCase() },
          update: {
            name: String(name).trim(),
            rollNo: rollNo ? String(rollNo).trim() : undefined,
            departmentId: deptId || undefined,
            batchId: batchId || undefined,
          },
          create: {
            email: String(email).trim().toLowerCase(),
            name: String(name).trim(),
            passwordHash,
            role: 'STUDENT',
            rollNo: rollNo ? String(rollNo).trim() : null,
            departmentId: deptId,
            batchId,
          },
        });

        importedCount++;
      }
    } else if (type === 'faculty') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const { name, email, employeeId, departmentCode, password } = row;

        if (!email || !name) {
          errors.push(`Row ${i + 2}: Missing required name or email`);
          continue;
        }

        let deptId: string | null = null;
        if (departmentCode) {
          const dept = await prisma.department.findUnique({ where: { code: String(departmentCode).trim() } });
          if (dept) deptId = dept.id;
        }

        const passwordHash = password ? await bcrypt.hash(String(password), 10) : defaultFacultyPassword;

        await prisma.user.upsert({
          where: { email: String(email).trim().toLowerCase() },
          update: {
            name: String(name).trim(),
            employeeId: employeeId ? String(employeeId).trim() : undefined,
            departmentId: deptId || undefined,
          },
          create: {
            email: String(email).trim().toLowerCase(),
            name: String(name).trim(),
            passwordHash,
            role: 'FACULTY',
            employeeId: employeeId ? String(employeeId).trim() : null,
            departmentId: deptId,
          },
        });

        importedCount++;
      }
    } else if (type === 'allocations') {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const { facultyEmail, subjectCode, batchName, divisionName } = row;

        if (!facultyEmail || !subjectCode || !batchName) {
          errors.push(`Row ${i + 2}: Missing facultyEmail, subjectCode, or batchName`);
          continue;
        }

        const faculty = await prisma.user.findUnique({ where: { email: String(facultyEmail).trim().toLowerCase() } });
        const subject = await prisma.subject.findFirst({ where: { code: String(subjectCode).trim() } });
        const batch = await prisma.batch.findFirst({
          where: {
            name: String(batchName).trim(),
            ...(divisionName ? { division: { name: String(divisionName).trim() } } : {}),
          },
        });

        if (!faculty || !subject || !batch) {
          errors.push(`Row ${i + 2}: Unresolved reference (Faculty: ${!!faculty}, Subject: ${!!subject}, Batch: ${!!batch})`);
          continue;
        }

        await prisma.subjectFacultyBatch.upsert({
          where: {
            subjectId_batchId_facultyId: {
              subjectId: subject.id,
              batchId: batch.id,
              facultyId: faculty.id,
            },
          },
          update: {},
          create: {
            subjectId: subject.id,
            batchId: batch.id,
            facultyId: faculty.id,
          },
        });

        importedCount++;
      }
    } else {
      return NextResponse.json({ error: 'Unsupported import type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Import processing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process import file' }, { status: 500 });
  }
}
