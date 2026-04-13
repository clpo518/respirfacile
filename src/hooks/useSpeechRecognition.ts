import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  wordCount: number;
  wpm: number;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  wpmHistory: number[];
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [index: number]: {
      transcript: string;
    };
    isFinal: boolean;
  };
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: { error: string }) => void;
    start: () => void;
    stop: () => void;
  }
}

export const useSpeechRecognition = (): SpeechRecognitionResult => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const wordCountHistoryRef = useRef<{ time: number; count: number }[]>([]);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const calculateWPM = useCallback(() => {
    const now = Date.now();
    const windowSize = 10000; // 10 seconds sliding window
    
    // Filter history to only include entries within the window
    wordCountHistoryRef.current = wordCountHistoryRef.current.filter(
      entry => now - entry.time < windowSize
    );
    
    if (wordCountHistoryRef.current.length < 2) {
      return 0;
    }
    
    const oldest = wordCountHistoryRef.current[0];
    const newest = wordCountHistoryRef.current[wordCountHistoryRef.current.length - 1];
    const wordsInWindow = newest.count - oldest.count;
    const timeInWindow = (newest.time - oldest.time) / 1000 / 60; // Convert to minutes
    
    if (timeInWindow === 0) return 0;
    
    return Math.round(wordsInWindow / timeInWindow);
  }, []);

  const updateWordCount = useCallback((text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    setWordCount(count);
    
    wordCountHistoryRef.current.push({
      time: Date.now(),
      count,
    });
    
    const currentWpm = calculateWPM();
    setWpm(currentWpm);
    
    if (currentWpm > 0) {
      setWpmHistory(prev => [...prev, currentWpm].slice(-60)); // Keep last 60 readings
    }
  }, [calculateWPM]);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'fr-FR';
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      const fullTranscript = finalTranscript + interimTranscript;
      setTranscript(fullTranscript);
      updateWordCount(fullTranscript);
    };
    
    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current?.start();
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };
    
    recognitionRef.current.start();
    startTimeRef.current = Date.now();
    wordCountHistoryRef.current = [{ time: Date.now(), count: 0 }];
    setIsListening(true);
    
    // Update WPM every second
    wpmIntervalRef.current = setInterval(() => {
      const currentWpm = calculateWPM();
      setWpm(currentWpm);
      if (currentWpm > 0) {
        setWpmHistory(prev => [...prev, currentWpm].slice(-60));
      }
    }, 1000);
  }, [isSupported, isListening, updateWordCount, calculateWPM]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setWordCount(0);
    setWpm(0);
    setWpmHistory([]);
    wordCountHistoryRef.current = [];
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    wordCount,
    wpm,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    wpmHistory,
  };
};
