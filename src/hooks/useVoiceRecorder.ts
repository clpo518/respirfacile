import { useState, useRef, useCallback, useEffect } from 'react'

export type RecorderState = 'idle' | 'recording' | 'recorded'

export interface UseVoiceRecorderReturn {
  state: RecorderState
  audioUrl: string | null
  audioBlob: Blob | null
  durationSeconds: number
  start: () => Promise<void>
  stop: () => void
  reset: () => void
  error: string | null
}

const MAX_DURATION_S = 60

// Detect best supported mime type
function getSupportedMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state,           setState]           = useState<RecorderState>('idle')
  const [audioUrl,        setAudioUrl]        = useState<string | null>(null)
  const [audioBlob,       setAudioBlob]       = useState<Blob | null>(null)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [error,           setError]           = useState<string | null>(null)

  const recorderRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const streamRef    = useRef<MediaStream | null>(null)
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef   = useRef(0)
  const prevUrlRef   = useRef<string | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  const stop = useCallback(() => {
    stopTimer()
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    releaseStream()
  }, [stopTimer, releaseStream])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
      chunksRef.current = []
      elapsedRef.current = 0
      setDurationSeconds(0)

      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : {}
      const mr = new MediaRecorder(stream, options)
      recorderRef.current = mr

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      mr.onstop = () => {
        const usedMime = mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: usedMime })
        // Revoke previous object URL if any
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
        const url = URL.createObjectURL(blob)
        prevUrlRef.current = url
        setAudioBlob(blob)
        setAudioUrl(url)
        setState('recorded')
      }

      mr.start(250)
      setState('recording')

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1
        setDurationSeconds(elapsedRef.current)
        if (elapsedRef.current >= MAX_DURATION_S) stop()
      }, 1000)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone non accessible'
      setError(msg)
    }
  }, [stop])

  const reset = useCallback(() => {
    stop()
    if (prevUrlRef.current) { URL.revokeObjectURL(prevUrlRef.current); prevUrlRef.current = null }
    setAudioUrl(null)
    setAudioBlob(null)
    setDurationSeconds(0)
    setError(null)
    setState('idle')
  }, [stop])

  // Cleanup on unmount
  useEffect(() => () => {
    stopTimer()
    releaseStream()
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
  }, [stopTimer, releaseStream])

  return { state, audioUrl, audioBlob, durationSeconds, start, stop, reset, error }
}
