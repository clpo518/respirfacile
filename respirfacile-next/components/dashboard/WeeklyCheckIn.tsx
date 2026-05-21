"use client";

import Link from "next/link";

interface WeeklyCheckInProps {
  hasJournalThisWeek?: boolean;
}

export function WeeklyCheckIn({ hasJournalThisWeek = false }: WeeklyCheckInProps) {
  if (hasJournalThisWeek) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">✓</span>
        <div>
          <p className="font-semibold text-green-800">Bilan de la semaine fait !</p>
          <Link href="/journal" className="text-sm text-green-600 underline hover:text-green-700">
            Voir mon journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-amber-900">Comment s&apos;est passée votre semaine ? 📝</p>
          <p className="text-sm text-amber-700 mt-1">Partagez votre ressenti avec votre orthophoniste</p>
        </div>
        <Link
          href="/journal"
          className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors whitespace-nowrap"
        >
          Faire mon bilan
        </Link>
      </div>
    </div>
  );
}
