'use client';

import Link from 'next/link';

interface JournalEntry {
  id: string;
  user_id: string;
  patient_name: string;
  created_at: string;
  wellbeing_score?: number;
  anxiety_level?: number;
  notes?: string;
}

interface RecentJournalEntriesProps {
  entries: JournalEntry[];
}

const emojiScale = (score?: number): string => {
  if (!score) return '—';
  if (score <= 2) return '😔';
  if (score <= 4) return '😐';
  if (score <= 6) return '🙂';
  if (score <= 8) return '😊';
  return '😄';
};

const formatDate = (iso: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};

export default function RecentJournalEntries({ entries }: RecentJournalEntriesProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-beige-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-forest-800 mb-4">📓 Derniers bilans</h3>
        <p className="text-sm text-forest-600 text-center py-8">
          Aucun bilan journal pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-beige-200 p-8 shadow-sm">
      <h3 className="text-lg font-bold text-forest-800 mb-4">📓 Derniers bilans</h3>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 rounded-2xl bg-beige-50 border border-beige-200 hover:bg-beige-100 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-forest-800">{entry.patient_name}</p>
              <p className="text-xs text-forest-500">{formatDate(entry.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xl">{emojiScale(entry.wellbeing_score)}</div>
              <p className="text-xs font-medium text-forest-700">
                Bien-être {entry.wellbeing_score || '—'}/10
              </p>
            </div>
            {entry.anxiety_level && entry.anxiety_level >= 7 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                ⚠️ Anxiété
              </span>
            )}
          </div>
        ))}
        {entries.length > 0 && (
          <Link
            href="/therapist/patients"
            className="block text-center py-3 text-forest-600 hover:text-forest-800 font-medium text-sm"
          >
            Voir tous les bilans journal →
          </Link>
        )}
      </div>
    </div>
  );
}
