'use client';

import { useState } from 'react';
import { GeneratedListing } from '@/types';
import PlatformBadge from './platform-badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Volume2, Loader2, RefreshCw, Download } from 'lucide-react';

interface ListingResultProps {
  result: GeneratedListing;
  onRegenerate: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={copy} className="h-7 gap-1.5 text-xs text-slate-400 hover:text-white">
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}

const PLATFORM_LIMITS: Record<string, { title: number; desc: number }> = {
  etsy: { title: 140, desc: 0 },
  ebay: { title: 80, desc: 0 },
  amazon: { title: 200, desc: 0 },
};

export default function ListingResult({ result, onRegenerate }: ListingResultProps) {
  const [speaking, setSpeaking] = useState(false);
  const [speakError, setSpeakError] = useState('');

  const limits = PLATFORM_LIMITS[result.platform] || { title: 200, desc: 0 };

  const fullListing = [
    `TITLE\n${result.title}`,
    `\nDESCRIPTION\n${result.description}`,
    result.tags.length ? `\nTAGS\n${result.tags.join(', ')}` : '',
    result.callToAction ? `\nCALL TO ACTION\n${result.callToAction}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const handleSpeak = async () => {
    setSpeaking(true);
    setSpeakError('');
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${result.title}. ${result.description}` }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch (err: unknown) {
      setSpeakError(err instanceof Error ? err.message : 'Failed to speak');
      setSpeaking(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([fullListing], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listing-${result.platform}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformBadge platform={result.platform} />
          <span className="text-sm text-slate-400">Listing generated ✓</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeak}
            disabled={speaking}
            className="gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            {speaking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
            {speaking ? 'Reading…' : 'Read Aloud'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="gap-1.5 border-white/20 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
      </div>

      {speakError && (
        <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">{speakError}</p>
      )}

      <Tabs defaultValue="title">
        <TabsList className="mb-4 w-full bg-white/5">
          <TabsTrigger value="title" className="flex-1 text-xs">Title</TabsTrigger>
          <TabsTrigger value="description" className="flex-1 text-xs">Description</TabsTrigger>
          <TabsTrigger value="tags" className="flex-1 text-xs">Tags</TabsTrigger>
          <TabsTrigger value="full" className="flex-1 text-xs">Full Listing</TabsTrigger>
        </TabsList>

        {/* Title */}
        <TabsContent value="title">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {result.title.length}/{limits.title} chars
              </span>
              <CopyButton text={result.title} />
            </div>
            <p className="rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-white">
              {result.title}
            </p>
          </div>
        </TabsContent>

        {/* Description */}
        <TabsContent value="description">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{result.description.length} chars</span>
              <CopyButton text={result.description} />
            </div>
            <div className="rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-white whitespace-pre-wrap">
              {result.description}
            </div>
          </div>
        </TabsContent>

        {/* Tags */}
        <TabsContent value="tags">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{result.tags.length} tags</span>
              <CopyButton text={result.tags.join(', ')} />
            </div>
            <div className="flex flex-wrap gap-2">
              {result.tags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                  onClick={() => navigator.clipboard.writeText(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {result.callToAction && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Call to Action</span>
                  <CopyButton text={result.callToAction} />
                </div>
                <p className="rounded-lg bg-white/5 p-3 text-sm italic text-slate-300">
                  {result.callToAction}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Full Listing */}
        <TabsContent value="full">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{fullListing.length} chars total</span>
              <CopyButton text={fullListing} />
            </div>
            <pre className="rounded-lg bg-white/5 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-mono overflow-auto max-h-80">
              {fullListing}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
