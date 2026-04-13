/**
 * Audio recording compatibility layer.
 * Safari/iOS doesn't support webm — we detect the best format
 * and use it consistently for recording + upload.
 */

/** Returns the best supported MIME type for MediaRecorder */
export function getRecordingMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  // Prefer webm (Chrome, Firefox, Android)
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  // Safari / iOS fallback
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/aac")) return "audio/aac";
  // Let browser choose
  return "";
}

/** Returns the file extension matching the MIME type */
export function getRecordingExtension(mimeType: string): string {
  if (mimeType.includes("mp4") || mimeType.includes("aac") || mimeType.includes("m4a")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

/** Create a MediaRecorder with the best supported format */
export function createCompatibleRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getRecordingMimeType();
  if (mimeType) {
    return new MediaRecorder(stream, { mimeType });
  }
  return new MediaRecorder(stream);
}

/** Create a Blob from audio chunks with the correct MIME type */
export function createAudioBlob(chunks: Blob[]): Blob {
  const mimeType = getRecordingMimeType() || "audio/webm";
  return new Blob(chunks, { type: mimeType });
}

/** Generate a filename with the correct extension */
export function getRecordingFileName(userId: string, prefix = ""): string {
  const mimeType = getRecordingMimeType();
  const ext = getRecordingExtension(mimeType);
  const ts = Date.now();
  return `${userId}/${prefix}${ts}.${ext}`;
}
