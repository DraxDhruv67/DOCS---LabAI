import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET() {
  const filename = 'questions_import_template.csv';
  const csvContent =
    'title,description,difficulty,marks,allowedLanguages,sampleInput,expectedOutput,hiddenInput,hiddenExpectedOutput\n' +
    '"Sum of Array Elements","Read array size N followed by N integers and print the sum.","EASY",10,"python;cpp;java;c","5\\n1 2 3 4 5","15","3\\n10 20 30","60"\n' +
    '"Check Prime Number","Read integer N and print PRIME if prime else NOT PRIME.","MEDIUM",10,"python;cpp;java;c","7","PRIME","10","NOT PRIME"\n' +
    '"String Reversal","Reverse the given word and print the result.","EASY",10,"python;cpp;java;c","hello","olleh","world","dlrow"';

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
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized. Faculty privileges required.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const experimentId = formData.get('experimentId') as string | null;

    if (!file || !experimentId) {
      return NextResponse.json({ error: 'File and experimentId are required' }, { status: 400 });
    }

    const experiment = await prisma.experiment.findUnique({
      where: { id: experimentId },
    });
    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'The uploaded file contains no question records.' }, { status: 400 });
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const {
        title,
        description,
        difficulty,
        marks,
        allowedLanguages,
        sampleInput,
        expectedOutput,
        hiddenInput,
        hiddenExpectedOutput,
      } = row;

      if (!title || String(title).trim() === '') {
        errors.push(`Row ${i + 2}: Missing question title.`);
        continue;
      }

      // Parse allowed languages
      let langs: string[] = ['python', 'cpp', 'c', 'java'];
      if (allowedLanguages) {
        langs = String(allowedLanguages)
          .split(/[;,]/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (langs.length === 0) {
          langs = ['python', 'cpp', 'c', 'java'];
        }
      }

      const diffVal = String(difficulty || 'MEDIUM').toUpperCase().trim();
      const validDiff = ['EASY', 'MEDIUM', 'HARD'].includes(diffVal) ? diffVal : 'MEDIUM';

      const question = await prisma.practicalQuestion.create({
        data: {
          experimentId,
          title: String(title).trim(),
          description: description ? String(description).trim() : '',
          difficulty: validDiff,
          allowedLanguagesJson: JSON.stringify(langs),
          marks: marks ? parseFloat(String(marks)) : 10.0,
        },
      });

      // Public test case
      if (expectedOutput !== undefined && expectedOutput !== null && String(expectedOutput).trim() !== '') {
        const rawInput = sampleInput !== undefined && sampleInput !== null ? String(sampleInput) : '';
        await prisma.testCase.create({
          data: {
            questionId: question.id,
            input: rawInput.replace(/\\n/g, '\n'),
            expectedOutput: String(expectedOutput).replace(/\\n/g, '\n').trim(),
            isHidden: false,
          },
        });
      }

      // Hidden test case
      if (hiddenExpectedOutput !== undefined && hiddenExpectedOutput !== null && String(hiddenExpectedOutput).trim() !== '') {
        const rawHiddenInput = hiddenInput !== undefined && hiddenInput !== null ? String(hiddenInput) : '';
        await prisma.testCase.create({
          data: {
            questionId: question.id,
            input: rawHiddenInput.replace(/\\n/g, '\n'),
            expectedOutput: String(hiddenExpectedOutput).replace(/\\n/g, '\n').trim(),
            isHidden: true,
          },
        });
      }

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Question import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse questions spreadsheet' }, { status: 500 });
  }
}
