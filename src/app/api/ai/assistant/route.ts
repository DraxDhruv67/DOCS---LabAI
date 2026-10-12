import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
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
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are DOCS AI, an expert academic coding & computer science assistant for university students.
Subject context: ${subjectName || 'Computer Science Laboratory'}
Current student code (if any):
\`\`\`
${contextCode || 'No code provided'}
\`\`\`

Provide a concise, highly educational response, explaining relevant data structures, algorithm complexity, logic fixes, or conceptual explanations cleanly in Markdown. Do NOT give complete assignment solution writeups directly if it bypasses practical learning; guide them step-by-step to find the answer.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return NextResponse.json({ response: response.text });
    } catch (err: any) {
      console.error('Gemini API call failed, using deterministic fallback:', err);
    }
  }

  // Deterministic Fallback response for offline / unconfigured API key
  let fallbackText = `### ✨ DOCS AI Assistant (Offline Mode)

**Question**: "${prompt}"

**Academic Guidance**:
- **Algorithms**: Consider if sorting or using a HashMap might optimize your approach.
- **Edge Cases**: Make sure to test for empty inputs, negative numbers, or array bounds limits.
- **Syntax**: Verify semicolons, indentation, and correct library imports.

*(Admin Note: Configure \`GEMINI_API_KEY\` in your \`.env\` file to activate real-time LLM inference!)*`;

  return NextResponse.json({ response: fallbackText });
}
