import * as cheerio from 'cheerio';
import { ScrapedData } from '@/types/scraper';

/**
 * Validates whether a given URL is safe and well-formed.
 * Protects against SSRF attacks on internal network endpoints.
 */
export function validateUrl(urlString: string): { valid: boolean; error?: string; url?: URL } {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'A URL is required.' };
  }

  let trimmed = urlString.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'The provided URL is not a valid format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF Protection: Block loopback and internal private IP addresses
  const forbiddenHosts = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
    '169.254.169.254', // AWS/GCP metadata service
    'metadata.google.internal',
  ];

  if (forbiddenHosts.includes(hostname)) {
    return { valid: false, error: 'Access to private or local network resources is forbidden.' };
  }

  // Block private IPv4 ranges (10.x.x.x, 192.168.x.x, 172.16.x.x - 172.31.x.x)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 127 ||
      a === 0
    ) {
      return { valid: false, error: 'Access to private IP addresses is forbidden.' };
    }
  }

  return { valid: true, url: parsed };
}

/**
 * Scrapes HTML text and metadata from the given URL.
 */
export async function scrapeWebpage(rawUrl: string): Promise<ScrapedData> {
  const validation = validateUrl(rawUrl);
  if (!validation.valid || !validation.url) {
    throw new Error(validation.error || 'Invalid URL provided.');
  }

  const targetUrl = validation.url.toString();

  // 15-second abort controller to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out while connecting to ${validation.url.hostname} (15s limit).`);
    }
    throw new Error(`Unable to fetch webpage: ${err instanceof Error ? err.message : 'Network error'}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Webpage returned status ${response.status} (${response.statusText}).`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error(`The target URL does not return HTML (received ${contentType || 'unknown type'}).`);
  }

  const html = await response.text();
  if (!html || html.trim().length === 0) {
    throw new Error('The target webpage returned an empty response.');
  }

  const $ = cheerio.load(html);

  // Remove non-content and clutter elements
  $(
    'script, style, noscript, svg, canvas, iframe, nav, footer, header, aside, dialog, select, input, button, .ad, .ads, .advertisement, .cookie-banner, .cookie-notice, #comments, .comments, .social-share, [aria-hidden="true"]'
  ).remove();

  // Extract Metadata
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    $('h1').first().text().trim() ||
    validation.url.hostname;

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    '';

  const siteName =
    $('meta[property="og:site_name"]').attr('content')?.trim() ||
    validation.url.hostname.replace(/^www\./, '');

  let favicon =
    $('link[rel="apple-touch-icon"]').attr('href') ||
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    '';

  if (favicon && !favicon.startsWith('http')) {
    try {
      favicon = new URL(favicon, targetUrl).toString();
    } catch {
      favicon = `https://www.google.com/s2/favicons?domain=${validation.url.hostname}&sz=64`;
    }
  } else if (!favicon) {
    favicon = `https://www.google.com/s2/favicons?domain=${validation.url.hostname}&sz=64`;
  }

  // Extract main article or body text
  let rawText = '';

  const mainContainers = ['article', 'main', '[role="main"]', '.post-content', '.article-content', '.entry-content', '#content'];
  for (const selector of mainContainers) {
    const el = $(selector);
    if (el.length > 0) {
      const containerText = el.text().trim();
      if (containerText.length > 300) {
        rawText = containerText;
        break;
      }
    }
  }

  if (!rawText || rawText.length < 300) {
    // Collect paragraphs and headings
    const paragraphs: string[] = [];
    $('h1, h2, h3, p, li').each((_, elem) => {
      const pText = $(elem).text().trim();
      if (pText.length > 20) {
        paragraphs.push(pText);
      }
    });
    rawText = paragraphs.join('\n\n');
  }

  if (!rawText || rawText.length < 100) {
    // Final fallback to body text
    rawText = $('body').text().trim();
  }

  // Clean whitespace: collapse excessive empty lines and repeated spaces
  const cleanedText = rawText
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  if (!cleanedText || cleanedText.length < 40) {
    throw new Error('Could not extract readable text content from this webpage. The page may require JavaScript or authentication.');
  }

  // Token safety: Cap to 25,000 characters to fit token limits while retaining full rich content
  const truncatedText = cleanedText.length > 25000 ? cleanedText.slice(0, 25000) + '... [Content truncated for length]' : cleanedText;

  const words = truncatedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = truncatedText.length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    url: targetUrl,
    title,
    description,
    siteName,
    favicon,
    text: truncatedText,
    wordCount,
    charCount,
    readTimeMinutes,
  };
}
