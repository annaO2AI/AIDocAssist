'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TranscriptMessage } from '../types';

interface UseWebSocketProps {
  sessionId: string;
  onMessage: (message: TranscriptMessage) => void;
  onConnectionChange: (connected: boolean) => void;
}

export function useWebSocket({ sessionId, onMessage, onConnectionChange }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

   const connect = useCallback(() => {
    // Cleanup any existing connection
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const wsUrl = `wss://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/ws/transcribe/19/1/1`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnectionChange(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: TranscriptMessage = JSON.parse(event.data);
          onMessage(message);
        } catch (err) {
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        onConnectionChange(false);
        
        // Don't reconnect if this was a normal closure
        if (event.code === 1000) return;

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = Math.min(
            Math.pow(2, reconnectAttemptsRef.current) * 1000,
            30000 // Max 30s delay
          );
          
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, timeout);
        } else {
          setError('Max reconnection attempts reached');
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        // Error event usually followed by close event, which handles reconnect
      };
      
    } catch (err) {
      setError('Failed to establish WebSocket connection');
      // Immediate reconnect attempt
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        connect();
      }
    }
  }, [ onMessage, onConnectionChange]);

  const sendAudioChunk = useCallback((audioData: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    onConnectionChange(false);
  }, [onConnectionChange]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    sendAudioChunk,
    disconnect,
    reconnect: connect
  };
}