'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function DoctorVoiceEnrollment() {
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
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(250); // Collect data every 250ms
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Recording error:', err);
      setError(`Microphone access denied: ${err instanceof Error ? err.message : 'Please check your microphone permissions'}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const submitRecordingToAPI = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'doctor-voice.mp3');

      const response = await fetch(
        'https://doctorassistantai-athshnh6fggrbhby.centralus-01.azurewebsites.net/doctors/register_voice',
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
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
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
          
          // Verify audio quality and length
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          await new Promise((resolve) => {
            audio.onloadedmetadata = resolve;
          });
          
          if (audio.duration < 2) {
            throw new Error('Recording too short (minimum 2 seconds required)');
          }

          await submitRecordingToAPI(audioBlob);
          
          setIsEnrolled(true);
          setSuccessMessage('Doctor voice enrolled successfully!');
          cleanup();
        } catch (err) {
          setError(`Enrollment failed: ${err instanceof Error ? err.message : 'Please try again'}`);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    handleRecordingStop();
  }, [isRecording]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Voice Enrollment</h2>

      <div className="border rounded-lg p-6 mb-6">
        {!isEnrolled ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                <Mic className="w-5 h-5" />
                <span>{isSubmitting ? 'Processing...' : 'Start Recording'}</span>
              </button>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={stopRecording}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={recordingTime < 2}
                >
                  <MicOff className="w-5 h-5" />
                  <span>
                    Stop Recording ({recordingTime}s)
                    {recordingTime < 2 && ' (minimum 2s)'}
                  </span>
                </button>
                <div className="text-center text-sm text-gray-600">
                  {recordingTime < 2 ? (
                    <span>Please speak for {2 - recordingTime} more seconds</span>
                  ) : (
                    <span>Recording quality good</span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-3 text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>Doctor Voice enrollment completed</span>
          </div>
        )}
      </div>

      {/* {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start gap-2 text-red-600">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Enrollment Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                cleanup();
              }}
              className="mt-2 text-sm text-red-800 hover:underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )} */}

      {isSubmitting && (
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing your recording...</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-start gap-2 text-green-600">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Success</p>
            <p className="text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Enrollment Status</span>
          <span className="font-medium">
            {isEnrolled ? 'Completed' : 
             isRecording ? 'Recording' : 
             isSubmitting ? 'Processing' : 'Ready'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
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