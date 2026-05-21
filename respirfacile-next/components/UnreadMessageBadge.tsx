import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface UnreadMessageBadgeProps {
  patientId: string;
}

export async function UnreadMessageBadge({ patientId }: UnreadMessageBadgeProps) {
  const supabase = await createClient();

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('sender_role', 'therapist')
    .is('read_at', null);

  const unread = count || 0;

  if (unread === 0) return null;

  return (
    <Link
      href="/dashboard#messages"
      className="relative inline-flex items-center gap-2 bg-copper-500 hover:bg-copper-600 text-white text-sm font-semibold px-4 py-2 rounded-2xl transition-colors shadow-md"
    >
      <span>💬</span>
      <span>{unread} nouveau{unread > 1 ? 'x' : ''} message{unread > 1 ? 's' : ''}</span>
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
    </Link>
  );
}
