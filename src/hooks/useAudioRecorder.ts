import { useState, useCallback, useRef } from 'react';
import { createCompatibleRecorder, createAudioBlob } from '@/lib/audioCompat';
import { getSpeechMediaConstraints } from '@/lib/audioConstraints';

interface AudioRecorderResult {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  analyserNode: AnalyserNode | null;
  duration: number;
}

export const useAudioRecorder = (): AudioRecorderResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getSpeechMediaConstraints());
      
      // Create audio context for visualization
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);
      
      // Create media recorder
      mediaRecorderRef.current = createCompatibleRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = createAudioBlob(chunksRef.current);
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Close audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          setAnalyserNode(null);
        }
      };
      
      // Safari MP4 doesn't support timeslice — chunks can't be concatenated into valid MP4
      const isMp4 = mediaRecorderRef.current.mimeType?.includes("mp4") || mediaRecorderRef.current.mimeType?.includes("aac");
      mediaRecorderRef.current.start(isMp4 ? undefined : 100);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      
      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  }, [isRecording]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    analyserNode,
    duration,
  };
};
