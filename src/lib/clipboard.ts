/**
 * Robust clipboard utility with fallback for older browsers and non-secure contexts.
 * Uses modern Clipboard API when available, falls back to execCommand('copy').
 */

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Modern Clipboard API (requires secure context in some browsers)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!successful) {
      throw new Error('execCommand copy failed');
    }

    return true;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return false;
  }
};
