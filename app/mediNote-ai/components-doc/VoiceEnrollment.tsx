'use client';

import { useEffect, useState, useCallback } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { APIService } from '../service/api';

interface EnrollmentStatus {
  doctors: boolean;
  patients: boolean;
}

interface VoiceEnrollmentProps {
  onEnrollmentComplete: (status: EnrollmentStatus) => void;
}

export default function VoiceEnrollment({ onEnrollmentComplete }: VoiceEnrollmentProps) {
  const [enrollmentStatus, setEnrollmentStatus] = useLocalStorage<EnrollmentStatus>(
    'voice-enrollment-status',
    { doctors: false, patients: false }
  );
  
  const [currentEnrollment, setCurrentEnrollment] = useState<'doctors' | 'patients' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isRecording, recordingTime, startRecording, stopRecording, error: recordingError } = useAudioRecording();

  const handleEnrollmentComplete = useCallback((status: EnrollmentStatus) => {
    onEnrollmentComplete(status);
  }, [onEnrollmentComplete]);

  const handleStartEnrollment = async (speakerType: 'doctors' | 'patients') => {
    setCurrentEnrollment(speakerType);
    setError(null);
    setSuccessMessage(null);
    await startRecording();
  };

  const handleStopEnrollment = async (speaker: 'doctors' | 'patients') => {
    if (!speaker) return;

    const audioBlob = await stopRecording();
    if (!audioBlob) {
      setError('Failed to capture audio');
      setCurrentEnrollment(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const audioFile = new File([audioBlob], `${currentEnrollment}-enrollment.webm`, {
        type: 'audio/webm'
      });

      await APIService.enrollVoice(speaker, audioFile);
      
      const newStatus = {
        ...enrollmentStatus,
        [speaker]: true
      };
      
      setEnrollmentStatus(newStatus);
      setSuccessMessage(`${speaker.charAt(0).toUpperCase() + speaker.slice(1)} voice enrolled successfully!`);
      handleEnrollmentComplete(newStatus);
      
    } catch (err) {
      setError(`Failed to enroll ${currentEnrollment} voice: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setCurrentEnrollment(null);
    }
  };

  const canStartRecording = (speakerType: 'doctors' | 'patients') => {
    return !isRecording && !isSubmitting && currentEnrollment !== speakerType;
  };

  useEffect(() => {
    handleEnrollmentComplete(enrollmentStatus);
  }, [enrollmentStatus, handleEnrollmentComplete]);

  return (
    <div className='voice-enrollment flex items-center justify-center'>
      <div className="bg-white rounded-lg shadow-md p-12 mb-12 w-[700px]">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctor Enrollment */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Doctor</h3>
              {enrollmentStatus.doctors && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            {canStartRecording('doctors') && (
              <button
                onClick={() => handleStartEnrollment('doctors')}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={!canStartRecording('doctors')}
              >
                <Mic className="w-5 h-5" />
                <span>Enroll Doctor Voice</span>
              </button>
            )}

            {currentEnrollment === 'doctors' && isRecording && (
              <div className="space-y-3">
                <button
                  onClick={() => handleStopEnrollment("doctors")}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <MicOff className="w-5 h-5" />
                  <span>Stop Recording ({recordingTime}s)</span>
                </button>
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Recording in progress...</span>
                  </div>
                </div>
              </div>
            )}

            {enrollmentStatus.doctors && (
              <div className="text-center py-3 text-green-600">
                ✓ Doctor voice enrolled
              </div>
            )}
          </div>

          {/* Patient Enrollment */}
          <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Patient</h3>
                {enrollmentStatus.patients && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              {canStartRecording('patients') && (
                <button
                  onClick={() => handleStartEnrollment('patients')}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  disabled={!canStartRecording('patients')}
                >
                  <Mic className="w-5 h-5" />
                  <span>Enroll Patient Voice</span>
                </button>
              )}

              {currentEnrollment === 'patients' && isRecording && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleStopEnrollment("patients")}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <MicOff className="w-5 h-5" />
                    <span>Stop Recording ({recordingTime}s)</span>
                  </button>
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Recording in progress...</span>
                    </div>
                  </div>
                </div>
              )}

              {enrollmentStatus.patients && (
                <div className="text-center py-3 text-green-600">
                  ✓ Patient voice enrolled
                </div>
              )}
          </div>
        </div>

        {/* Loading State */}
        {isSubmitting && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing enrollment...</span>
          </div>
        )}

        {/* Error Message */}
        {(error || recordingError) && (
          <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
            <AlertCircle className="w-5 h-5" />
            <span>{error || recordingError}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Enrollment Progress</span>
            <span>{Object.values(enrollmentStatus).filter(Boolean).length}/2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Object.values(enrollmentStatus).filter(Boolean).length * 50}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}