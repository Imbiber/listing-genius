import ListingForm from '@/components/listing-form';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-4 py-1.5 text-sm text-purple-300">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Gemma 3 · Runs 100% Locally · Zero API Costs
          </div>
          <h1 className="mb-4 text-5xl font-bold text-white">
            Turn Any Product Into a
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Listing That Sells
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Upload photos, describe your item, pick your platform.
            Get a polished, SEO-ready listing in seconds.
            Your data never leaves your computer.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-12 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '$0', label: 'API costs' },
            { value: '3', label: 'Platforms' },
            { value: '100%', label: 'Private' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <ListingForm />

        <footer className="mt-16 text-center text-sm text-slate-500">
          Built with Gemma 2 + Ollama + ElevenLabs · Open Source · No API costs ·{' '}
          <a
            href="https://github.com/Imbiber/listing-genius"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            View on GitHub
          </a>
          {' '}· Made for{' '}
          <a
            href="https://dev.to/challenges/hf26"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            Hacktoberfest 2026
          </a>
        </footer>
      </div>
    </main>
  );
}
