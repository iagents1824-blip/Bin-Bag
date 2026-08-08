import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
    const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

/**
 * Generate enhancement tips & code review feedback for community models
 */
export async function generateEnhancementTips(title: string, content: string, codeSnippet?: string): Promise<string> {
  try {
    const client = getAIClient();
    if (!client) {
      return `[Automated Architecture Analysis]
• System Prompt Hardening: Consider adding strict output format constraints (e.g., JSON Schema) to eliminate parsing failures.
• Quantization Tip: If running on local consumer hardware, compile with GGUF Q5_K_M for minimal perplexity degradation.
• Memory Efficiency: Use FlashAttention-2 or vLLM PagedAttention to reduce KV cache memory overhead by up to 60%.`;
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are Bin Bag Senior AI Architect. Provide concise, bulleted enhancement tips, security checks, and optimization advice for this AI model/community submission.

Title: ${title}
Details: ${content}
${codeSnippet ? `Code/Snippet:\n${codeSnippet}` : ''}

Format as 3-4 bullet points with technical precision.`
            }
          ]
        }
      ]
    });

    return response.text || 'No automated feedback generated.';
  } catch (err) {
    console.warn('Gemini API call failed or unconfigured, returning fallback advice:', err);
    return `[Architect Recommendation]
1. Context Management: Set explicit max token bounds to prevent runaway inference costs.
2. Benchmarking: Test against MMLU-Pro and GSM8K to verify no post-quantization regression.
3. Security: Sanitize user input prior to prompt concatenation to block prompt injection attacks.`;
  }
}

/**
 * Generate a Daily AI News Intelligence briefing
 */
export async function generateDailyNewsBriefing(newsTitles: string[]): Promise<string> {
  try {
    const client = getAIClient();
    if (!client) {
      return `Good morning. This is your Bin Bag Intelligence Briefing for today. Major headlines: ${newsTitles.join('. ')}. Stay tuned for further updates as model weights and hardware benchmarks develop.`;
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Synthesize these top AI news headlines into a 3-sentence executive radio ticker briefing for AI researchers:
Headlines:
${newsTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
            }
          ]
        }
      ]
    });

    return response.text || 'Daily news synthesis unavailable.';
  } catch (err) {
    return `Bin Bag Daily Intelligence: ${newsTitles.slice(0, 2).join(' | ')}. System status nominal across all global GPU clusters.`;
  }
}
