import { Platform } from '@/types';

const PLATFORM_CONFIG: Record<Platform, { emoji: string; label: string; className: string }> = {
  etsy: {
    emoji: '🛍️',
    label: 'Etsy',
    className: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  ebay: {
    emoji: '🔨',
    label: 'eBay',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  amazon: {
    emoji: '📦',
    label: 'Amazon',
    className: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
};

export default function PlatformBadge({ platform }: { platform: Platform }) {
  const config = PLATFORM_CONFIG[platform];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
