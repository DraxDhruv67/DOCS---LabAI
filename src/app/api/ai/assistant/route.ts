import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt, contextCode, subjectName } = await request.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const fullPrompt = `You are DOCS AI, an expert academic coding & computer science assistant for university students.
Subject context: ${subjectName || 'Computer Science Laboratory'}
Current student code (if any):
\`\`\`
${contextCode || 'No code provided'}
\`\`\`

Student Question:
${prompt}

Provide a concise, highly educational response, explaining relevant data structures, algorithm complexity, logic fixes, or conceptual explanations cleanly in Markdown. Do not give complete assignment solution writeups directly if it bypasses practical learning, but guide step-by-step.`;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      return NextResponse.json({ response: responseText });
    } catch (err: any) {
      console.error('Gemini API call failed, using deterministic fallback:', err);
    }
  }

  // Deterministic Fallback response for offline / unconfigured API key
  let fallbackText = `### 🤖 DOCS AI Assistant

**Question**: "${prompt}"

**Academic Guidance & Explanation**:
- **Data Structures**: Consider using appropriate containers (Arrays, HashMaps, or Vectors) to reduce time complexity to $O(N)$.
- **Code Optimization**: Ensure all loop bounds check edge cases like empty inputs or negative values.
- **Test Verification**: Verify input line reading with \`sys.stdin.read()\` (Python) or \`cin / Scanner\` (C++/Java).

*Tip: Connect your Gemini API Key in \`.env\` for real-time model responses!*`;

  return NextResponse.json({ response: fallbackText });
}
