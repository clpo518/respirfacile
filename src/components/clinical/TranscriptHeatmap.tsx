import { useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Info, AlertTriangle, Pencil } from "lucide-react";
import { 
  analyzeDisfluency, 
  calculateFluencyScore,
  getDisfluencyEmoji, 
  getDisfluencyLabel,
  type WordTimestamp,
  type DisfluencyMarker 
} from "@/lib/analyzeDisfluency";
import { calculateRegularityScore } from "@/lib/speechRegularity";
import { getPhonemeProfile } from "@/lib/phonemeProfile";
import DisfluencyInfoModal from "./DisfluencyInfoModal";
import { cn } from "@/lib/utils";

interface TranscriptHeatmapProps {
  wordTimestamps: WordTimestamp[];
  className?: string;
  editable?: boolean;
  onWordEdit?: (index: number, newWord: string) => void;
  /** Show clinical-level details (regularity, phonemes). Default false = patient view */
  isTherapist?: boolean;
}

const TranscriptHeatmap = ({ wordTimestamps, className, editable = false, onWordEdit, isTherapist = false }: TranscriptHeatmapProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  // Analyze disfluencies
  const analysis = useMemo(() => analyzeDisfluency(wordTimestamps), [wordTimestamps]);
  
  const fluencyScore = useMemo(() => calculateFluencyScore(wordTimestamps, analysis), [wordTimestamps, analysis]);

  const regularityScore = useMemo(() => calculateRegularityScore(wordTimestamps), [wordTimestamps]);
  
  const phonemeProfile = useMemo(() => getPhonemeProfile(analysis.markers), [analysis.markers]);

  // Count fillers from word timestamps
  const fillerCount = useMemo(() => {
    const fillerKeys = new Set<string>();
    wordTimestamps.forEach(w => {
      if (w.isFiller && w.fillerKey) {
        fillerKeys.add(w.fillerKey);
      }
    });
    return fillerKeys.size;
  }, [wordTimestamps]);
  
  // Create a map of word index to markers for quick lookup
  const markerMap = useMemo(() => {
    const map = new Map<number, DisfluencyMarker[]>();
    analysis.markers.forEach(marker => {
      const existing = map.get(marker.wordIndex) || [];
      existing.push(marker);
      map.set(marker.wordIndex, existing);
    });
    return map;
  }, [analysis.markers]);
  
  // Get styling for a word based on its markers and filler status
  const getWordStyling = (index: number): { className: string; hasBlock: boolean } => {
    const word = wordTimestamps[index];
    const markers = markerMap.get(index) || [];
    
    const classes: string[] = [];
    let hasBlock = false;

    // Filler highlighting (blue/teal)
    if (word?.isFiller) {
      classes.push('bg-blue-100 text-blue-800 rounded px-1');
    }
    
    for (const marker of markers) {
      switch (marker.type) {
        case 'repetition':
          classes.push('underline decoration-yellow-400 decoration-2 underline-offset-2 bg-yellow-50');
          break;
        case 'syllabic_repetition':
          classes.push('underline decoration-dashed decoration-amber-500 decoration-2 underline-offset-2 bg-amber-50');
          break;
        case 'prolongation':
          classes.push('bg-purple-100 text-purple-900 rounded px-1');
          break;
        case 'block':
          hasBlock = true;
          break;
      }
    }
    
    return { className: classes.join(' '), hasBlock };
  };

  // Build tooltip for a word
  const getWordTitle = (index: number): string | undefined => {
    const parts: string[] = [];
    const word = wordTimestamps[index];
    
    if (word?.isFiller) {
      parts.push('🔵 Mot d\'appui');
    }
    
    const markers = markerMap.get(index);
    if (markers) {
      markers.forEach(m => {
        let label = `${getDisfluencyEmoji(m.type)} ${getDisfluencyLabel(m.type)}`;
        if (m.type === 'repetition' && m.count && m.count > 1) {
          label += ` x${m.count}`;
        }
        parts.push(label);
      });
    }
    
    return parts.length > 0 ? parts.join(', ') : undefined;
  };
  
  if (!wordTimestamps || wordTimestamps.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Données de transcription non disponibles pour cette session.</p>
          <p className="text-sm mt-2">Les nouvelles sessions incluront ces données automatiquement.</p>
        </CardContent>
      </Card>
    );
  }

  const hasObservations = analysis.summary.total > 0 || fillerCount > 0;
  
  return (
    <>
      <Card className={cn("border-purple-200 bg-purple-50/30", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                🔬 Analyse de fluence
                <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  En test
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Repère automatiquement les répétitions, allongements, blocages et mots d'appui
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInfoModal(true)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
            >
              <Info className="w-4 h-4 mr-1" />
              Comment ça marche
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Fluency Score */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-background border">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tabular-nums" style={{ minWidth: '3ch' }}>
                <span className={fluencyScore.severityColor}>{fluencyScore.disfluencyPercentage}%</span>
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  {isTherapist ? 'de disfluences' : "d'hésitations"}
                </span>
                <span className={`text-sm font-semibold ${fluencyScore.severityColor}`}>
                  {fluencyScore.severityLabel}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-xs text-muted-foreground">
              {fluencyScore.disfluencyPercentage < 3 
                ? isTherapist ? "< 3% = parole fluente" : "Très fluide !" 
                : fluencyScore.disfluencyPercentage < 10 
                ? isTherapist ? "3-10% = disfluence légère" : "Quelques hésitations, c'est normal" 
                : fluencyScore.disfluencyPercentage < 20 
                ? isTherapist ? "10-20% = disfluence modérée" : "Des hésitations à travailler"
                : isTherapist ? "> 20% = disfluence sévère" : "Beaucoup d'hésitations — continuez à vous entraîner"}
            </div>
          </div>

          {/* Summary */}
          {hasObservations ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-background border">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Observations :</span>
                </div>
                {analysis.summary.blocks > 0 && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    🟠 {analysis.summary.blocks} Pause{analysis.summary.blocks > 1 ? 's' : ''} longue{analysis.summary.blocks > 1 ? 's' : ''}
                  </Badge>
                )}
                {analysis.summary.repetitions > 0 && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    🟡 {analysis.summary.repetitions} Répétition{analysis.summary.repetitions > 1 ? 's' : ''}
                  </Badge>
                )}
                {analysis.summary.prolongations > 0 && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    🟣 {analysis.summary.prolongations} Allongement{analysis.summary.prolongations > 1 ? 's' : ''}
                  </Badge>
                )}
                {fillerCount > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    🔵 {fillerCount} Mot{fillerCount > 1 ? 's' : ''} d'appui
                  </Badge>
                )}
                {(() => {
                  const syllabicCount = analysis.markers.filter(m => m.type === 'syllabic_repetition').length;
                  return syllabicCount > 0 ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      🟤 {syllabicCount} Rép. syllabique{syllabicCount > 1 ? 's' : ''}
                    </Badge>
                  ) : null;
                })()}
              </div>
              {analysis.summary.blocks > 0 && (
                <p className="text-xs text-muted-foreground px-1">
                  💡 Les pauses longues ne sont pas forcément des blocages. Elles peuvent correspondre à un moment de réflexion ou de recherche de mots.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              ✅ Aucun indice de disfluence détecté dans cette session
            </div>
          )}

          {/* Regularity Score + Phoneme Profile — therapist only */}
          {isTherapist && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {regularityScore && (
                <div className={`p-3 rounded-lg border ${regularityScore.bgClass}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{regularityScore.emoji}</span>
                    <span className={`text-sm font-semibold ${regularityScore.colorClass}`}>
                      Rythme {regularityScore.label.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {regularityScore.level === 'regular' 
                      ? 'Le débit est stable et fluide' 
                      : regularityScore.level === 'variable'
                      ? 'Le rythme varie — alternance de moments rapides et lents'
                      : 'Rythme en montagnes russes — accélérations et pauses fréquentes'}
                  </p>
                </div>
              )}
              
              {phonemeProfile.topPhonemes.length > 0 && (
                <div className="p-3 rounded-lg border bg-background">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>🔤</span>
                    <span className="text-sm font-semibold text-foreground">Sons difficiles</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {phonemeProfile.topPhonemes.map((p) => (
                      <span 
                        key={p.phoneme}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-mono"
                        title={`${p.count} disfluence${p.count > 1 ? 's' : ''} sur "${p.phoneme}" — ex: ${p.examples.join(', ')}`}
                      >
                        <span className="font-bold uppercase">{p.phoneme}</span>
                        <span className="text-muted-foreground">×{p.count}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Sons sur lesquels les disfluences apparaissent le plus
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2 mb-2">
            <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
            <p>
              <strong>Transcription automatique</strong> — générée par reconnaissance vocale.
              {editable && " Cliquez sur un mot pour le corriger."}
            </p>
          </div>

          {/* Transcript with highlighting */}
          <div className="p-4 rounded-lg bg-background border leading-relaxed text-base">
            {wordTimestamps.map((word, index) => {
              const { className: wordClassName, hasBlock } = getWordStyling(index);
              
              if (editable && editingIndex === index) {
                return (
                  <span key={index} className="inline-flex items-center mx-0.5">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        if (editValue.trim() !== word.word && onWordEdit) {
                          onWordEdit(index, editValue.trim());
                        }
                        setEditingIndex(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editValue.trim() !== word.word && onWordEdit) {
                            onWordEdit(index, editValue.trim());
                          }
                          setEditingIndex(null);
                        }
                        if (e.key === 'Escape') setEditingIndex(null);
                      }}
                      className="h-6 w-auto min-w-[3ch] max-w-[12ch] text-base px-1 py-0 inline"
                      style={{ width: `${Math.max(3, editValue.length + 1)}ch` }}
                      autoFocus
                    />
                    {' '}
                  </span>
                );
              }
              
              return (
                <span key={index}>
                  {hasBlock && (
                    <span className="inline-flex items-center mx-1 text-orange-500" title="Pause longue détectée (silence > 2s)">
                      <span className="inline-block w-0.5 h-5 bg-orange-400 rounded-full mx-1" />
                      <span className="text-xs text-orange-500 font-mono">[⏸]</span>
                    </span>
                  )}
                  <span 
                    className={cn(
                      "transition-colors",
                      wordClassName,
                      editable && "cursor-pointer hover:ring-1 hover:ring-primary/40 hover:rounded"
                    )}
                    title={getWordTitle(index)}
                    onClick={editable ? () => {
                      setEditingIndex(index);
                      setEditValue(word.word);
                    } : undefined}
                  >
                    {word.word}
                  </span>
                  {' '}
                </span>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-0.5 h-4 bg-orange-400 rounded-full" />
              <span className="text-xs font-mono text-orange-500 mr-1">[⏸]</span>
              <span>Pause longue (silence &gt;2s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="underline decoration-yellow-400 decoration-2 underline-offset-2 bg-yellow-50 px-1">exemple</span>
              <span>Répétition</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="underline decoration-dashed decoration-amber-500 decoration-2 underline-offset-2 bg-amber-50 px-1">exemple</span>
              <span>Rép. syllabique</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-purple-100 text-purple-900 rounded px-1">exemple</span>
              <span>Allongement (&gt;0.8s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-100 text-blue-800 rounded px-1">exemple</span>
              <span>Mot d'appui</span>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-50/50 border border-amber-100 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Outil de repérage acoustique (en test).</strong>{' '}
              Détecte les silences anormaux et les répétitions dans le signal audio, pas la tension musculaire. 
              Ne remplace pas l'observation clinique directe.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <DisfluencyInfoModal 
        open={showInfoModal} 
        onOpenChange={setShowInfoModal} 
      />
    </>
  );
};

export default TranscriptHeatmap;
