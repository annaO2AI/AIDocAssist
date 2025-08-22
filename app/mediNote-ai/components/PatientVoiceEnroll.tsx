import React, { useState } from "react"
import { MicOff, Mic, AlertCircle, CheckCircle, X } from "lucide-react"
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const handleStartEnrollment = async () => {
    setError(null)
    setShowSuccessPopup(false)
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
        setShowSuccessPopup(true)
        // Don't close immediately, wait for user to acknowledge success
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

  const handleSuccessContinue = () => {
    setShowSuccessPopup(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold">Enroll Patient Voice</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-3 p-4">
            {!enrollmentStatus ? (
              <button
                onClick={handleStartEnrollment}
                className="w-full flex items-center justify-center space-x-2 py-3 mb-4 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <Mic className="w-5 h-5" />
                <span>{isLoading ? "Processing..." : "Enroll Patient Voice"}</span>
              </button>
            ) : (
              <button
                onClick={handleStopEnrollment}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <MicOff className="w-5 h-5" />
                <span> {isLoading ? "Saving..." : `Stop Recording (${recordingTime}s)`}</span>
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
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error || recordingError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Success!
              </h3>
              <p className="text-gray-600 mb-6">
                Patient voice enrolled successfully!
              </p>
              <button
                onClick={handleSuccessContinue}
                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}