
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { APIService } from '../service/api';
import type { TranscriptMessage, ConversationEntry } from '../types';
import { MicIcon, MicOffIcon, AudioLineIcon, StopRecoding } from "../../chat-ui/components/icons"

interface TranscriptionInterfaceProps {
  isEnabled: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type SpeechRecognition = typeof window.webkitSpeechRecognition;

export default function TranscriptionInterface({ isEnabled }: TranscriptionInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationContainerRef = useRef<HTMLDivElement | null>(null); // New ref for conversation container

  const handleWebSocketMessage = useCallback((message: TranscriptMessage) => {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'transcript_update':
        if (message.speaker && message.text) {
          const entry: ConversationEntry = {
            id: Date.now().toString(),
            speaker: message.speaker,
            text: message.text,
            timestamp: new Date().toLocaleTimeString(),
            isFromBackend: true
          };
          setConversation(prev => [...prev, entry]);
        }
        break;
      
      case 'processing':
        console.log('Backend is processing audio...');
        break;
      
      case 'keepalive':
        console.log('Keepalive received');
        break;
      
      case 'error':
        console.error('Backend error:', message.error);
        break;
    }
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  const { sendAudioChunk, disconnect, reconnect } = useWebSocket({
    sessionId: '12345',
    onMessage: handleWebSocketMessage,
    onConnectionChange: handleConnectionChange
  });

  // Browser Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentText(interimTranscript);

        if (finalTranscript) {
          const entry: ConversationEntry = {
            id: Date.now().toString(),
            speaker: 'doctor',
            text: finalTranscript,
            timestamp: new Date().toLocaleTimeString(),
            isFromBackend: false
          };
          setConversation(prev => [...prev, entry]);
          setCurrentText('');

          resetSilenceTimeout();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      speechRecognitionRef.current = recognition;
    }
    const newSessionId = APIService.generateSessionId();
    setSessionId(newSessionId);
  }, []);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop = conversationContainerRef.current.scrollHeight;
    }
  }, [conversation, currentText]); // Trigger scroll on conversation or currentText change

  const resetSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    silenceTimeoutRef.current = setTimeout(() => {
      console.log('10 seconds of silence detected, stopping recording');
      handleStopRecording();
    }, 10000);
  }, []);

  const startRecording = async () => {
    try {
      const newSessionId = APIService.generateSessionId();
      setSessionId(newSessionId);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isConnected) {
          sendAudioChunk(event.data);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.start();
      }

      setIsRecording(true);
      setRecordingTime(0);
      resetSilenceTimeout();

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    setIsRecording(false);
    setRecordingTime(0);
    setCurrentText('');
  }, [isRecording]);

  const clearConversation = () => {
    setConversation([]);
    setCurrentText('');
  };

  if (!isEnabled) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Please complete voice enrollment for both speakers before starting transcription.</p>
      </div>
    );
  }

  return (
    <div className="Transcription-Interface rounded-lg p-6 w-full flex flex-col justify-end max-w-7xl m-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-green-600 text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-red-600 text-sm">Disconnected</span>
                <button
                  onClick={reconnect}
                  className="p-1 text-gray-500 hover:text-gray-700"
                  title="Reconnect"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conversation History */}
      <div
        ref={conversationContainerRef} // Attach ref to conversation container
        className="space-y-3 mb-6 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 300px)' }} // Adjust height to fit within wrapper
      >
        {conversation.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {/* <p>Conversation will appear here...</p>
            <p className="text-sm">Start recording to begin transcription</p> */}
          </div>
        ) : (
          conversation.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-lg ${
                entry.speaker === 'doctor' 
                  ? 'bg-blue-50 border-l-4 border-blue-400' 
                  : 'bg-green-50 border-l-4 border-green-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  entry.speaker === 'doctor' ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {entry.speaker.charAt(0).toUpperCase() + entry.speaker.slice(1)}
                </span>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{entry.timestamp}</span>
                  {entry.isFromBackend && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      AI Identified
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-800">{entry.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Current Speech (Interim Results) */}
      {currentText && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-600">Currently speaking:</p>
          <p className="text-gray-800 italic">{currentText}</p>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {!isRecording ? (
          <div className="border-o2 w-full rounded-lg flex items-center ">
            <button
              onClick={startRecording}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors"
              disabled={!isConnected}
            >
              <MicIcon className="w-8 h-8" />
            </button>
            {conversation.length === 0 ? (
              <>
                <div className="text-center py-8 text-gray-500">
                  <p>Conversation will appear here...</p>
                  <p className="text-sm">Start recording to begin transcription</p>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="flex w-full justify-between border-o2 rounded-lg border-highlight">
              <div className="flex items-center">
                <button
                  onClick={handleStopRecording}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors"
                >
                  <MicOffIcon className="w-8 h-8" />
                </button>
                <AudioLineIcon className="w-[743px] h-[24px]" />
              </div>
              <button
                onClick={handleStopRecording}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors"
              >
                <StopRecoding className="w-[45] h-[45]" />
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
              </div>
              <span>•</span>
              <span>Auto-stop after 10s silence</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}