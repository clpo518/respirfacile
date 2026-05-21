import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { JournalForm } from '@/components/journal/JournalForm';
import { JournalEntries } from '@/components/journal/JournalEntries';
import { PatientNavbar } from '@/components/layout/PatientNavbar';

export default async function JournalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isTherapist = profile?.role === 'therapist' || profile?.role === 'kine';

  if (isTherapist) {
    redirect('/therapist');
  }

  // Fetch journal entries
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      <PatientNavbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-800 mb-2">
            📓 Journal de bord
          </h1>
          <p className="text-forest-600">
            Partagez vos sensations, vos progrès et vos observations avec votre orthophoniste. C'est comme avoir une conversation régulière ensemble.
          </p>
        </div>

        {/* New entry form */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 p-8 shadow-beige mb-8">
          <h2 className="font-semibold text-xl text-forest-800 mb-6">
            Nouvelle entrée
          </h2>
          <JournalForm userId={user.id} />
        </div>

        {/* Previous entries */}
        <div>
          <h2 className="font-semibold text-xl text-forest-800 mb-6">
            Historique ({entries?.length || 0} entrées)
          </h2>
          <JournalEntries entries={entries ?? []} />
        </div>
      </main>
    </div>
  );
}
