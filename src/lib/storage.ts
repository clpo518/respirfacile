import { supabase } from "@/integrations/supabase/client";

/**
 * Get a signed URL for a recording file.
 * Signed URLs expire after 1 hour for security.
 * 
 * @param filePath - The path to the file in the recordings bucket (e.g., "user-id/timestamp.webm")
 * @returns The signed URL or null if an error occurred
 */
export async function getSignedRecordingUrl(filePath: string): Promise<string | null> {
  if (!filePath) return null;
  
  // If it's already a full URL (legacy), extract just the path
  // Legacy URLs look like: https://...supabase.../storage/v1/object/public/recordings/user-id/file.webm
  const pathMatch = filePath.match(/recordings\/(.+)$/);
  const cleanPath = pathMatch ? pathMatch[1] : filePath;
  
  const { data, error } = await supabase.storage
    .from("recordings")
    .createSignedUrl(cleanPath, 3600); // 1 hour expiration
  
  if (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }
  
  return data.signedUrl;
}

/**
 * Upload a recording and return the file path (not URL).
 * The path can be used later to generate signed URLs.
 * 
 * @param userId - The user's ID (used as folder)
 * @param audioBlob - The audio blob to upload
 * @returns The file path or null if an error occurred
 */
export async function uploadRecording(userId: string, audioBlob: Blob): Promise<string | null> {
  // Detect extension from blob type for Safari compatibility (mp4/m4a vs webm)
  const ext = audioBlob.type.includes("mp4") || audioBlob.type.includes("aac") || audioBlob.type.includes("m4a") ? "m4a" : "webm";
  const fileName = `${userId}/${Date.now()}.${ext}`;
  
  const { error } = await supabase.storage
    .from("recordings")
    .upload(fileName, audioBlob);
  
  if (error) {
    console.error("Error uploading recording:", error);
    return null;
  }
  
  // Return the path, not the URL - we'll generate signed URLs on demand
  return fileName;
}
