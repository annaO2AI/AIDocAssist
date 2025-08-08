'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { APIService } from '../service/api';
import type { HealthResponse } from '../types';

interface HealthCheckProps {
  onHealthy: (isHealthy: boolean) => void;
}

export default function HealthCheck({ onHealthy }: HealthCheckProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Memoized health check function
  const performHealthCheck = useCallback(async () => {
    setStatus('checking');
    setError('');
    
    try {
      const response: HealthResponse = await APIService.healthCheck();
      setStatus('healthy');
      setLastCheck(new Date().toLocaleTimeString());
      onHealthy(true);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Health check failed');
      onHealthy(false);
    }
  }, [onHealthy]); // Include all dependencies used in the callback

  useEffect(() => {
    performHealthCheck();
  }, [performHealthCheck]); // Now includes the memoized function

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">System Status</h2>
        <button
          onClick={performHealthCheck}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={status === 'checking'}
        >
          {status === 'checking' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
              Checking...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {status === 'checking' && (
          <>
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span>Checking backend status...</span>
          </>
        )}
        
        {status === 'healthy' && (
          <>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">Backend is healthy</span>
            {lastCheck && (
              <span className="text-sm text-gray-500">
                (Last checked: {lastCheck})
              </span>
            )}
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <span className="text-red-700">Backend unavailable</span>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}