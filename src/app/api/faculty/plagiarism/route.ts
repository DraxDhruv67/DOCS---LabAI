import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function tokenizeCode(code: string): Set<string> {
  // Strip comments, whitespace, and variable names for structural token comparison
  const sanitized = code
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
    .replace(/#.*/g, '')
    .replace(/\b(int|float|double|char|var|let|const|def|function|return|if|else|for|while|import|include)\b/g, 'TOK_KEY')
    .replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, 'VAR')
    .replace(/\s+/g, '');

  // Generate k-grams (k=4)
  const tokens = new Set<string>();
  const k = 4;
  for (let i = 0; i <= sanitized.length - k; i++) {
    tokens.add(sanitized.substring(i, i + k));
  }
  return tokens;
}

function computeJaccardSimilarity(code1: string, code2: string): number {
  const set1 = tokenizeCode(code1);
  const set2 = tokenizeCode(code2);

  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return Math.round((intersection.size / union.size) * 100);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  // Fetch all attempts/submissions for this practical session
  const submissions = await prisma.submission.findMany({
    where: { sessionId },
    include: {
      student: { select: { id: true, name: true, rollNo: true } },
      finalAttempt: true,
      question: { select: { title: true } },
    },
  });

  if (submissions.length < 2) {
    return NextResponse.json({
      message: 'Plagiarism check requires at least 2 student submissions',
      pairs: [],
    });
  }

  const pairs: Array<{
    student1: string;
    student2: string;
    questionTitle: string;
    similarity: number;
  }> = [];

  // Compare submissions pairwise
  for (let i = 0; i < submissions.length; i++) {
    for (let j = i + 1; j < submissions.length; j++) {
      const sub1 = submissions[i];
      const sub2 = submissions[j];

      if (sub1.finalAttempt && sub2.finalAttempt && sub1.questionId === sub2.questionId) {
        const similarity = computeJaccardSimilarity(sub1.finalAttempt.code, sub2.finalAttempt.code);

        pairs.push({
          student1: `${sub1.student.name} (${sub1.student.rollNo || 'N/A'})`,
          student2: `${sub2.student.name} (${sub2.student.rollNo || 'N/A'})`,
          questionTitle: sub1.question.title,
          similarity,
        });

        // Update plagiarism score on submission record if higher
        await prisma.submission.update({
          where: { id: sub1.id },
          data: { plagiarismScore: Math.max(sub1.plagiarismScore || 0, similarity) },
        });

        await prisma.submission.update({
          where: { id: sub2.id },
          data: { plagiarismScore: Math.max(sub2.plagiarismScore || 0, similarity) },
        });
      }
    }
  }

  pairs.sort((a, b) => b.similarity - a.similarity);

  return NextResponse.json({
    message: 'Plagiarism analysis complete',
    scannedSubmissionsCount: submissions.length,
    pairs,
  });
}
