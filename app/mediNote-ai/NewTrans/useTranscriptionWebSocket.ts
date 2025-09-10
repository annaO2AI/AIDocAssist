// hooks/useTranscriptionWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

type MsgType = 'ready' | 'keepalive' | 'turn-final' | 'turn-update' | 'status' | 'error' | string;

interface TranscriptionMessage {
  type: MsgType;
  speaker?: string;        // role (Doctor|Patient|Unknown)
  speaker_name?: string;   // pretty name from server (Dr. X / Patient Name)
  text?: string;
  t0?: number;
  t1?: number;
  turn_id?: number;
  state?: string;
  msg?: string;
}

// Normalized line your UI can render directly
export interface TranscriptLine {
  id: string;
  kind: 'final' | 'update';
  text: string;
  speaker: string;       // role fallback
  speakerName: string;   // display name (prefer this)
  t0?: number;
  t1?: number;
  turnId?: number;
}

interface UseTranscriptionWebSocketProps {
  sessionId: number;
  doctorId: number;
  patientId: number;
  baseUrl?: string;      // e.g. https://doctorassistant...azurewebsites.net
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
  const [transcription, setTranscription] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Disconnected');
  const [keepAliveInterval, setKeepAliveInterval] = useState<NodeJS.Timeout | null>(null);

  const toWss = useCallback((url: string) => url.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:'), []);

  const workletCode = `
    class PCM16Capture extends AudioWorkletProcessor {
      constructor(){ super(); this.inRate = sampleRate; this.frameIn = Math.round(this.inRate/50); this.buf = new Float32Array(0); }
      static get parameterDescriptors(){ return []; }
      process(inputs){
        const input = inputs[0]; if(!input||input.length===0) return true;
        const ch = input[0]; if(!ch) return true;
        const merged = new Float32Array(this.buf.length + ch.length);
        merged.set(this.buf,0); merged.set(ch,this.buf.length); this.buf = merged;
        while(this.buf.length >= this.frameIn){
          const inBlock = this.buf.subarray(0,this.frameIn); this.buf = this.buf.subarray(this.frameIn);
          const outLen=320, factor=this.frameIn/outLen, out=new Int16Array(outLen);
          for(let i=0;i<outLen;i++){
            const s=Math.floor(i*factor), e=Math.min(this.frameIn, Math.floor((i+1)*factor));
            let sum=0; for(let j=s;j<e;j++) sum += inBlock[j];
            const avg = sum/Math.max(1,e-s), c=Math.max(-1,Math.min(1,avg));
            out[i] = c<0 ? c*0x8000 : c*0x7fff;
          }
          this.port.postMessage(out.buffer,[out.buffer]);
        }
        return true;
      }
    }
    registerProcessor('pcm16-capture', PCM16Capture);
  `;

  const normalizeLine = (m: TranscriptionMessage): TranscriptLine => ({
    id: crypto.randomUUID(),
    kind: m.type === 'turn-final' ? 'final' : 'update',
    text: m.text ?? '',
    speaker: m.speaker ?? 'Speaker',
    speakerName: m.speaker_name ?? m.speaker ?? 'Speaker',
    t0: m.t0,
    t1: m.t1,
    turnId: m.turn_id
  });

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Use the new dual endpoint (source = mic) and your configurable baseUrl
      const wsUrl = toWss(`${baseUrl}/ws/transcribe2/${sessionId}/${doctorId}/${patientId}/mic`);
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.binaryType = 'arraybuffer';

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setStatus('Connected');
        setError(null);
        if (keepAliveInterval === null) {
          const interval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              // harmless heartbeat; server will ack
              wsRef.current.send(JSON.stringify({ type: 'heartbeat', ts: Date.now() }));
            }
          }, 30000);
          setKeepAliveInterval(interval);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          if (typeof event.data !== 'string') return;
          const msg: TranscriptionMessage = JSON.parse(event.data);

          // Ignore server pings and ready banner
          if (msg.type === 'keepalive' || msg.type === 'ready') return;

          if (msg.type === 'turn-update' || msg.type === 'turn-final') {
            setTranscription(prev => [...prev, normalizeLine(msg)]);
          } else if (msg.type === 'status') {
            setStatus(msg.msg || msg.state || 'Unknown status');
          } else if (msg.type === 'error') {
            setError(msg.msg || 'Unknown error');
          } // else silently ignore unknowns
        } catch {
          // ignore parse errors
        }
      };

      wsRef.current.onclose = (event) => {
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

      wsRef.current.onerror = () => {
        setError('WebSocket connection error');
        setStatus('Error');
      };

    } catch (err) {
      setError('Failed to create WebSocket connection');
    }
  }, [sessionId, doctorId, patientId, baseUrl, toWss, keepAliveInterval]);

  const sendJson = useCallback((obj: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(obj));
    }
  }, []);

  const disconnect = useCallback(() => {
    // ask backend to finalize any in-flight turn
    sendJson({ type: 'stop' });

    if (workletNodeRef.current) { workletNodeRef.current.disconnect(); workletNodeRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
    setStatus('Disconnected');
  }, [sendJson]);

  const initAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ latencyHint: 'interactive', sampleRate: 48000 });
      await audioContextRef.current.resume();

      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await audioContextRef.current.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000 }
      });

      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'pcm16-capture');

      source.connect(workletNodeRef.current);

      // mute path
      const g = audioContextRef.current.createGain(); g.gain.value = 0;
      workletNodeRef.current.connect(g); g.connect(audioContextRef.current.destination);

      workletNodeRef.current.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      return true;
    } catch {
      setError('Failed to initialize audio processing');
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    if (!isConnected) {
      await connect();
      await new Promise(r => setTimeout(r, 800));
    }
    const ok = await initAudio();
    if (!ok) {
      setError('Audio setup failed (check microphone permissions).');
      disconnect();
      return;
    }
    setIsRecording(true);
    setStatus('Recording');
  }, [isRecording, isConnected, connect, initAudio, disconnect]);

  const stopRecording = useCallback(() => {
    // tell backend to finalize current turn
    sendJson({ type: 'stop' });

    if (workletNodeRef.current) { workletNodeRef.current.disconnect(); workletNodeRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }

    setIsRecording(false);
    setStatus('Connected (not recording)');
  }, [sendJson]);

  const clearTranscription = useCallback(() => setTranscription([]), []);

  const safeDisconnect = useCallback(() => {
    if (keepAliveInterval) { clearInterval(keepAliveInterval); setKeepAliveInterval(null); }
    disconnect();
  }, [disconnect, keepAliveInterval]);

  useEffect(() => {
    if (autoConnect && sessionId) connect();
    return () => { safeDisconnect(); };
  }, [sessionId, autoConnect, connect, safeDisconnect]);

  useEffect(() => {
    if (!isConnected && isRecording) setIsRecording(false);
  }, [isConnected, isRecording]);

  return {
    isConnected,
    isRecording,
    transcription,          // TranscriptLine[]
    error,
    status,
    connect,
    disconnect: safeDisconnect,
    startRecording,
    stopRecording,
    clearTranscription,
    hasTranscription: transcription.length > 0,
  };
};
