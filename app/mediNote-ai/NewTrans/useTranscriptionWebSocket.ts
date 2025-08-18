// hooks/useTranscriptionWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface TranscriptionMessage {
  type: 'Doctor' | 'Patient' | 'error';
  text?: string;
  speaker?: string;
  ts?: number;
  session_id?: number;
  raw?: string;
}

interface UseTranscriptionWebSocketProps {
  sessionId: number;
  baseUrl?: string;
  autoConnect?: boolean;
}

export const useTranscriptionWebSocket = ({
  sessionId,
  baseUrl = `wss://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net`,
  autoConnect = true
}: UseTranscriptionWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Add refs for collecting audio data
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

  // Convert HTTP URL to WebSocket URL
  const getWebSocketUrl = useCallback((url: string) => {
    return url.replace(/^https?/, 'ws');
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `${getWebSocketUrl(baseUrl)}/ws/transcribe/${sessionId}/1/1`;
      console.log('Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        const rawData = event.data.toString().trim();
        
        // Check if it's JSON
        if (rawData.startsWith('{') || rawData.startsWith('[')) {
          try {
            const message: TranscriptionMessage = JSON.parse(rawData);
            console.log('📨 JSON message:', message);
            
            setTranscription(prev => [...prev, message]);
            
            return;
          } catch (err) {
            console.warn('⚠️ Failed to parse JSON:', rawData);
          }
        }
        
        // Handle plain text messages
        console.log('📝 Plain text message:', rawData);
        
        if (!rawData || rawData.length === 0) {
          return; // Ignore empty messages
        }
        
        // Categorize the message type
        let messageType: TranscriptionMessage['type'] = 'Doctor';
        
        if (rawData.includes('buffering') || 
            rawData.includes('processing') || 
            rawData.includes('connecting') ||
            rawData.includes('initializing') ||
            rawData.includes('loading') ||
            rawData.startsWith('...')) {
          messageType = 'Patient';
        } else if (rawData.includes('error') || rawData.includes('failed')) {
          messageType = 'error';
          setError(rawData);
        }
        
        // Create structured message from plain text
        const textMessage: TranscriptionMessage = {
          type: messageType,
          text: rawData,
          ts: Date.now(),
          raw: rawData // Store original for debugging
        };
        
        // For status messages, replace the previous status instead of accumulating
        if (messageType === 'Patient') {
          setTranscription(prev => {
            const withoutPreviousStatus = prev.filter(msg => msg.type !== 'Patient');
            return [...withoutPreviousStatus, textMessage];
          });
        } else {
          setTranscription(prev => [...prev, textMessage]);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Auto-reconnect logic (optional)
        if (event.code !== 1000) { // Not a normal closure
          setTimeout(() => {
            if (autoConnect) {
              console.log('Attempting to reconnect...');
              connect();
            }
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [sessionId, baseUrl, autoConnect, getWebSocketUrl]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send audio data
  const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    } else {
      console.warn('WebSocket not connected, cannot send audio data');
    }
  }, []);

  // Send control messages
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      streamRef.current = stream;
      
      // Clear previous audio chunks and reset blob
      audioChunksRef.current = [];
      setRecordedAudioBlob(null);
      recordingStartTimeRef.current = Date.now();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=pcm'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Store chunk for complete audio file
          audioChunksRef.current.push(event.data);
          
          // Still send to WebSocket for real-time transcription
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => {
              sendAudioChunk(buffer);
            });
          }
        }
      };

      // Handle recording completion
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, creating audio blob');
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm' 
          });
          
          setRecordedAudioBlob(audioBlob);
          
          const duration = Date.now() - recordingStartTimeRef.current;
          console.log(`Recording completed: ${audioBlob.size} bytes, ${duration}ms duration`);
        }
      };

      mediaRecorder.start(100); // Send data every 100ms
      setIsRecording(true);
      console.log('Recording started');

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone');
    }
  }, [sendAudioChunk]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    console.log('Recording stopped');
  }, []);

  // Download recorded audio
  const downloadAudioFile = useCallback((filename?: string) => {
    if (!recordedAudioBlob) {
      console.warn('No recorded audio available for download');
      return;
    }

    const url = URL.createObjectURL(recordedAudioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `recording-session-${sessionId}-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [recordedAudioBlob, sessionId]);

  // Get audio file as File object
  const getAudioFile = useCallback((filename?: string): File | null => {
    if (!recordedAudioBlob) {
      return null;
    }

    return new File(
      [recordedAudioBlob], 
      filename || `recording-session-${sessionId}-${Date.now()}.webm`, 
      { type: 'audio/webm' }
    );
  }, [recordedAudioBlob, sessionId]);

  // Get audio file as WAV format
  const getWavAudioFile = useCallback(async (filename?: string): Promise<File | null> => {
    if (!recordedAudioBlob) {
      return null;
    }

    try {
      // Import AudioConverter dynamically to avoid issues if not available
      const { AudioConverter } = await import('./audioConverter');
      const wavBlob = await AudioConverter.convertToWav(recordedAudioBlob, 16000);
      
      return new File(
        [wavBlob], 
        filename || `recording-session-${sessionId}-${Date.now()}.wav`, 
        { type: 'audio/wav' }
      );
    } catch (error) {
      console.error('Failed to convert audio to WAV:', error);
      return null;
    }
  }, [recordedAudioBlob, sessionId]);

  // Clear transcription and audio
  const clearTranscription = useCallback(() => {
    setTranscription([]);
    setRecordedAudioBlob(null);
    audioChunksRef.current = [];
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && sessionId) {
      connect();
    }

    return () => {
      stopRecording();
      disconnect();
    };
  }, [sessionId, autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Connection state
    isConnected,
    isRecording,
    transcription,
    error,
    
    // Audio state
    recordedAudioBlob,
    hasRecordedAudio: !!recordedAudioBlob,
    
    // Connection methods
    connect,
    disconnect,
    
    // Recording methods
    startRecording,
    stopRecording,
    
    // Audio file methods
    downloadAudioFile,
    getAudioFile,
    getWavAudioFile,
    
    // Communication methods
    sendAudioChunk,
    sendMessage,
    
    // Utility methods
    clearTranscription,
  };
};