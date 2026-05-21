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
      <div className="bg-green-50 rounded-3xl border border-green-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">✓</span>
          <h3 className="font-bold text-green-900 text-lg">Tous vos patients sont actifs cette semaine</h3>
        </div>
        <p className="text-green-700 text-sm">Aucune alerte pour le moment. Continuez comme ça!</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚠️</span>
        <h3 className="font-bold text-amber-900 text-lg">
          {alerts.length} alerte{alerts.length > 1 ? 's' : ''} patient{alerts.length > 1 ? 's' : ''}
        </h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.patientId}
            className="bg-white rounded-2xl p-4 border border-amber-100 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1">{alert.patientName}</p>
              <p className="text-sm text-amber-700">{alert.details}</p>
            </div>
            <Link
              href={`/therapist/patients/${alert.patientId}`}
              className="ml-4 px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium text-sm transition-colors whitespace-nowrap"
            >
              Voir →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
