// hooks/useTranscriptionWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface TranscriptionMessage {
  type: 'turn-final' | 'turn-update' | 'status' | 'error';
  speaker?: string;
  text?: string;
  t0?: number;
  t1?: number;
  turn_id?: number;
  state?: string;
  msg?: string;
}

interface UseTranscriptionWebSocketProps {
  sessionId: number;
  doctorId: number;
  patientId: number;
  baseUrl?: string;
  autoConnect?: boolean;
}

export const useTranscriptionWebSocket = ({
  sessionId,
  doctorId,
  patientId,
  baseUrl = `https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net`,
  autoConnect = true
}: UseTranscriptionWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Disconnected');
  const [keepAliveInterval, setKeepAliveInterval] = useState<NodeJS.Timeout | null>(null);

  const getWebSocketUrl = useCallback((url: string) => {
    return url.replace(/^https/, 'wss');
  }, []);

  const workletCode = `
  class PCM16Capture extends AudioWorkletProcessor {
    constructor() {
      super();
      this.inRate = sampleRate;
      this.frameIn = Math.round(this.inRate / 50);
      this.buf = new Float32Array(0);
    }
    
    static get parameterDescriptors() { return []; }
    
    process(inputs) {
      const input = inputs[0];
      if (!input || input.length === 0) return true;
      const ch = input[0];
      if (!ch) return true;
      
      const merged = new Float32Array(this.buf.length + ch.length);
      merged.set(this.buf, 0);
      merged.set(ch, this.buf.length);
      this.buf = merged;
      
      while (this.buf.length >= this.frameIn) {
        const inBlock = this.buf.subarray(0, this.frameIn);
        this.buf = this.buf.subarray(this.frameIn);
        const outLen = 320;
        const factor = this.frameIn / outLen;
        const out = new Int16Array(outLen);
        
        for (let i = 0; i < outLen; i++) {
          const start = Math.floor(i * factor);
          const end = Math.min(this.frameIn, Math.floor((i + 1) * factor));
          let sum = 0;
          
          for (let j = start; j < end; j++) {
            sum += inBlock[j];
          }
          
          const avg = sum / Math.max(1, end - start);
          const clamped = Math.max(-1, Math.min(1, avg));
          out[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
        }
        
        this.port.postMessage(out.buffer, [out.buffer]);
      }
      
      return true;
    }
  }
  
  registerProcessor('pcm16-capture', PCM16Capture);
  `;

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `wss://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/ws/transcribe/${sessionId}/${doctorId}/${patientId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.binaryType = 'arraybuffer';

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setStatus('Connected');
        setError(null);
        if (keepAliveInterval === null) {
          const interval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              sendControlMessage('heartbeat', { timestamp: Date.now() });
            }
          }, 30000);
          setKeepAliveInterval(interval);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          if (typeof event.data === 'string') {
            const message: TranscriptionMessage = JSON.parse(event.data);
            console.log('Received message:', message);
            
            switch (message.type) {
              case 'turn-final':
                setTranscription(prev => [...prev, message]);
                break;
              case 'status':
                setStatus(message.msg || message.state || 'Unknown status');
                break;
              case 'error':
                setError(message.msg || 'Unknown error');
                break;
              default:
                console.log('Unknown message type:', message.type);
            }
          }
        } catch (err) {
          console.warn('Failed to parse message:', event.data, err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setStatus('Disconnected');
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          setKeepAliveInterval(null);
        }
        if (event.code !== 1000 && event.code !== 1001) {
          setError(`Connection closed: ${event.reason || 'Unknown reason'}`);
        }
      };

      wsRef.current.onerror = (error) => {
        setError('WebSocket connection error');
        setStatus('Error');
      };

    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [sessionId, doctorId, patientId, baseUrl, getWebSocketUrl, keepAliveInterval]);

  const disconnect = useCallback(() => {
    stopRecording();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsRecording(false);
    setStatus('Disconnected');
  }, []);

  const initAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 48000
      });

      await audioContextRef.current.resume();

      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await audioContextRef.current.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm16-capture');

      source.connect(workletNodeRef.current);
      
      const silentGain = audioContextRef.current.createGain();
      silentGain.gain.value = 0;
      workletNodeRef.current.connect(silentGain);
      silentGain.connect(audioContextRef.current.destination);

      workletNodeRef.current.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      return true;
    } catch (err) {
      setError('Failed to initialize audio processing');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      console.log('Already recording');
      return;
    }

    if (!isConnected) {
      await connect();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const audioInitialized = await initAudio();
    if (!audioInitialized) {
      setError('Audio setup failed (check microphone permissions). Reconnecting...');
      disconnect();
      return;
    }
    setIsRecording(true);
    setStatus('Recording');
    console.log('Recording started');
  }, [isRecording, isConnected, connect, initAudio, disconnect]);

  const stopRecording = useCallback(() => {
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setStatus('Connected (not recording)');
    console.log('Recording stopped');
  }, []);

  const sendControlMessage = useCallback((type: string, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscription([]);
  }, []);

  const safeDisconnect = useCallback(() => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      setKeepAliveInterval(null);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Session ended successfully');
      wsRef.current = null;
    }
    setIsConnected(false);
    setStatus('Disconnected');
  }, [keepAliveInterval]);

  useEffect(() => {
    if (autoConnect && sessionId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [sessionId, autoConnect, connect, disconnect]);

  
    useEffect(() => {
  if (!isConnected && isRecording) {
    setIsRecording(false);
  }
}, [isConnected])

  return {
    isConnected,
    isRecording,
    transcription,
    error,
    status,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendControlMessage,
    clearTranscription,
    hasTranscription: transcription.length > 0,
    safeDisconnect
  };
};