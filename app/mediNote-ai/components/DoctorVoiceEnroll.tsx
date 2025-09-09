import React, { useState } from "react"
import { MicOff, Mic, AlertCircle, CheckCircle, X } from "lucide-react"
import { useAudioRecording } from "../hooks/useAudioRecording"
import { APIService } from "../service/api"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  id: number
}

// Function to convert audio blob to WAV format
const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const fileReader = new FileReader()

    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        // Convert to WAV
        const wavBuffer = audioBufferToWav(audioBuffer)
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })
        
        resolve(wavBlob)
      } catch (error) {
        reject(error)
      }
    }

    fileReader.onerror = () => reject(new Error('Failed to read audio file'))
    fileReader.readAsArrayBuffer(audioBlob)
  })
}

// Function to convert AudioBuffer to WAV format
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const length = buffer.length
  const numberOfChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const bytesPerSample = 2 // 16-bit
  const blockAlign = numberOfChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = length * blockAlign
  const bufferSize = 44 + dataSize

  const arrayBuffer = new ArrayBuffer(bufferSize)
  const view = new DataView(arrayBuffer)

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF') 
  view.setUint32(4, bufferSize - 8, true) 
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true) 

  // Convert audio buffer to PCM
  let offset = 44
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset, intSample, true)
      offset += 2
    }
  }

  return arrayBuffer
}

export const DoctorVoiceEnroll: React.FC<ModalProps> = ({ onClose, id }) => {
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
      // Convert audio blob to proper WAV format
      const wavBlob = await convertToWav(audioBlob)
      const audioFile = new File([wavBlob], `${id}.wav`, {
        type: "audio/wav",
      })
      
      const response = await APIService.enrollDoctorVoice(id, audioFile)
      if (response) {
        setShowSuccessPopup(true)
        // Don't close immediately, wait for user to acknowledge success
      }
    } catch (err) {
      setError(
        `Failed to enroll doctor ${id} voice: ${
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
            <h3 className="text-lg font-semibold">Enroll Doctor Voice</h3>
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
                <span>{isLoading ? "Processing..." : "Enroll Doctor Voice"}</span>
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
                Doctor voice enrolled successfully!
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