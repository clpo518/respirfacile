'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickNoteModalProps {
  isOpen: boolean;
  patientName: string;
  patientId: string;
  onClose: () => void;
  onSave: (note: string, isVisibleToPatient: boolean) => Promise<void>;
}

export default function QuickNoteModal({
  isOpen,
  patientName,
  patientId,
  onClose,
  onSave,
}: QuickNoteModalProps) {
  const [note, setNote] = useState('');
  const [isVisibleToPatient, setIsVisibleToPatient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setIsSaving(true);
    try {
      await onSave(note.trim(), isVisibleToPatient);
      setNote('');
      setIsVisibleToPatient(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30 }}
            className="relative w-full sm:w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-forest-800">Note rapide</h2>
                <p className="text-sm text-forest-600 mt-1">{patientName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-forest-400 hover:text-forest-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Textarea */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Écrivez votre observation clinique..."
                className="w-full h-32 px-4 py-3 rounded-2xl border border-beige-200 focus:border-forest-400 focus:outline-none resize-none text-sm placeholder-forest-400"
              />

              {/* Visibility checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisibleToPatient}
                  onChange={(e) => setIsVisibleToPatient(e.target.checked)}
                  className="w-5 h-5 rounded border-beige-300 text-forest-600 focus:ring-forest-400"
                />
                <span className="text-sm text-forest-700">
                  👁️ Visible par le patient
                </span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-2xl border border-beige-300 text-forest-700 font-medium hover:bg-beige-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!note.trim() || isSaving}
                  className="flex-1 px-4 py-3 rounded-2xl bg-forest-600 text-white font-medium hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
