/**
 * AudioWorklet processor for capturing raw audio data.
 * Used by Deepgram hooks to replace the deprecated createScriptProcessor API.
 * Provides better Safari/iOS compatibility and lower latency.
 */
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]?.[0];
    if (input && input.length > 0) {
      // Copy the Float32Array data and send to main thread
      this.port.postMessage(new Float32Array(input));
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
