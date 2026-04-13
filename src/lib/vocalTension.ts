/**
 * Vocal Tension Detection
 * Detects sudden volume spikes after silence — a typical sign of 
 * tonic blocks where speech "explodes" after muscular effort.
 * 
 * A tension spike = volume jumps from < 20% to > 70% in < 200ms
 */

export interface TensionSpike {
  /** Timestamp in seconds */
  timestamp: number;
  /** Volume before the spike (0-1) */
  volumeBefore: number;
  /** Volume at the spike (0-1) */
  volumeAfter: number;
}

export interface VocalTensionResult {
  /** Detected tension spikes */
  spikes: TensionSpike[];
  /** Number of spikes that correlate with detected blocks */
  correlatedWithBlocks: number;
}

interface VolumeDataPoint {
  timestamp: number; // seconds
  volume: number;    // 0-1
}

const TENSION_THRESHOLD_LOW = 0.20;
const TENSION_THRESHOLD_HIGH = 0.70;
const MAX_SPIKE_WINDOW_MS = 200;

/**
 * Detect tension spikes from volume data
 */
export function detectTensionSpikes(volumeData: VolumeDataPoint[]): TensionSpike[] {
  if (!volumeData || volumeData.length < 3) return [];

  const spikes: TensionSpike[] = [];

  for (let i = 1; i < volumeData.length; i++) {
    const prev = volumeData[i - 1];
    const curr = volumeData[i];
    const timeDiffMs = (curr.timestamp - prev.timestamp) * 1000;

    if (
      prev.volume < TENSION_THRESHOLD_LOW &&
      curr.volume > TENSION_THRESHOLD_HIGH &&
      timeDiffMs > 0 && timeDiffMs <= MAX_SPIKE_WINDOW_MS
    ) {
      spikes.push({
        timestamp: curr.timestamp,
        volumeBefore: prev.volume,
        volumeAfter: curr.volume,
      });
    }
  }

  return spikes;
}

/**
 * Correlate tension spikes with block disfluencies
 * A spike is "correlated" if it occurs within ±0.5s of a block
 */
export function correlateTensionWithBlocks(
  spikes: TensionSpike[],
  blockTimestamps: number[], // start times of block disfluencies
  toleranceSec: number = 0.5
): VocalTensionResult {
  let correlatedWithBlocks = 0;

  for (const spike of spikes) {
    const isNearBlock = blockTimestamps.some(
      bt => Math.abs(bt - spike.timestamp) <= toleranceSec
    );
    if (isNearBlock) correlatedWithBlocks++;
  }

  return { spikes, correlatedWithBlocks };
}
