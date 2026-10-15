'use client';

import { useState } from 'react';
import { GeneratedListing, ImageUploadItem, Platform } from '@/types';
import ImageUploader from './image-uploader';
import ListingResult from './listing-result';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';

const PLATFORM_OPTIONS: { value: Platform; label: string; emoji: string; desc: string }[] = [
  { value: 'etsy', label: 'Etsy', emoji: '🛍️', desc: 'Handmade & artisan style' },
  { value: 'ebay', label: 'eBay', emoji: '🔨', desc: 'Specs & condition focused' },
  { value: 'amazon', label: 'Amazon', emoji: '📦', desc: 'Benefit-led & keyword rich' },
];

export default function ListingForm() {
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Platform>('etsy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedListing | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && images.length === 0) {
      setError('Please add a description or at least one product photo.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('platform', platform);
      images.forEach((item) => formData.append('images', item.file));

      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult({ ...data, platform });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    setError('');
  };

  if (result) {
    return <ListingResult result={result} onRegenerate={handleRegenerate} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <label className="mb-3 block text-sm font-medium text-white">
          Product Photos <span className="text-slate-400">(optional, up to 3)</span>
        </label>
        <ImageUploader items={images} onChange={setImages} maxFiles={3} />
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <label className="mb-3 block text-sm font-medium text-white">
          Product Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product: material, size, color, unique features, who it's for…"
          rows={4}
          className="resize-none border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-purple-500"
        />
        <p className="mt-2 text-xs text-slate-500">{description.length} characters</p>
      </div>

      {/* Platform Selector Cards */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <label className="mb-3 block text-sm font-semibold text-white">
          Target Marketplace
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLATFORM_OPTIONS.map((opt) => {
            const isSelected = platform === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPlatform(opt.value)}
                className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="font-semibold text-white text-base">{opt.label}</span>
                </div>
                <span className="text-xs text-slate-300 leading-relaxed">{opt.desc}</span>
                {isSelected && (
                  <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-purple-400 ring-4 ring-purple-400/20" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-base font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating with Gemma 3…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Listing
          </>
        )}
      </Button>

      {loading && (
        <p className="text-center text-xs text-slate-500">
          Running Gemma 3 locally via Ollama — this takes 10–30 seconds
        </p>
      )}
    </form>
  );
}
