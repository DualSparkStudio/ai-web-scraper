import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebpage } from '@/lib/scraper';
import { summarizeContent } from '@/lib/summarizer';
import { ApiResponse, ScrapeRequestBody, SummaryResult } from '@/types/scraper';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SummaryResult>>> {
  try {
    let body: ScrapeRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON request payload.',
        },
        { status: 400 }
      );
    }

    const { url, mode = 'comprehensive', customApiKey } = body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter a valid webpage URL to summarize.',
        },
        { status: 400 }
      );
    }

    // Step 1: Scrape the webpage content
    let scrapedData;
    try {
      scrapedData = await scrapeWebpage(url);
    } catch (scrapeErr: unknown) {
      const message = scrapeErr instanceof Error ? scrapeErr.message : 'Failed to scrape webpage.';
      return NextResponse.json(
        {
          success: false,
          error: message,
          details: 'Scraping failed: the target webpage could not be retrieved or contained no extractable text.',
        },
        { status: 422 }
      );
    }

    // Step 2: Pass scraped content to Gemini AI
    let summaryResult: SummaryResult;
    try {
      summaryResult = await summarizeContent(scrapedData, mode, customApiKey);
    } catch (aiErr: unknown) {
      const message = aiErr instanceof Error ? aiErr.message : 'AI summarization failed.';
      const status = message.includes('API Key') || message.includes('Missing Gemini') ? 401 : 500;
      return NextResponse.json(
        {
          success: false,
          error: message,
          details: 'AI processing failed while communicating with the Gemini API.',
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: summaryResult,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected server error occurred.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
