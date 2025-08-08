'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PatientVoiceEnrollment() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Recording error:', err);
      setError(`Microphone access denied: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const submitToAPI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'patient-voice.mp3');

      const response = await fetch(
        'https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/patients/register_voice',
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  useEffect(() => {
    const handleRecordingStop = async () => {
      if (!isRecording && audioChunksRef.current.length > 0) {
        setIsSubmitting(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Verify audio length
          const audio = new Audio();
          audio.src = URL.createObjectURL(audioBlob);
          
          await new Promise((resolve) => {
            audio.onloadedmetadata = resolve;
          });
          
          if (audio.duration < 1) {
            throw new Error('Recording too short');
          }

          // Submit to API
          await submitToAPI(audioBlob);
          
          setIsEnrolled(true);
          setSuccessMessage('Voice enrolled successfully!');
        } catch (err) {
          setError(`Submission failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    handleRecordingStop();
  }, [isRecording]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Voice Enrollment</h2>
      
      <div className="border rounded-lg p-6 mb-6">
        {!isEnrolled ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                <Mic className="w-5 h-5" />
                <span>{isSubmitting ? 'Processing...' : 'Start Recording'}</span>
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={stopRecording}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <MicOff className="w-5 h-5" />
                  <span>Stop Recording ({recordingTime}s)</span>
                </button>
                <div className="text-center text-sm text-gray-600">
                  {recordingTime < 3 ? (
                    <span>Speak clearly for at least {3 - recordingTime} more seconds</span>
                  ) : (
                    <span>Good recording length</span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-3 text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Patient Voice Enrollment successful!</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start gap-2 text-red-600">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-800 hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing your recording...</span>
        </div>
      )}

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Status</span>
          <span>
            {isEnrolled ? 'Completed' : 
             isRecording ? 'Recording' : 
             isSubmitting ? 'Processing' : 'Ready'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: isEnrolled ? '100%' : 
                isRecording ? `${Math.min(100, (recordingTime / 5) * 100)}%` : '0%' 
            }}
          />
        </div>
      </div>
    </div>
  );
}