export type Platform = 'etsy' | 'ebay' | 'amazon';

export interface GeneratedListing {
  title: string;
  description: string;
  tags: string[];
  callToAction: string;
  platform: Platform;
  bulletPoints?: string[];
  shippingNotes?: string;
  rawOutput?: string;
}

export interface GenerateListingRequest {
  images: string[]; // base64 strings (without data:image/... prefix or with it handled)
  description: string;
  platform: Platform;
}

export interface GenerateListingResponse {
  success: boolean;
  listing?: GeneratedListing;
  error?: string;
}

export interface SpeakRequest {
  text: string;
  voiceId?: string;
}

export interface ImageUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}
