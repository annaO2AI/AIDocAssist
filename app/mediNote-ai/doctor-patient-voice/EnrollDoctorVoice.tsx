import React, { useState } from 'react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { MicOff, Mic, AlertCircle } from 'lucide-react';
import { APIService } from '../service/api';

export default function EnrollDoctorVoice() {
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useAudioRecording();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // New state for popup visibility

  const handleStartEnrollment = async () => {
    setEnrollmentStatus(true);
    await startRecording();
  };

  const handleStopEnrollment = async () => {
    const audioBlob = await stopRecording();
    if (!audioBlob) {
      setError('Failed to capture audio');
      return;
    }
    setIsLoading(true);
    try {
      const audioFile = new File([audioBlob], `55.wav`, {
        type: 'audio/wav',
      });
      const response = await APIService.enrollDoctorVoice(55, audioFile);
      if (response) {
        // Handle success if needed
      }
    } catch (err) {
      setError(
        `Failed to enroll voice: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
      setEnrollmentStatus(false);
    }
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen); // Toggle popup visibility
  };

  return (
    <div className="px-1 mb-6 mt-6 relative ">
      <button
        onClick={togglePopup}
        className="text-md font-normal bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        Enroll Doctor Voice
      </button>
      {isPopupOpen && (
        <div
          id="EnrollDoctorVoice-popup"
          className="bg-white rounded-lg shadow-xl w-[400px] max-w-md mt-4 absolute right-0"
        >
          <div className="flex justify-between items-center border-b p-4 ">
            <h2 className="text-lg font-semibold">Voice Enrollment</h2>
            <button
              onClick={togglePopup}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-3 px-3 pb-5">
            {!enrollmentStatus ? (
              <button
                onClick={handleStartEnrollment}
                className="w-full flex items-center justify-center space-x-2 py-3 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                // disabled={!canStartRecording()}
              >
                <Mic className="w-5 h-5" />
                <span>Enroll Doctor Voice</span>
              </button>
            ) : (
              <button
                onClick={handleStopEnrollment}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <MicOff className="w-5 h-5" />
                <span>{isLoading ? 'saving ....' : `Stop Recording (${recordingTime}s)`}</span>
              </button>
            )}
            {enrollmentStatus && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-red-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Recording in progress...</span>
                </div>
              </div>
            )}
            {(error || recordingError) && (
              <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded mb-3">
                <AlertCircle className="w-5 h-5" />
                <span>{error || recordingError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}