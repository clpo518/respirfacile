import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Users, Clock, HelpCircle, Save, RotateCcw, ListChecks, StopCircle, FileText, PenLine } from "lucide-react";

export interface SelectedPatient {
  mode: 'existing' | 'guest';
  patientId?: string;
  patientName?: string;
  birthYear?: number;
  gender?: 'M' | 'F';
}

interface Props {
  onSelect: (patient: SelectedPatient) => void;
}

const PatientSelector: React.FC<Props> = ({ onSelect }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'existing' | 'guest'>('existing');
  const [patients, setPatients] = useState<{ id: string; full_name: string | null; birth_year: number | null }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [guestBirthYear, setGuestBirthYear] = useState('');
  const [guestGender, setGuestGender] = useState<'M' | 'F'>('M');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('id, full_name, birth_year')
      .eq('linked_therapist_id', user.id)
      .eq('is_archived', false)
      .order('full_name')
      .then(({ data }) => {
        if (data) setPatients(data);
      });
  }, [user]);

  const handleSubmit = () => {
    if (mode === 'existing' && selectedPatientId) {
      const p = patients.find(x => x.id === selectedPatientId);
      onSelect({
        mode: 'existing',
        patientId: selectedPatientId,
        patientName: p?.full_name || 'Patient',
        birthYear: p?.birth_year || undefined,
      });
    } else if (mode === 'guest' && guestName.trim()) {
      onSelect({
        mode: 'guest',
        patientName: guestName.trim(),
        birthYear: guestBirthYear ? parseInt(guestBirthYear) : undefined,
        gender: guestGender,
      });
    }
  };

  const isValid = mode === 'existing' ? !!selectedPatientId : guestName.trim().length > 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">Nouveau bilan</h2>
        <p className="text-muted-foreground">
          Batterie d'Évaluation du Bredouillement (Van Zaalen et al., 2018)
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 30–45 min
          </span>
          <span>•</span>
          <span>7 épreuves</span>
          <span>•</span>
          <span>Batterie Van Zaalen</span>
        </div>
      </div>

      {/* Value prop — visible immediately */}
      <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-green-700 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Rapport pré-rempli — Export PDF + Word</p>
            <p className="text-sm text-muted-foreground mt-1">
               Laissez le patient faire les épreuves — l'outil enregistre, mesure et analyse tout en temps réel.
               À la fin, vous récupérez un <strong>bilan complet pré-rempli</strong> exportable en PDF ou en <strong>Word personnalisable</strong> (ajoutez votre en-tête, modifiez le texte…).
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-background/80 p-2">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">🎙</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Audio réécoutable par épreuve</div>
          </div>
          <div className="rounded-lg bg-background/80 p-2">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">⚡</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Vitesse & scores calculés automatiquement</div>
          </div>
          <div className="rounded-lg bg-background/80 p-2">
            <div className="text-lg font-bold text-green-700 dark:text-green-400">📄</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">PDF normé en 1 clic</div>
          </div>
        </div>
      </div>

      {/* Help button — clearly visible */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Comment se déroule le bilan ?</p>
              <p className="text-xs text-muted-foreground">Déroulé, sauvegarde automatique, reprise…</p>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guide de passation</DialogTitle>
            <DialogDescription>
              Tout ce qu'il faut savoir avant de commencer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <ListChecks className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">7 épreuves • ~30-45 min</h3>
                <p className="text-muted-foreground">
                  Le protocole vous guide étape par étape : questionnaire PCI, parole spontanée, motricité orale (OMAS),
                  encodage phonologique (SPA), reformulation, lecture et écriture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Rapport pré-rempli — Export PDF + Word</h3>
                <p className="text-muted-foreground">
                  À la fin, toutes les mesures sont reportées dans un tableau comparatif normé. <strong>Vous pouvez ajuster chaque valeur</strong> avant de générer le rapport.
                  Le PDF ne vous bloque pas : <strong>téléchargez en Word</strong> pour personnaliser, ajouter votre en-tête et l'intégrer à votre compte-rendu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <PenLine className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Disfluences : détection automatique</h3>
                <p className="text-muted-foreground">
                  Les disfluences (répétitions, prolongations, blocages, interjections…) sont <strong>détectées automatiquement</strong> à partir
                  de l'enregistrement audio. Les compteurs sont pré-remplis — <strong>vérifiez et ajustez</strong> si besoin.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Save className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Sauvegarde automatique</h3>
                <p className="text-muted-foreground">
                  À chaque passage d'étape, vos données sont enregistrées. Vous ne perdrez rien si vous quittez.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Reprendre un bilan</h3>
                <p className="text-muted-foreground">
                  Les bilans en cours apparaissent ci-dessous. Cliquez sur « Reprendre » pour revenir exactement où vous en étiez.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <StopCircle className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">Arrêt anticipé</h3>
                <p className="text-muted-foreground">
                  Après le questionnaire PCI, si le score ne suggère pas de bredouillement, vous pouvez choisir de ne pas poursuivre la batterie complète.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'existing' | 'guest')} className="grid grid-cols-2 gap-3">
        <Label
          htmlFor="mode-existing"
          className={`flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === 'existing' ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <RadioGroupItem value="existing" id="mode-existing" />
          <Users className="w-4 h-4" />
          <span className="font-medium">Patient suivi</span>
        </Label>
        <Label
          htmlFor="mode-guest"
          className={`flex items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${mode === 'guest' ? 'border-primary bg-primary/5' : 'border-border'}`}
        >
          <RadioGroupItem value="guest" id="mode-guest" />
          <UserPlus className="w-4 h-4" />
          <span className="font-medium">Patient non inscrit</span>
        </Label>
      </RadioGroup>

      {mode === 'existing' ? (
        <div className="space-y-3">
          <Label>Patient</Label>
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un patient…" />
            </SelectTrigger>
            <SelectContent>
              {patients.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name || 'Sans nom'} {p.birth_year ? `(${new Date().getFullYear() - p.birth_year} ans)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {patients.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun patient lié à votre compte. Utilisez « Patient non inscrit » pour un bilan ponctuel.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="guest-name">Nom complet *</Label>
            <Input
              id="guest-name"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="Prénom Nom"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="guest-birth-year">Année de naissance</Label>
              <Input
                id="guest-birth-year"
                type="number"
                value={guestBirthYear}
                onChange={e => setGuestBirthYear(e.target.value)}
                placeholder="ex : 1990"
                min={1920}
                max={new Date().getFullYear() - 5}
              />
            </div>
            <div>
              <Label>Sexe</Label>
              <Select value={guestGender} onValueChange={(v) => setGuestGender(v as 'M' | 'F')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Homme</SelectItem>
                  <SelectItem value="F">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} disabled={!isValid} className="w-full" size="lg">
        Commencer le bilan
      </Button>
    </div>
  );
};

export default PatientSelector;
