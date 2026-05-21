'use client';

import Link from 'next/link';
import { getRetentionStatus, getRetentionInfo, daysSince } from '@/lib/retention';

interface Patient {
  id: string;
  full_name: string;
  email: string;
  profile_type?: string;
  lastSessionDate?: string;
  sessionsThisWeek?: number;
  sessionsTotal?: number;
  prescriptionsCount?: number;
  journalAlerts?: boolean;
}

interface PatientsTableProps {
  patients: Patient[];
  onFilterChange?: (filter: 'all' | 'active' | 'slipping' | 'inactive') => void;
  currentFilter?: string;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]?.toUpperCase()).join('').slice(0, 2);
};

export default function PatientsTable({ patients, onFilterChange, currentFilter = 'all' }: PatientsTableProps) {
  const counts = {
    all: patients.length,
    active: patients.filter((p) => getRetentionStatus(daysSince(p.lastSessionDate), !!p.lastSessionDate) === 'active').length,
    slipping: patients.filter((p) => getRetentionStatus(daysSince(p.lastSessionDate), !!p.lastSessionDate) === 'slipping').length,
    inactive: patients.filter((p) => {
      const s = getRetentionStatus(daysSince(p.lastSessionDate), !!p.lastSessionDate);
      return s === 'dropout' || s === 'new';
    }).length,
  };

  return (
    <div className="bg-white rounded-3xl border border-beige-200 shadow-sm overflow-hidden">
      {/* Filtres */}
      {onFilterChange && (
        <div className="border-b border-beige-200 px-6 py-3 flex gap-2 flex-wrap">
          {[
            { key: 'all', label: `Tous (${counts.all})`, active: 'bg-forest-100 text-forest-700' },
            { key: 'active', label: `✅ Actifs (${counts.active})`, active: 'bg-green-100 text-green-700' },
            { key: 'slipping', label: `⚠️ En baisse (${counts.slipping})`, active: 'bg-amber-100 text-amber-700' },
            { key: 'inactive', label: `🔴 Inactifs (${counts.inactive})`, active: 'bg-red-100 text-red-700' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key as any)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentFilter === key ? active : 'text-forest-600 hover:bg-beige-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-beige-50 border-b border-beige-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-forest-600 uppercase tracking-wider">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-forest-600 uppercase tracking-wider">Rétention</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-forest-600 uppercase tracking-wider">Dernière séance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-forest-600 uppercase tracking-wider">Séances</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-forest-600 uppercase tracking-wider">Programme</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-forest-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-100">
            {patients.map((patient) => {
              const d = daysSince(patient.lastSessionDate);
              const hasEver = !!patient.lastSessionDate;
              const status = getRetentionStatus(d, hasEver);
              const info = getRetentionInfo(status);

              return (
                <tr key={patient.id} className="hover:bg-beige-50 transition-colors">
                  {/* Patient */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${info.bgColor} ${info.textColor}`}>
                        {getInitials(patient.full_name)}
                      </div>
                      <div>
                        <p className="font-semibold text-forest-800 text-sm">{patient.full_name || 'Sans nom'}</p>
                        <p className="text-xs text-forest-400">{patient.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Badge rétention */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${info.bgColor} ${info.textColor} ${info.borderColor}`}>
                      {info.emoji} {info.label}
                    </span>
                  </td>

                  {/* Dernière séance */}
                  <td className="px-4 py-4">
                    <span className={`text-sm font-medium ${d <= 2 ? 'text-green-600' : d <= 5 ? 'text-amber-600' : 'text-red-500'}`}>
                      {patient.lastSessionDate
                        ? d === 0 ? "Aujourd'hui" : d === 1 ? 'Hier' : `Il y a ${d}j`
                        : 'Jamais'}
                    </span>
                  </td>

                  {/* Séances */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-forest-800">{patient.sessionsTotal || 0}</span>
                      <span className="text-xs text-forest-400">total</span>
                    </div>
                    {(patient.sessionsThisWeek || 0) > 0 && (
                      <p className="text-xs text-green-600 font-medium">{patient.sessionsThisWeek} cette semaine</p>
                    )}
                  </td>

                  {/* Programme prescrit */}
                  <td className="px-4 py-4">
                    {(patient.prescriptionsCount || 0) > 0 ? (
                      <Link
                        href={`/therapist/patients/${patient.id}/program`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 bg-forest-50 border border-forest-200 px-2 py-1 rounded-full hover:bg-forest-100 transition-colors"
                      >
                        💊 {patient.prescriptionsCount} exercice{(patient.prescriptionsCount || 0) > 1 ? 's' : ''}
                      </Link>
                    ) : (
                      <Link
                        href={`/therapist/patients/${patient.id}/program`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                      >
                        📋 Prescrire
                      </Link>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <div className="relative group">
                        <Link href={`/therapist/patients/${patient.id}`} className="px-2.5 py-1.5 rounded-lg hover:bg-beige-100 text-forest-600 text-xs font-medium transition-colors block">
                          📊
                        </Link>
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-forest-800 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                          Bilan & progrès
                        </span>
                      </div>
                      <div className="relative group">
                        <Link href={`/therapist/patients/${patient.id}/messages`} className="px-2.5 py-1.5 rounded-lg hover:bg-beige-100 text-forest-600 text-xs font-medium transition-colors block">
                          💬
                        </Link>
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-forest-800 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                          Envoyer un message
                        </span>
                      </div>
                      <div className="relative group">
                        <Link href={`/therapist/patients/${patient.id}/notes`} className="px-2.5 py-1.5 rounded-lg hover:bg-beige-100 text-forest-600 text-xs font-medium transition-colors block">
                          ✏️
                        </Link>
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-forest-800 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                          Notes de séance
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
