import { ScrapedData, SummaryMode, SummaryResult } from '@/types/scraper';

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.7-flash',
];

interface ParsedAiOutput {
  tldr: string;
  keyTakeaways: string[];
  summary: string;
  topics: string[];
}

function getModePrompt(mode: SummaryMode): string {
  switch (mode) {
    case 'bullet-points':
      return 'Emphasize concise, high-impact bullet points and key factual takeaways. Keep the narrative summary brief and focused on actionable points.';
    case 'executive':
      return 'Format as an executive briefing for leadership. Focus on strategic decisions, bottom-line impact, and critical takeaways in a succinct style.';
    case 'deep-dive':
      return 'Provide an in-depth, thorough breakdown analyzing context, implications, nuances, and technical details in structured markdown sections.';
    case 'comprehensive':
    default:
      return 'Provide a balanced, thorough, and highly informative summary capturing the context, main arguments, and conclusions.';
  }
}

/**
 * Calls Google Gemini REST API to summarize scraped text.
 * Automatically tries fallback models if the primary model experiences temporary load spikes.
 */
export async function summarizeContent(
  scraped: ScrapedData,
  mode: SummaryMode = 'comprehensive',
  customApiKey?: string
): Promise<SummaryResult> {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      'Missing Gemini API Key. Please add GEMINI_API_KEY to your .env.local file or enter your free key in the UI settings.'
    );
  }

  const modeInstruction = getModePrompt(mode);

  const systemInstruction = `You are an expert AI content analyst and summarizer.
Your job is to read webpage text and generate a structured, accurate, and insightful summary.
Style instruction: ${modeInstruction}

IMPORTANT: You must respond ONLY with a valid JSON object matching this exact structure:
{
  "tldr": "A 1-sentence punchy summary of the core message or finding.",
  "keyTakeaways": [
    "3 to 5 clear, high-value bullet points highlighting key insights, facts, or data"
  ],
  "summary": "A clean Markdown-formatted summary using headings (###), bold text, and paragraphs explaining the core content logically.",
  "topics": ["3 to 5 relevant topical tags or categories"]
}
Do not include any text, greetings, or markdown code blocks outside of the JSON object.`;

  const promptContent = `Webpage Title: ${scraped.title}
Source URL: ${scraped.url}
Page Description: ${scraped.description || 'N/A'}

Extracted Content:
${scraped.text}`;

  let rawOutput = '';
  let modelUsed = '';
  let lastError: Error | null = null;

  // Try candidate models in order of speed and stability
  for (const model of FALLBACK_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: promptContent }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg = responseData?.error?.message || `HTTP ${response.status}`;
        // If it's a 503 (temporary high demand) or 404 (model unavailable), try the next candidate
        if (response.status === 503 || response.status === 404) {
          lastError = new Error(`Model ${model} unavailable: ${errorMsg}`);
          continue;
        }
        if (response.status === 400 && errorMsg.includes('API_KEY_INVALID')) {
          throw new Error('The provided Gemini API Key is invalid. Please verify your key at Google AI Studio.');
        }
        throw new Error(`Gemini API Error (${model}): ${errorMsg}`);
      }

      const candidateText =
        responseData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (candidateText) {
        rawOutput = candidateText;
        modelUsed = model;
        break;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('API Key is invalid')) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  if (!rawOutput) {
    throw new Error(
      `Failed to generate summary from AI. ${
        lastError?.message || 'All candidate Gemini models were temporarily busy. Please try again.'
      }`
    );
  }

  // Parse JSON output safely
  let parsed: ParsedAiOutput;
  try {
    // Strip markdown json fences if present
    const cleanJson = rawOutput
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    parsed = JSON.parse(cleanJson);
  } catch {
    // Fallback if model responded in markdown instead of pure JSON
    parsed = {
      tldr: scraped.title,
      keyTakeaways: ['Scraped and summarized using Gemini AI.'],
      summary: rawOutput,
      topics: ['General', 'Web Scraping'],
    };
  }

  const summaryWords = (parsed.summary || '').split(/\s+/).filter(Boolean).length;
  const originalWords = scraped.wordCount || 1;
  const reduction = Math.max(
    0,
    Math.min(99, Math.round(((originalWords - summaryWords) / originalWords) * 100))
  );

  return {
    url: scraped.url,
    title: scraped.title,
    description: scraped.description,
    siteName: scraped.siteName,
    favicon: scraped.favicon,
    tldr: parsed.tldr || 'No TL;DR available.',
    keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
    summary: parsed.summary || rawOutput,
    topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    stats: {
      originalWordCount: scraped.wordCount,
      originalCharCount: scraped.charCount,
      originalReadTime: scraped.readTimeMinutes,
      summaryWordCount: summaryWords,
      summaryReadTime: Math.max(1, Math.round(summaryWords / 200)),
      reductionPercentage: reduction,
    },
    scrapedTextPreview: scraped.text.slice(0, 1500),
    scrapedAt: new Date().toISOString(),
    modelUsed,
    mode,
  };
}
