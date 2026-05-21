import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const patientId = formData.get('patient_id') as string;

  if (!patientId) return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('patient_id', patientId)
    .eq('sender_role', 'therapist')
    .is('read_at', null);

  // Redirect back to dashboard
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
