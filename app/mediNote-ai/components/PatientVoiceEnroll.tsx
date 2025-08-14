import React, { useState } from "react"
import { MicOff, Mic, AlertCircle } from "lucide-react"
import { useAudioRecording } from "../hooks/useAudioRecording"
import { APIService } from "../service/api"
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  id: number
}

export const PatientVoiceEnroll: React.FC<ModalProps> = ({ onClose, id }) => {
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useAudioRecording()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrollmentStatus, setEnrollmentStatus] = useState(false)

  const handleStartEnrollment = async () => {
    setEnrollmentStatus(true)
    await startRecording()
  }

const handleStopEnrollment = async () => {
  const audioBlob = await stopRecording()
  if (!audioBlob) {
    setError("Failed to capture audio")
    return
  }
  setIsLoading(true)
  try {
    // Change file name and type to .wav
    const audioFile = new File([audioBlob], `${id}.wav`, {
      type: "audio/wav",
    })
    const response = await APIService.enrollPatientVoice(id, audioFile)
    if (response) {
      onClose()
    }
  } catch (err) {
    setError(
      `Failed to enroll ${id} voice: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    )
  } finally {
    setIsLoading(false)
    setEnrollmentStatus(false)
  }
}
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Enroll Patient Voice</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-3 px-3">
          {!enrollmentStatus ? (
            <button
              onClick={handleStartEnrollment}
              className="w-full flex items-center justify-center space-x-2 py-3 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              //   disabled={!canStartRecording()}
            >
              <Mic className="w-5 h-5" />
              <span>Enroll Patient Voice</span>
            </button>
          ) : (
            <button
              onClick={handleStopEnrollment}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <MicOff className="w-5 h-5" />
              <span> {isLoading ? "saving ...." : `Stop Recording (${recordingTime}s)`}</span>
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
    </div>
  )
}
