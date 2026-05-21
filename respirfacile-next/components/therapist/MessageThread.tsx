'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_role: 'therapist' | 'patient';
  read_at: string | null;
  created_at: string;
}

interface MessageThreadProps {
  therapistId: string;
  patientId: string;
  patientName: string;
  initialMessages: Message[];
}

const QUICK_MESSAGES = [
  "Excellent travail cette semaine ! Continuez comme ça 💪",
  "J'ai vu vos résultats, belle progression sur la pause contrôlée !",
  "N'oubliez pas vos exercices aujourd'hui. Quelques minutes suffisent.",
  "Vos scores s'améliorent vraiment. Vous êtes sur la bonne voie 🌿",
  "J'ai ajusté votre programme. Regardez les nouveaux exercices.",
];

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function MessageThread({ therapistId, patientId, patientName, initialMessages }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        therapist_id: therapistId,
        patient_id: patientId,
        content: content.trim(),
        sender_role: 'therapist',
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setText('');
      setShowQuick(false);
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const firstName = patientName.split(' ')[0] || patientName;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-forest-500/10 flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <p className="font-semibold text-forest-800 mb-1">Commencez la conversation</p>
            <p className="text-sm text-forest-500 max-w-xs">
              Envoyez un encouragement à {firstName}. Les messages apparaissent directement dans son application.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isTherapist = msg.sender_role === 'therapist';
            return (
              <div key={msg.id} className={`flex ${isTherapist ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isTherapist ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isTherapist
                      ? 'bg-forest-600 text-white rounded-tr-sm'
                      : 'bg-beige-200 text-forest-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1.5 ${isTherapist ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-forest-400">{formatTime(msg.created_at)}</span>
                    {isTherapist && (
                      <span className="text-xs text-forest-400">
                        {msg.read_at ? '✓✓ Lu' : '✓ Envoyé'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Messages rapides */}
      {showQuick && (
        <div className="px-4 pb-2 flex flex-col gap-1.5">
          <p className="text-xs text-forest-500 font-medium mb-1">Messages rapides :</p>
          {QUICK_MESSAGES.map((qm, i) => (
            <button
              key={i}
              onClick={() => send(qm)}
              className="text-left text-xs text-forest-700 bg-beige-100 hover:bg-forest-50 border border-beige-300 hover:border-forest-300 px-3 py-2 rounded-xl transition-colors"
            >
              {qm}
            </button>
          ))}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t border-beige-200 px-4 py-3 bg-white">
        <div className="flex gap-2 items-end">
          <button
            onClick={() => setShowQuick((v) => !v)}
            className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-colors ${
              showQuick ? 'bg-forest-100 border-forest-300 text-forest-700' : 'border-beige-300 text-forest-400 hover:border-forest-300'
            }`}
            title="Messages rapides"
          >
            ⚡
          </button>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(text);
              }
            }}
            placeholder={`Message pour ${firstName}...`}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-beige-300 bg-beige-50 px-4 py-2 text-sm text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-all"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={() => send(text)}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-forest-600 hover:bg-forest-700 disabled:bg-beige-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-forest-400 mt-1.5 ml-10">Entrée pour envoyer · Shift+Entrée pour sauter une ligne</p>
      </div>
    </div>
  );
}
