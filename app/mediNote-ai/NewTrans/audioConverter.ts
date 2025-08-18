// utils/audioConverter.ts
export class AudioConverter {
  /**
   * Convert audio blob to WAV format
   * @param audioBlob - The source audio blob (WebM, MP3, etc.)
   * @param sampleRate - Target sample rate (default: 16000)
   * @returns Promise<Blob> - WAV format blob
   */
  static async convertToWav(audioBlob: Blob, sampleRate: number = 16000): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Resample to target sample rate if needed
          const targetSampleRate = sampleRate;
          const resampledBuffer = await this.resampleAudioBuffer(audioBuffer, targetSampleRate);
          
          // Convert to WAV
          const wavBlob = this.audioBufferToWav(resampledBuffer);
          resolve(wavBlob);
        } catch (error) {
          reject(new Error(`Audio conversion failed: ${error}`));
        }
      };

      fileReader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };

      fileReader.readAsArrayBuffer(audioBlob);
    });
  }

  /**
   * Resample audio buffer to target sample rate
   */
  private static async resampleAudioBuffer(
    audioBuffer: AudioBuffer, 
    targetSampleRate: number
  ): Promise<AudioBuffer> {
    if (audioBuffer.sampleRate === targetSampleRate) {
      return audioBuffer;
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    return await offlineContext.startRendering();
  }

  /**
   * Convert AudioBuffer to WAV Blob
   */
  private static audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * blockAlign;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');

    // Format chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, format, true); // format
    view.setUint16(22, numChannels, true); // channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, byteRate, true); // byte rate
    view.setUint16(32, blockAlign, true); // block align
    view.setUint16(34, bitDepth, true); // bits per sample

    // Data chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    let offset = 44;
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        // Convert float to 16-bit PCM
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  /**
   * Get audio file duration from blob
   */
  static async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio for duration check'));
      };
      
      audio.src = url;
    });
  }
}