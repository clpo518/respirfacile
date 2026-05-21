import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface PatientMessagesProps {
  patientId: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Aujourd\'hui ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export async function PatientMessages({ patientId }: PatientMessagesProps) {
  const supabase = await createClient();

  // Récupérer les 3 derniers messages reçus
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, read_at, created_at, therapist_id')
    .eq('patient_id', patientId)
    .eq('sender_role', 'therapist')
    .order('created_at', { ascending: false })
    .limit(3);

  const unreadCount = (messages || []).filter((m) => !m.read_at).length;

  if (!messages || messages.length === 0) return null;

  return (
    <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige mb-8 overflow-hidden">
      {/* Header avec badge non-lu */}
      <div className="px-6 py-4 border-b border-beige-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h2 className="font-semibold text-forest-800">Messages de votre thérapeute</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-copper-500 text-white text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="divide-y divide-beige-200">
        {messages.map((msg) => (
          <div key={msg.id} className={`px-6 py-4 flex items-start gap-3 ${!msg.read_at ? 'bg-forest-500/5' : ''}`}>
            {!msg.read_at && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-copper-500 mt-2" />
            )}
            <div className={`flex-1 min-w-0 ${msg.read_at ? 'pl-5' : ''}`}>
              <p className={`text-sm leading-relaxed ${!msg.read_at ? 'font-medium text-forest-800' : 'text-forest-700'}`}>
                {msg.content}
              </p>
              <p className="text-xs text-forest-400 mt-1">{formatTime(msg.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA marquer comme lus */}
      {unreadCount > 0 && (
        <div className="px-6 py-3 bg-beige-50 border-t border-beige-200">
          <MarkAsReadButton patientId={patientId} />
        </div>
      )}
    </div>
  );
}

// Client component pour marquer comme lu
function MarkAsReadButton({ patientId }: { patientId: string }) {
  return (
    <form action={`/api/messages/mark-read`} method="POST">
      <input type="hidden" name="patient_id" value={patientId} />
      <button
        type="submit"
        className="text-xs text-forest-600 hover:text-forest-800 font-medium transition-colors"
      >
        Marquer comme lus ✓
      </button>
    </form>
  );
}
