'use client';

import { useState } from 'react';

interface ShareBilanModalProps {
  patientId: string;
  patientName: string;
}

export function ShareBilanModal({ patientId, patientName }: ShareBilanModalProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSend = async () => {
    if (!email.trim()) return;
    setStatus('sending');

    const res = await fetch('/api/bilan/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, recipient_email: email.trim(), note: note.trim() }),
    });

    setStatus(res.ok ? 'sent' : 'error');
  };

  const firstName = patientName.split(' ')[0];

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-beige-300 hover:bg-beige-400 text-forest-800 text-sm font-semibold rounded-full transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Envoyer le bilan
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            onClick={() => { setOpen(false); setStatus('idle'); setEmail(''); setNote(''); }}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-4 duration-200">

            {status === 'sent' ? (
              /* Succès */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-forest-800 mb-2">Bilan envoyé !</h3>
                <p className="text-forest-500 text-sm mb-6">
                  Le bilan de {firstName} a été transmis à <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => { setOpen(false); setStatus('idle'); setEmail(''); setNote(''); }}
                  className="px-6 py-2.5 bg-forest-600 text-white rounded-2xl font-semibold text-sm hover:bg-forest-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-forest-800">Envoyer le bilan</h3>
                    <p className="text-sm text-forest-500 mt-1">
                      Le PDF de {firstName} sera joint à l'email.
                    </p>
                  </div>
                  <button
                    onClick={() => { setOpen(false); setStatus('idle'); }}
                    className="text-forest-400 hover:text-forest-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Formulaire */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-forest-700 mb-1.5">
                      Email du destinataire
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="medecin@cabinet.fr"
                      className="w-full px-4 py-3 rounded-2xl border border-beige-300 bg-beige-50 text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 text-sm transition-all"
                      autoFocus
                    />
                    <p className="text-xs text-forest-400 mt-1">Médecin du sommeil, pneumologue, médecin traitant…</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-forest-700 mb-1.5">
                      Message d'accompagnement <span className="font-normal text-forest-400">(optionnel)</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={`Bonjour, je vous transmets le bilan de rééducation respiratoire de ${firstName}…`}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-beige-300 bg-beige-50 text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 text-sm resize-none transition-all"
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      Une erreur s'est produite. Vérifiez l'adresse email et réessayez.
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setOpen(false); setStatus('idle'); }}
                      className="flex-1 py-3 rounded-2xl border border-beige-300 text-forest-700 font-semibold text-sm hover:bg-beige-100 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!email.trim() || status === 'sending'}
                      className="flex-1 py-3 rounded-2xl bg-forest-600 hover:bg-forest-700 disabled:bg-beige-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
                    >
                      {status === 'sending' ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Envoi…
                        </span>
                      ) : (
                        'Envoyer le bilan →'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
