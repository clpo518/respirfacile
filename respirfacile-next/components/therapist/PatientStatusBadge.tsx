'use client';

interface PatientStatusBadgeProps {
  lastSessionDays: number;
  hasJournalAlert: boolean;
}

export default function PatientStatusBadge({
  lastSessionDays,
  hasJournalAlert,
}: PatientStatusBadgeProps) {
  if (hasJournalAlert) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        ⚠️ Attention
      </span>
    );
  }
  if (lastSessionDays > 7) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        📅 Inactif {lastSessionDays}j
      </span>
    );
  }
  if (lastSessionDays > 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        🔵 Ralenti
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      ✓ Actif
    </span>
  );
}
