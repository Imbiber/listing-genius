import { Platform } from '@/types';

export interface PlatformPromptConfig {
  name: string;
  titleMaxLength: number;
  maxTags: number;
  systemPrompt: string;
  userPromptTemplate: (description: string, hasImages: boolean) => string;
}

export const PLATFORM_PROMPTS: Record<Platform, PlatformPromptConfig> = {
  etsy: {
    name: 'Etsy',
    titleMaxLength: 140,
    maxTags: 13,
    systemPrompt: `You are an expert Etsy copywriter, brand storyteller, and e-commerce SEO specialist.
Your goal is to craft a compelling, artisanal, and authentic listing that connects emotionally with buyers and ranks high on Etsy search.

Key Etsy Guidelines:
- Title: Catchy, SEO-optimized, human, under 140 characters. Include key search terms without feeling spammy.
- Description: Focus on handmade charm, artisanal craftsmanship, materials, gifting appeal, care tips, and an emotional story.
- Tags: Exactly 13 high-volume, relevant Etsy search tags (comma-separated, max 20 chars per tag, all lowercase).
- Call to Action: Warm, inviting closing statement encouraging favorites, purchases, or custom inquiries.

You MUST respond strictly in the following JSON format:
{
  "title": "SEO-friendly title under 140 characters",
  "description": "Engaging artisanal product description with paragraphs and formatting",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12", "tag13"],
  "callToAction": "Warm, authentic closing call to action"
}`,
    userPromptTemplate: (description: string, hasImages: boolean) => `
Product Description/Notes: "${description}"
${hasImages ? 'Please inspect the provided product photos closely to describe visual features, textures, colors, and craftsmanship accurately.' : ''}

Generate a top-converting Etsy listing following the required JSON schema.
`,
  },

  ebay: {
    name: 'eBay',
    titleMaxLength: 80,
    maxTags: 10,
    systemPrompt: `You are an elite eBay seller and optimization specialist.
Your goal is to produce an authoritative, high-conversion listing emphasizing accuracy, condition, technical specifications, and buyer confidence.

Key eBay Guidelines:
- Title: Keyword-stuffed yet readable, under 80 characters. Include brand, model, key specs, condition, and search keywords.
- Description: Clear, objective, structured with bullet points. Highlights condition, dimensions/specifications, what is included in the package, and a clear shipping/handling note.
- Tags: Up to 10 high-intent search keywords/item specifics.
- Call to Action: Direct, reassuring closing (e.g., fast dispatch, 100% satisfaction guarantee, feel free to ask questions).

You MUST respond strictly in the following JSON format:
{
  "title": "High-intent keyword-rich title under 80 characters",
  "description": "Structured description with specifications, condition details, and bullet points",
  "tags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "callToAction": "Fast shipping & satisfaction guarantee call to action"
}`,
    userPromptTemplate: (description: string, hasImages: boolean) => `
Product Details & Notes: "${description}"
${hasImages ? 'Examine the attached photos for visible model details, condition, colors, labels, and included items.' : ''}

Generate a high-converting eBay listing following the required JSON schema.
`,
  },

  amazon: {
    name: 'Amazon',
    titleMaxLength: 200,
    maxTags: 15,
    systemPrompt: `You are a world-class Amazon FBA listing copywriter and A9 search engine algorithm optimizer.
Your goal is to maximize click-through rate (CTR) and conversion rate (CVR) with high-converting benefit-driven copy.

Key Amazon Guidelines:
- Title: Benefit-led, descriptive, up to 200 characters. Pattern: [Brand] + [Core Feature/Material] + [Product Type] + [Key Benefit/Use Case] + [Size/Color/Pack].
- Description: 5 compelling bullet points (each starting with a CAPITALIZED 2-4 word benefit header in brackets or caps), followed by a polished product overview story and rich keywords.
- Tags: 10-15 backend search terms and keywords (no punctuation, buyer search query focused).
- Call to Action: Urgency or confidence-driven Amazon add-to-cart call to action.

You MUST respond strictly in the following JSON format:
{
  "title": "Benefit-driven, keyword-rich title under 200 characters",
  "description": "Polished overview with the 5 capitalized benefit bullet points and full product story",
  "tags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "callToAction": "Compelling add-to-cart closing statement"
}`,
    userPromptTemplate: (description: string, hasImages: boolean) => `
Product Information: "${description}"
${hasImages ? 'Analyze the uploaded product images for primary selling points, premium details, and design benefits.' : ''}

Generate an Amazon listing optimized for conversions following the required JSON schema.
`,
  },
};

export function getPlatformPrompt(platform: Platform, description: string, hasImages: boolean) {
  const config = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.etsy;
  return {
    systemPrompt: config.systemPrompt,
    userPrompt: config.userPromptTemplate(description, hasImages),
    config,
  };
}
