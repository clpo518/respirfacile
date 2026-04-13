/**
 * Shared audio constraints for getUserMedia.
 * Optimized for speech analysis across all voice types (including deep male voices).
 * 
 * - autoGainControl: boosts quieter voices (common with male speakers)
 * - noiseSuppression: disabled to preserve low-frequency harmonics (< 200 Hz)
 *   that aggressive noise suppression can filter out
 * - echoCancellation: kept on to avoid feedback loops during playback exercises
 */
export const SPEECH_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  autoGainControl: true,
  noiseSuppression: false,
  echoCancellation: true,
};

/** Get getUserMedia constraints for speech capture */
export function getSpeechMediaConstraints(): MediaStreamConstraints {
  return { audio: SPEECH_AUDIO_CONSTRAINTS };
}
