import type { MarketEvent } from '../types';

interface Props {
  event: MarketEvent | null;
  onClose: () => void;
}

const impactLabel = { bullish: 'Haussier', bearish: 'Baissier', neutral: 'Neutre' };
const impactClass = { bullish: 'badge-bullish', bearish: 'badge-bearish', neutral: 'badge-neutral' };
const impactIcon = { bullish: '↑', bearish: '↓', neutral: '—' };

export default function EventModal({ event, onClose }: Props) {
  if (!event) return null;

  const date = new Date(event.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={impactClass[event.impact]}>
                {impactIcon[event.impact]} {impactLabel[event.impact]}
              </span>
              <span className="text-xs text-text-muted">{date}</span>
            </div>
            <h3 className="text-base font-semibold text-text-primary leading-snug">{event.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>

        {event.source_url && (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-primary hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Source
          </a>
        )}

        <button onClick={onClose} className="btn-ghost w-full mt-4">Fermer</button>
      </div>
    </div>
  );
}
