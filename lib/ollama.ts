import { GeneratedListing, Platform } from '@/types';
import { getPlatformPrompt } from './prompts';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const PREFERRED_MODELS = [
  process.env.OLLAMA_MODEL || 'gemma2',
  'gemma2:latest',
  'llava:7b',
  'llava',
];

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
}

/**
 * Strips data URI prefixes if present, e.g. "data:image/jpeg;base64,..."
 */
export function cleanBase64(base64Str: string): string {
  const match = base64Str.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
  return match ? match[1] : base64Str;
}

/**
 * Parses the raw Ollama response string into structured listing fields.
 */
function parseListingOutput(rawText: string, platform: Platform): GeneratedListing {
  const cleanText = rawText.trim();

  // 1. Try direct JSON parse
  try {
    const parsed = JSON.parse(cleanText);
    if (parsed && typeof parsed === 'object') {
      return {
        title: (parsed.title || '').trim(),
        description: (parsed.description || '').trim(),
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
          : typeof parsed.tags === 'string'
          ? parsed.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [],
        callToAction: (parsed.callToAction || parsed.cta || '').trim(),
        platform,
        rawOutput: cleanText,
      };
    }
  } catch {
    // Continue to fallback parsing
  }

  // 2. Try extracting JSON from markdown fences (```json ... ```)
  const jsonFenceMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonFenceMatch) {
    try {
      const parsed = JSON.parse(jsonFenceMatch[1]);
      if (parsed && typeof parsed === 'object') {
        return {
          title: (parsed.title || '').trim(),
          description: (parsed.description || '').trim(),
          tags: Array.isArray(parsed.tags)
            ? parsed.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
            : typeof parsed.tags === 'string'
            ? parsed.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [],
          callToAction: (parsed.callToAction || parsed.cta || '').trim(),
          platform,
          rawOutput: cleanText,
        };
      }
    } catch {
      // Continue to regex parsing
    }
  }

  // 3. Fallback regex extraction from plain markdown or text
  const titleMatch = cleanText.match(/(?:^|\n)(?:#+\s*)?(?:Title|TITLE)[:\s*]+([^\n]+)/i);
  const descMatch = cleanText.match(/(?:^|\n)(?:#+\s*)?(?:Description|DESCRIPTION)[:\s*]+([\s\S]+?)(?=\n(?:#+\s*)?(?:Tags|Keywords|Call to Action|CTA):|$)/i);
  const tagsMatch = cleanText.match(/(?:^|\n)(?:#+\s*)?(?:Tags|Keywords|TAGS)[:\s*]+([^\n]+)/i);
  const ctaMatch = cleanText.match(/(?:^|\n)(?:#+\s*)?(?:Call to Action|CTA|Closing)[:\s*]+([\s\S]+$)/i);

  const fallbackTitle = titleMatch ? titleMatch[1].trim() : cleanText.split('\n')[0].replace(/^#+\s*/, '').trim();
  const fallbackDesc = descMatch ? descMatch[1].trim() : cleanText;
  const fallbackTags = tagsMatch
    ? tagsMatch[1].split(',').map((t) => t.trim().replace(/^[-*]\s*/, '')).filter(Boolean)
    : [];
  const fallbackCta = ctaMatch ? ctaMatch[1].trim() : '';

  return {
    title: fallbackTitle,
    description: fallbackDesc,
    tags: fallbackTags,
    callToAction: fallbackCta,
    platform,
    rawOutput: cleanText,
  };
}

/**
 * Executes generate request to Ollama with model fallbacks
 */
export async function generateListing(
  images: string[] = [],
  description: string,
  platform: Platform = 'etsy'
): Promise<GeneratedListing> {
  const { systemPrompt, userPrompt } = getPlatformPrompt(platform, description, images.length > 0);
  const cleanedImages = images.map(cleanBase64).filter((img) => img.length > 0);

  let lastError: Error | null = null;

  // If images are provided, try vision-capable models first
  const modelsToTry = cleanedImages.length > 0
    ? ['llava:7b', 'llava', ...PREFERRED_MODELS]
    : PREFERRED_MODELS;

  for (const modelName of modelsToTry) {
    try {
      const isVisionModel = modelName.includes('llava');
      const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: userPrompt,
          system: systemPrompt,
          images: (cleanedImages.length > 0 && isVisionModel) ? cleanedImages : undefined,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (response.status === 404) {
        lastError = new Error(`Model "${modelName}" not found on Ollama instance.`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        lastError = new Error(`Ollama error (${response.status}): ${errorText}`);
        continue;
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      if (!data.response) {
        throw new Error('Ollama returned empty response');
      }

      const parsedListing = parseListingOutput(data.response, platform);
      return parsedListing;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      lastError = e;
      // If connection refused (Ollama not running), break immediately to save time
      if (e.message.includes('ECONNREFUSED') || e.message.includes('Failed to fetch')) {
        throw new Error(
          `Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Please ensure Ollama is installed and running ('ollama serve').`
        );
      }
    }
  }

  throw new Error(
    lastError?.message ||
      `Failed to generate listing with Ollama. Make sure you have pulled Gemma 3 by running 'ollama pull gemma3'.`
  );
}
