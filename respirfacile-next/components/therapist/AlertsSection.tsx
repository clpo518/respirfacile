'use client';

import Link from 'next/link';

interface Alert {
  patientId: string;
  patientName: string;
  reason: string;
  details: string;
  daysInactive?: number;
}

interface AlertsSectionProps {
  alerts: Alert[];
}

export default function AlertsSection({ alerts }: AlertsSectionProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-2xl border border-green-200 px-5 py-4 flex items-center gap-3">
        <span className="text-xl flex-shrink-0">🌿</span>
        <div>
          <p className="font-semibold text-green-900 text-sm">Tous vos patients sont actifs</p>
          <p className="text-green-700 text-xs mt-0.5">Aucune alerte pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚠️</span>
        <h3 className="font-bold text-amber-900 text-sm">
          {alerts.length} patient{alerts.length > 1 ? 's' : ''} à relancer
        </h3>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.patientId}
            className="bg-white rounded-xl p-3.5 border border-amber-100 flex items-center justify-between gap-3 hover:bg-amber-50/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 text-sm truncate">{alert.patientName}</p>
              <p className="text-xs text-amber-700 mt-0.5">{alert.details}</p>
            </div>
            <Link
              href={`/therapist/patients/${alert.patientId}`}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold text-xs transition-colors whitespace-nowrap"
            >
              Voir →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
